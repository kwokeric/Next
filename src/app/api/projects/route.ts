import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo-user";

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { userId: DEMO_USER_ID, archived: false },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      title,
      color: typeof body.color === "string" ? body.color : null,
      userId: DEMO_USER_ID,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
