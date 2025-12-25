# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Incident Replay Engine (IRE)** - A deterministic, court-safe incident reconstruction tool for maritime and port operations. Built for supervisors and safety personnel to create accurate, repeatable incident visualizations.

**Core Principle**: Zero assumptions. Truth-preserving reconstruction. No guessing, no inference.

**Timeline**: 6-8 weeks MVP (7 phases)
**Methodology**: SPARC + Claude-Flow swarm coordination + TDD

## Commands

### Development
```bash
npm run dev              # Start Next.js dev server (http://localhost:3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
npm run type-check       # TypeScript type checking
```

### Database (Prisma)
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma db seed       # Seed database with default assets
npx prisma studio        # Visual database browser
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (target: 90%+)
npm run test:e2e         # Playwright E2E tests
```

### Docker (Local Development)
```bash
docker-compose up -d     # Start PostgreSQL + Redis
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

### Export Pipeline (ffmpeg required)
```bash
# Install ffmpeg (required for MP4/GIF export)
# macOS: brew install ffmpeg
# Ubuntu/WSL: sudo apt-get install ffmpeg
# Windows: Download from ffmpeg.org
```

## Architecture Overview

### System Layers
```
Next.js 14 App Router (TypeScript strict mode)
├── Canvas Editor (Konva.js - 5 layers)
│   ├── BackgroundLayer (grid, scene template)
│   ├── ObjectLayer (vehicles, actors, safety objects)
│   ├── EnvelopeLayer (operational overlays)
│   ├── MeasurementLayer (temporary tools)
│   └── UILayer (selection, labels)
├── Scene State (React Context + useReducer)
│   └── Auto-save → PostgreSQL + Redis
├── Core Engines
│   ├── Operational Envelope Engine (4 required types)
│   ├── Timeline & Interpolation System
│   ├── Command Parser (deterministic, no inference)
│   └── Project Wizard (8-step validation)
└── Export Pipeline
    ├── PNG (canvas.toDataURL)
    ├── GIF (server-side, node-canvas)
    ├── MP4 (server-side, ffmpeg)
    └── PDF (jsPDF + diagrams + legend + timeline)
```

### Key Architectural Patterns

**State Management**:
- Single `SceneContext` with `useReducer` (no Redux/Zustand)
- Actions: ADD_OBJECT, MOVE_OBJECT, ROTATE_OBJECT, DELETE_OBJECT, SET_KEYFRAME, TOGGLE_ENVELOPE, UNDO, REDO
- All state changes logged for audit trail

**Coordinate System**:
- World coordinates: **Meters** (maritime standard)
- Canvas coordinates: **Pixels**
- Conversion: `pixelsPerMeter` (adjustable zoom)
- Never show pixels to user (court-safe documentation)

**Persistence Pattern**:
- Auto-save every 5 seconds (debounced)
- Change history for undo/redo (50+ actions)
- All object states stored per keyframe
- JSONB columns for extensible properties

**Deterministic Command System**:
- Parse → Validate → Clarify (if ambiguous) → Execute
- NEVER guess user intent
- ALWAYS halt on missing/ambiguous data
- Provide numbered options for disambiguation

## Tech Stack

### Frontend
- **Framework**: Next.js 14 App Router
- **Language**: TypeScript (strict mode, ES modules)
- **Canvas**: Konva.js via react-konva
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **State**: React Context + useReducer
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 22.17.1
- **Database**: PostgreSQL 15 (via Prisma ORM)
- **Cache/Queue**: Redis 7 (sessions + Bull job queue)
- **Video Encoding**: ffmpeg (server-side MP4/GIF)
- **PDF Generation**: jsPDF + jsPDF-AutoTable

### Infrastructure
- **Development**: Docker Compose (PostgreSQL + Redis + app)
- **Deployment**: Render.com (Docker + managed DB/Redis)
- **Monitoring**: Winston logging, health checks

## Implementation Phases (Reference)

**Current Phase**: Check `/docs/current-phase.md`

