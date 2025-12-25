# SPARC Methodology Documentation

## Overview

This directory contains all SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology artifacts for the Incident Replay Engine project.

## Directory Structure

```
sparc/
├── README.md                    # This file
├── phases/                      # Phase-specific SPARC artifacts
│   ├── phase-1-foundation/
│   ├── phase-2-assets-canvas/
│   ├── phase-3-envelopes/
│   ├── phase-4-timeline/
│   ├── phase-5-wizard-commands/
│   ├── phase-6-export/
│   └── phase-7-production/
├── decisions/                   # Architecture Decision Records (ADRs)
├── specifications/              # Feature specifications
└── templates/                   # SPARC templates for consistency
```

## SPARC Workflow

### Phase Structure

Each phase contains 5 SPARC stage documents:

1. **specification.md** - Requirements, user stories, acceptance criteria
2. **pseudocode.md** - Algorithm designs and data structures
3. **architecture.md** - Architecture decisions and ADRs for the phase
4. **refinement.md** - TDD log with Red-Green-Refactor cycles
5. **completion.md** - Completion checklist and sign-off

### Workflow Steps

#### 1. Specification (S)
- Document functional and non-functional requirements
- Define user stories and acceptance criteria
- Identify dependencies and constraints
- Template: `templates/specification-template.md`

#### 2. Pseudocode (P)
- Design algorithms at high level
- Define data structures and interfaces
- Analyze complexity
- Create test cases
- Template: `templates/pseudocode-template.md`

#### 3. Architecture (A)
- Make architecture decisions
- Document ADRs
- Consider alternatives
- Define implementation approach
- Template: `templates/architecture-decision-template.md`

#### 4. Refinement (R)
- Implement with Test-Driven Development
- Follow Red-Green-Refactor cycle
- Log iterations and issues
- Measure performance
- Template: `templates/refinement-log-template.md`

#### 5. Completion (C)
- Verify all acceptance criteria
- Check code quality and testing
- Ensure security and performance
- Persist decisions to memory
- Sign off on phase
- Template: `templates/completion-checklist-template.md`

## Integration with MCP Memory

Key decisions and patterns are persisted to MCP memory namespaces:

- `ire-architecture` - Architectural decisions
- `ire-domain` - Maritime domain knowledge
- `ire-patterns` - Design patterns and conventions
- `ire-testing` - Testing strategies
- `ire-performance` - Performance optimizations
- `ire-phase-{N}` - Phase-specific context

## Git Workflow

### Branch Strategy
```
main
├── develop
│   ├── phase-1/foundation
│   │   ├── feature/scene-context
│   │   ├── feature/prisma-schema
│   │   └── feature/konva-stage
│   ├── phase-2/assets-canvas
│   └── ...
```

### Commit Convention
```
Phase {N}: [{SPARC-Stage}] {Component} - {Description}

Examples:
- Phase 1: [Spec] SceneContext - Define state interface and actions
- Phase 1: [Pseudo] SceneReducer - Design reducer logic
- Phase 1: [Arch] ADR-001 - Document state management decision
- Phase 1: [TDD] SceneReducer - Implement with tests
- Phase 1: [Complete] Foundation - All acceptance criteria met
```

## Templates

All templates are located in `templates/` directory:

1. **specification-template.md** - Feature specification structure
2. **pseudocode-template.md** - Algorithm design structure
3. **architecture-decision-template.md** - ADR format
4. **refinement-log-template.md** - TDD iteration log
5. **completion-checklist-template.md** - Phase completion criteria

## Project Phases

### Phase 1: Foundation (Week 1)
- Next.js + Konva setup
- PostgreSQL schema
- SceneContext state management
- Basic API routes

### Phase 2: Assets & Canvas (Week 2-3)
- Asset library (vehicles, actors, safety objects)
- 5 Konva layers
- Drag and drop
- Object selection

### Phase 3: Operational Envelopes (Week 3-4)
- Forklift visibility cone
- MAFI trailer swing envelope
- Spotter line-of-sight
- Ramp clearance zones

### Phase 4: Timeline & Animation (Week 4-5)
- Keyframe system
- Linear interpolation
- Playback controls
- State snapshots

### Phase 5: Wizard & Commands (Week 5-6)
- 8-step project wizard
- Deterministic command parser
- 3-mode chatbot
- Validation

### Phase 6: Export Pipeline (Week 6-7)
- PNG export
- GIF generation
- MP4 video (ffmpeg)
- PDF packet

### Phase 7: Production Polish (Week 7-8)
- Undo/redo
- Authentication
- Security hardening
- Deployment

## References

- Project documentation: `/CLAUDE.md`
- Swarm configuration: `/.claude/swarm-config.json`
- MCP Memory: Use `mcp__claude-flow__memory_search` to query
- Implementation plan: `~/.claude/plans/piped-sparking-dongarra.md`

---

**Rule**: Document before implementing. Test before deploying. Persist before forgetting.
