import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  // TODO: Add JWT authentication
  const userId = 'temp-user-id';

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      objects: true,
      keyframes: true
    }
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  // TODO: Add JWT authentication
  const userId = 'temp-user-id';

  const data = await req.json();

  const project = await prisma.project.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      incidentDate: new Date(data.incidentDate),
      incidentTime: new Date(`1970-01-01T${data.incidentTime}`),
      sceneType: data.sceneType,
      dimensions: data.dimensions
    }
  });

  return NextResponse.json(project, { status: 201 });
}