1. **Foundation** (Week 1): Next.js + Konva + PostgreSQL + SceneContext
2. **Assets & Canvas** (Week 2-3): All asset types + 5 Konva layers + drag/drop
3. **Operational Envelopes** (Week 3-4): 4 envelope types (forklift vision, MAFI swing, spotter LOS, ramp clearance)
4. **Timeline & Animation** (Week 4-5): Keyframes + interpolation + playback
5. **Wizard & Commands** (Week 5-6): 8-step wizard + 3-mode chatbot
6. **Export Pipeline** (Week 6-7): PNG + GIF + MP4 + PDF
7. **Polish & Production** (Week 7-8): Undo/redo + auth + security + deployment

## Critical File Structure

```
/app
  /api
    /export
      /gif/route.ts          # Server-side GIF generation
      /mp4/route.ts          # Server-side MP4 with ffmpeg
      /pdf/route.ts          # PDF packet generation
    /projects/route.ts       # Project CRUD
  /projects/[id]/page.tsx    # Main editor view
  /dashboard/page.tsx        # Project list

/components
  /canvas
    SceneEditor.tsx          # Main Konva Stage wrapper
    *Layer.tsx               # 5 layer components
    *Node.tsx                # Object renderers (Vehicle, Actor, SafetyObject)
    *Overlay.tsx             # 4 envelope overlays
  /timeline
    Timeline.tsx             # Timeline UI + scrubber
    TimelineControls.tsx     # Play/pause/step
  /wizard
    ProjectWizard.tsx        # 8-step wizard container
  /chatbot
    CommandChatbot.tsx       # 3-mode chatbot (Command/Coach/Report)

/context
  SceneContext.tsx           # ⚡ CRITICAL: Global scene state + reducer

/lib
  /envelopes
    forklift-vision.ts       # Vision cone + blind spot calculator
    mafi-swing.ts            # Trailer swing envelope
    spotter-los.ts           # Line-of-sight with obstruction
    ramp-clearance.ts        # Height zone violations
  /timeline
    interpolation.ts         # Linear interpolation (lerpPoint, lerpAngle)
  /commands
    parser.ts                # Deterministic command parser
  /export
    frame-renderer.ts        # Server-side canvas rendering
  coordinates.ts             # World ↔ Canvas conversion
  geometry.ts                # Distance, intersection, collision detection

/prisma
  schema.prisma              # Database schema (projects, scene_objects, keyframes, object_states)

/public/assets
  /vehicles/*.json + *.png   # 6 vehicle types with metadata
  /actors/*.json + *.png     # 9 actor roles with PPE color coding
  /safety/*.json + *.png     # 5 safety object types

/types
  scene.ts                   # SceneState, SceneObject, SceneAction
  timeline.ts                # Timeline, Keyframe, ObjectState
  assets.ts                  # VehicleAsset, ActorAsset, SafetyObjectAsset
  envelopes.ts               # OperationalEnvelope types
```

## Operational Envelopes (Core Business Logic)

All 4 envelope types are **REQUIRED** for MVP. These are the core value proposition.

### 1. Forklift Visibility Cone & Blind Spot Overlay
- **Vision cone**: 120° arc, 15m range from driver position
- **Blind spots**: Rear, forks, load-obstructed areas
- **Rendering**: Green semi-transparent cone, red cross-hatched blind spots
- **Dynamic**: Updates based on fork height and rotation

### 2. MAFI Trailer Swing Envelope During Turns
- **Input**: Articulation angle (steering wheel control)
- **Calculation**: Inner/outer sweep path during turns
- **Pivot point**: Rear axle of truck (visualized)
- **Rendering**: Yellow/orange warning zone

### 3. Spotter Line-of-Sight Indicators
- **Ray-casting**: From spotter to target vehicle/hazard
- **Obstruction detection**: Vehicles, ramps, stanchions block view
- **Rendering**: Green solid line (clear) or red dashed (obstructed)
- **Alert**: "OBSTRUCTED" label when view blocked

### 4. Ramp Clearance Height Zones
- **Metadata**: Each ramp has clearance height (e.g., 3.5m)
- **Detection**: Automatic violation when vehicle height > clearance
- **Rendering**: Purple dashed boundary, red violation markers
- **Alert**: "⚠ +0.7m" (amount exceeding limit)

**Implementation Notes**:
- All envelopes use **world coordinates** (meters)
- Calculations cached via `useMemo` (only recalculate on position/rotation change)
- Toggleable per object or globally
- Time-aware (envelopes update during timeline playback)

## Timeline & Interpolation System

