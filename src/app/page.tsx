import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo-user";
import { TaskApp } from "@/components/TaskApp";

// Always personalized, DB-backed content — never prerender statically.
export const dynamic = "force-dynamic";

async function getOrCreateDefaultProject() {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: { id: DEMO_USER_ID, email: "demo@example.com", name: "Demo User" },
  });

  const existing = await prisma.project.findFirst({
    where: { userId: DEMO_USER_ID, archived: false },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.project.create({
    data: { title: "My Project", userId: DEMO_USER_ID },
  });
}

export default async function Home() {
  const project = await getOrCreateDefaultProject();
  const tasks = await prisma.task.findMany({
    where: { projectId: project.id },
    orderBy: { order: "asc" },
  });

  return <TaskApp project={project} initialTasks={tasks} />;
}
