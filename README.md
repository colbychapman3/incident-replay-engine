# Incident Replay Engine (IRE)

A deterministic, court-safe incident reconstruction tool for maritime and port operations.

## Overview

The IRE enables supervisors and safety personnel to accurately recreate vehicle and personnel incidents for:
- Training and safety reviews
- SOP enforcement
- Legal and insurance documentation

**Core Principle**: Zero assumptions. Truth-preserving reconstruction. No guessing, no inference.

## Features (MVP)

- ✅ 2D top-down scene editor (vessel decks + port roads)
- ✅ Asset library: 6 vehicles, 9 actor roles, 5 safety objects
- ✅ 4 operational envelope overlays:
  - Forklift visibility cone & blind spot overlay
  - MAFI trailer swing envelope during turns
  - Spotter line-of-sight indicators with obstruction detection
  - Ramp clearance height zones with violation alerts
- ✅ Timeline system with keyframes and interpolation
- ✅ Guided wizard (8-step project creation)
- ✅ Deterministic command chatbot (3 modes: Command, Coach, Report)
- ✅ Multi-format export: PNG, GIF, MP4, PDF packet

## Quick Start

### Prerequisites
- Node.js 22.17.1+
- PostgreSQL 15
- Redis 7
- ffmpeg (for video export)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL + Redis (Docker)
docker-compose up -d

# Initialize database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Visit http://localhost:3000

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed architecture, commands, and development guidelines.

### Key Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm test                 # Run tests
npx prisma studio        # Visual database browser
docker-compose up -d     # Start local PostgreSQL + Redis
```

## Project Structure

```
/app                    # Next.js 14 App Router
  /api                  # API routes (export, projects)
  /projects/[id]        # Main editor view
  /dashboard            # Project list
/components
  /canvas               # Konva.js scene editor
  /timeline             # Keyframe timeline UI
  /wizard               # 8-step project wizard
  /chatbot              # 3-mode command chatbot
/context                # React Context (scene state)
/lib
  /envelopes            # 4 operational envelope calculators
  /timeline             # Interpolation algorithms
  /commands             # Deterministic command parser
  /export               # PNG/GIF/MP4/PDF generation
/prisma                 # Database schema
/public/assets          # Vehicle/actor/safety object sprites + metadata
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React, Konva.js, Tailwind CSS
- **Backend**: Node.js, PostgreSQL, Redis, Prisma ORM
- **Export**: ffmpeg (MP4/GIF), jsPDF (PDF)
- **Deployment**: Render.com (Docker)

## Implementation Timeline

- **Week 1**: Foundation (Next.js + Konva + PostgreSQL)
- **Week 2-3**: Assets + Core Canvas Engine
- **Week 3-4**: Operational Envelopes
- **Week 4-5**: Timeline & Animation
- **Week 5-6**: Wizard & Command System
- **Week 6-7**: Export Pipeline
- **Week 7-8**: Polish & Production

## Testing

```bash
npm test                 # Unit tests (Jest)
npm run test:coverage    # Coverage report (target: 90%+)
npm run test:e2e         # E2E tests (Playwright)
```

## License

[Add license here]

## Contributing

See [CLAUDE.md](./CLAUDE.md) for SPARC methodology and development workflow.

---

**Rule**: Build for accuracy first, performance second. Court-safe documentation is non-negotiable.
