# Phase 1: Foundation - Specification

## Overview
Establish the foundational infrastructure for the Incident Replay Engine, including Next.js setup, Konva canvas integration, PostgreSQL database schema, and core state management.

## Requirements

### Functional Requirements
- FR-1: Initialize Next.js 16 application with TypeScript strict mode
- FR-2: Set up Konva.js canvas with 5-layer architecture (Background, Object, Envelope, Measurement, UI)
- FR-3: Implement SceneContext with React Context + useReducer pattern
- FR-4: Create PostgreSQL schema with Prisma ORM (User, Project, SceneObject, Keyframe, ObjectState, ChangeHistory)
- FR-5: Implement basic API routes for project CRUD operations
- FR-6: Set up coordinate conversion system (world coordinates in meters, canvas in pixels)
- FR-7: Configure Redis for session management and caching

### Non-Functional Requirements
- NFR-1: Performance: Canvas must render at 60fps with up to 50 objects
- NFR-2: Security: All database queries parameterized via Prisma to prevent SQL injection
- NFR-3: Usability: State changes must be deterministic and logged to audit trail
- NFR-4: Maintainability: TypeScript strict mode with no `any` types
- NFR-5: Testability: 90%+ test coverage for reducer and coordinate conversion logic

## User Stories
- As a supervisor, I want to create a new incident reconstruction project so that I can begin documenting an incident
- As a supervisor, I want the system to save my work automatically so that I don't lose progress
- As a developer, I want a well-structured state management system so that I can predictably manage scene state
- As a developer, I want coordinate conversion utilities so that I can work in meters (court-safe) while rendering in pixels

## Acceptance Criteria
- [ ] Next.js application runs successfully on localhost:3000
- [ ] Konva Stage renders with all 5 layers in correct order
- [ ] SceneContext provides state and dispatch to all components
- [ ] Database schema deployed to PostgreSQL via Prisma migrations
- [ ] API route `/api/projects` supports GET (list), POST (create), GET by ID, PUT (update), DELETE
- [ ] Coordinate conversion functions tested with known inputs/outputs
- [ ] Redis connection established for session storage
- [ ] All TypeScript compilation passes with strict mode
- [ ] Jest tests achieve 90%+ coverage on reducer and utilities

## Dependencies
- Depends on: None (foundational phase)
- Depended by: Phase 2 (Assets & Canvas), Phase 3 (Envelopes), Phase 4 (Timeline)

## Technical Constraints
- Must use React 19.2.3 and Next.js 16.1.1 (already in package.json)
- Must use Konva 10.0.12 and react-konva 19.2.1
- Must use PostgreSQL (not SQLite in production)
- Must use Prisma ORM 7.2.0
- Canvas coordinate system must use meters for world, pixels for canvas
- State management must NOT use Redux or Zustand (React Context only)

## Architecture Decisions
- ADR-001: State Management Pattern (React Context + useReducer)
- ADR-002: Coordinate System (World=Meters, Canvas=Pixels)
- ADR-003: 5-Layer Konva Architecture

## Open Questions
- Q1: Should we implement optimistic updates for auto-save, or blocking saves?
  - Recommended: Debounced auto-save (5 seconds) with optimistic updates
- Q2: Should ChangeHistory table store full object snapshots or diffs?
  - Recommended: Full snapshots for simplicity, optimize later if needed

## References
- Project documentation: `/CLAUDE.md`
- Prisma schema: `/prisma/schema.prisma`
- SceneContext: `/context/SceneContext.tsx`
- Coordinate utilities: `/lib/coordinates.ts`