### Keyframe Model
- **Discrete keyframes**: T0, T1, T2, ... (labeled, e.g., "T0: Truck arrives")
- **Object states**: Snapshot of position, rotation, properties per object
- **Interpolation**: Linear interpolation between keyframes
- **Playback**: 30fps, variable speed (0.5x, 1x, 2x)

### Linear Interpolation (MVP)
```typescript
// Position interpolation
lerpPoint(start: Point, end: Point, t: number): Point

// Rotation interpolation (handles angle wrapping)
lerpAngle(start: number, end: number, t: number): number

// Property interpolation
lerpProperties(start: Record, end: Record, t: number): Record
```

**Court-Safe Requirements**:
- Frame-by-frame accuracy
- No physics assumptions (constant velocity implied)
- User can add more keyframes for complex maneuvers
- Validation warnings for unrealistic movements

## Database Schema (Prisma)

### Core Tables
- **projects**: Project metadata (name, description, incident date/time, dimensions)
- **scene_objects**: Vehicles, actors, safety objects (assetId, type, locked, properties JSONB)
- **keyframes**: Timeline keyframes (label, timestamp, description)
- **object_states**: Object snapshots at each keyframe (position, rotation, properties JSONB, visible)
- **change_history**: Audit trail (action, targetId, oldValue JSONB, newValue JSONB, timestamp)

### Key Patterns
- **JSONB columns**: Extensible properties without schema changes
- **Unique constraint**: (keyframe_id, object_id) - one state per object per keyframe
- **Indexes**: project_id, user_id, keyframe_id for performance
- **Soft deletes**: Consider `deleted: boolean` for keyframes

## Export Pipeline Architecture

### PNG Export (Client-Side)
```typescript
// Hide UI layer → canvas.toDataURL({ pixelRatio: 2 }) → Download
```

### GIF/MP4 Export (Server-Side)
```
Client request → Next.js API route → Bull job queue → Worker process
Worker: Render each frame (node-canvas) → Encode (gifencoder or ffmpeg) → Return file
Client: Poll job status → Download when complete
```

**Why Server-Side**:
- Browser limitations (no MP4 encoding, GIF slow)
- ffmpeg required for MP4
- Background processing (30-second incident = 900 frames at 30fps)

### PDF Packet Structure
1. **Cover page**: Project name, incident date, description
2. **Keyframe diagrams**: PNG snapshots of each keyframe
3. **Legend**: Asset types, envelope colors, scale reference
4. **Timeline table**: Keyframe labels + timestamps
5. **Notes section**: User annotations

## SPARC + Swarm Coordination

### SPARC Workflow (Per Feature)
1. **Specification**: Document requirements in `/docs/specs/[feature].md`
2. **Pseudocode**: Algorithm comments in source files
3. **Architecture**: Design decisions in `/docs/architecture/`
4. **Refinement**: TDD with Jest (Red-Green-Refactor)
5. **Completion**: Integration tests, code review agent

### Swarm Initialization (Claude-Flow MCP)
```bash
# Initialize hierarchical swarm (coordinator + specialists)
npx claude-flow swarm init hierarchical --max-agents 8

# Spawn specialists for phase
npx claude-flow agent spawn coder --capabilities "react-components,canvas"
npx claude-flow agent spawn tester --capabilities "tdd,unit-tests"
npx claude-flow agent spawn geometry-expert --capabilities "ray-casting,polygon-math"

# Orchestrate parallel tasks
npx claude-flow task orchestrate "
  1. Implement forklift-vision.ts
  2. Implement mafi-swing.ts
  3. Write tests for envelopes
" --strategy parallel --max-agents 5
```

### Memory Persistence
```bash
# Store decisions across sessions
npx claude-flow memory-usage store \
  --key "envelope-calculations" \
  --value "Use memoization, only recalc on position/rotation change" \
  --namespace "ire-project"

# Retrieve later
npx claude-flow memory-search --pattern "envelope" --namespace "ire-project"
```

## Asset Creation Requirements

### Vehicle Sprites (Top-Down)
- **Format**: PNG with transparency, 512x512px
- **Pivot point**: Marked (e.g., rear axle for trailers)
- **Metadata**: JSON with dimensions (meters), turning radius, constraints
- **Required**: MAFI truck, MAFI trailer, forklift, POV, gear wagon, water van

