import { PrismaClient, TaskStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateKeyBetween } from "fractional-indexing";

try {
  process.loadEnvFile();
} catch {
  // no .env file — DATABASE_URL must already be in the environment
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    update: {},
    create: { id: "demo-user", email: "demo@example.com", name: "Demo User" },
  });

  const project = await prisma.project.create({
    data: { title: "Clean the Apartment", userId: user.id },
  });

  // Tracks the last sibling's order key per parent, so each parent gets its
  // own independent fractional-index sequence.
  const lastOrderByParent = new Map<string | null, string | null>();

  async function addTask(
    title: string,
    parentTaskId: string | null = null,
    status: TaskStatus = TaskStatus.TODO
  ) {
    const prevOrder = lastOrderByParent.get(parentTaskId) ?? null;
    const order = generateKeyBetween(prevOrder, null);
    lastOrderByParent.set(parentTaskId, order);
    return prisma.task.create({
      data: { projectId: project.id, parentTaskId, title, order, status },
    });
  }

  const kitchen = await addTask("Clean the kitchen");
  const washDishes = await addTask("Wash dishes", kitchen.id);
  await addTask("Walk to the sink", washDishes.id);
  await addTask("Turn on the faucet", washDishes.id);
  await addTask("Pick up one plate", washDishes.id);

  await addTask("Vacuum living room", null, TaskStatus.DONE);
  await addTask("Take out trash");
  await addTask("Pick up medication");

  const japanTrip = await addTask("Plan for Japan trip");
  await addTask("Book flights", japanTrip.id);
  await addTask("Reserve hotels", japanTrip.id);
  await addTask("Make itinerary", japanTrip.id);

  console.log(`Seeded project "${project.title}" for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
