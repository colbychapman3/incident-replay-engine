import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { CreateProjectSchema, safeValidateRequest } from '@/lib/validation';

/**
 * GET /api/projects
 * List all projects for authenticated user
 * Requires: JWT authentication
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication required
    const user = await getAuthUser(req);

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        objects: true,
        keyframes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    // Authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    // Other errors
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create new project
 * Requires: JWT authentication + input validation
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication required
    const user = await getAuthUser(req);

    // Parse and validate request body
    const body = await req.json();
    const validation = safeValidateRequest(CreateProjectSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create project in database
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: data.name,
        description: data.description || null,
        incidentDate: new Date(data.incidentDate),
        incidentTime: data.incidentTime
          ? new Date(`1970-01-01T${data.incidentTime}`)
          : null,
        location: data.location || null,
        sceneType: data.sceneType,
        dimensions: data.dimensions
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    // Authentication error
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: error.message },
        { status: 401 }
      );
    }

    // Database error
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