### Actor Icons
- **Format**: PNG with transparency, 128x128px
- **PPE color coding**: Hard hat + vest colors by role
- **Facing indicator**: Arrow showing direction
- **Required**: 9 roles (Driver, Spotter, Flagger, Header, Stevedore, Gear person, Water person, Chief officer, Shipmate)

### Safety Objects
- **Required**: Orange cone, caution tape, stop sign, directional arrow, impact marker
- **Format**: Simple vector graphics → PNG

## Security & Compliance

### Court-Safe Documentation Requirements
- All measurements in **meters** (never show pixels)
- Scale reference in PDF exports (e.g., "1cm = 5m")
- Change history logged (audit trail)
- Export metadata: project name, date, creator, export timestamp
- No assumptions by system (deterministic commands only)

### Security Checklist
- [ ] CSP headers (Content Security Policy)
- [ ] Rate limiting on export endpoints
- [ ] Input sanitization (XSS prevention)
- [ ] Prisma parameterized queries (SQL injection prevention)
- [ ] JWT token authentication
- [ ] File upload validation (if background images supported)

## Performance Optimization

### Canvas Performance
- **Layer optimization**: Only re-render EnvelopeLayer when objects move
- **Envelope caching**: `useMemo` for calculations (position/rotation dependencies)
- **Hit detection**: Disable on EnvelopeLayer (`listening: false`)
- **Throttle**: Use `requestAnimationFrame` for smooth rendering

### Database Performance
- **Indexes**: project_id, user_id, keyframe_id
- **Auto-save debouncing**: 5-second delay
- **Batch updates**: Combine multiple object states in single transaction

## Testing Strategy

### Unit Tests (Jest)
- **Geometry**: Distance, intersection, collision detection
- **Interpolation**: lerpPoint, lerpAngle (test angle wrapping)
- **Command Parser**: Tokenization, validation, disambiguation
- **Coverage Target**: 90%+ for core logic

### E2E Tests (Playwright)
- Wizard flow (8 steps, validation at each step)
- Canvas interactions (drag, rotate, delete)
- Timeline playback (play, pause, scrub)
- Export pipeline (PNG, PDF)

### Manual QA
- Envelope accuracy (verify with maritime expert)
- Export quality (open MP4 in VLC, PDF in Acrobat)
- Cross-browser testing (Chrome, Firefox, Safari)

## Development Best Practices

### File Size Limits
- Keep components under **500 lines**
- Extract utilities to `/lib` when reusable
- Split large envelopes into sub-calculators

### TypeScript Strictness
- `strict: true` in tsconfig.json
- No `any` types (use `unknown` if necessary)
- Define all prop interfaces

### Git Workflow
- Commit per feature/fix (not per file)
- TDD: Tests first, then implementation, then commit
- Message format: "Phase X: [Feature] - [Description]"

## Deployment (Render.com)

### Services
- **Web**: Next.js app (Docker)
- **Database**: PostgreSQL 15 (managed)
- **Cache**: Redis 7 (managed)

### Environment Variables
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
NODE_ENV=production
```

### Health Check
- Endpoint: `/api/health`
- Checks: Database connection, Redis connection
- Returns: 200 (healthy) or 503 (unhealthy)

## Troubleshooting

### Canvas not rendering
- Check Konva Stage dimensions
- Verify layers are in correct order
- Inspect browser console for errors

### Envelope calculations incorrect
- Verify world coordinates (meters, not pixels)
- Check `pixelsPerMeter` conversion
- Test with known positions (unit tests)

### Export fails
- **MP4**: Check ffmpeg installed (`which ffmpeg`)
- **GIF**: Verify `node-canvas` dependencies
- **PDF**: Check jsPDF version compatibility

### Performance lag
- Profile with React DevTools
- Check envelope caching (memoization)
- Reduce layer re-renders (shouldComponentUpdate)

## References

- **Implementation Plan**: `/home/colby/.claude/plans/breezy-toasting-dahl.md`
- **SPARC Docs**: https://github.com/ruvnet/claude-flow
- **Konva.js**: https://konvajs.org/docs/react/
- **Next.js 14**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs

**Rule**: Build for accuracy first, performance second. Court-safe documentation is non-negotiable.
