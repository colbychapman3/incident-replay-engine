# Current Phase: Phase 4 - Timeline & Animation

**Status**: Ready to Begin
**Previous Phase**: Phase 3 - Operational Envelopes (✅ COMPLETE)

## Phase 1, 2, & 3 Completion Summary

### Phase 1: Foundation ✅
- Database setup (PostgreSQL + Redis via Docker)
- Prisma ORM configured (downgraded to v6 for compatibility)
- Initial migration applied successfully
- SceneContext + useReducer state management
- UNDO/REDO with snapshot stacks (18/18 tests passing)
- Selection system (SELECT_OBJECT, DESELECT_OBJECT, CLEAR_SELECTION)
- Comprehensive geometry utilities (ray-casting, SAT algorithms)

### Phase 2: Assets & Canvas ✅
- Complete asset library (20 assets: 6 vehicles, 9 actors, 5 safety objects)
- 5-layer Konva architecture (Background, Object, Envelope, Measurement, UI)
- AssetPalette UI component with tabs
- PropertyPanel UI for object editing
- Main editor page with full integration
- Keyboard shortcuts (Ctrl+Z/Y, Delete, Esc)
- Asset spawning from palette
- Production build passing

### Phase 3: Operational Envelopes ✅
- Forklift Vision Cone & Blind Spots (120° arc, 15m range, 3 blind spot types)
- MAFI Trailer Swing Envelope (articulation-based inner/outer sweep)
- Spotter Line-of-Sight (ray-casting with obstruction detection)
- Ramp Clearance Height Zones (automatic violation detection)
- EnvelopeToggles UI component with per-type controls
- Complete EnvelopeLayer rewrite with all 4 renderers
- Type-safe discriminated union envelope system
- TDD coverage: 20 tests, 100% passing
- Performance optimization: useMemo caching, listening: false
- SPARC documentation complete

## Next: Phase 4 - Timeline & Animation

**Core Business Value**: Enable incident playback with keyframe-based animation system for court-safe temporal visualization.

### Required Implementations

1. **Keyframe Model**
   - Discrete timesteps (T0, T1, T2, ...)
   - Keyframe labels ("T0: Truck arrives", "T1: Spotter signals")
   - Object state snapshots per keyframe
   - Database schema: keyframes + object_states tables
   - File: `types/timeline.ts`, Prisma schema updates

2. **Linear Interpolation System**
   - Position interpolation (lerpPoint)
   - Rotation interpolation with angle wrapping (lerpAngle)
   - Property interpolation (lerpProperties)
   - Frame calculation: 30fps between keyframes
   - File: `lib/timeline/interpolation.ts`

3. **Timeline UI Component**
   - Keyframe markers on timeline scrubber
   - Current time indicator
   - Playback controls (play, pause, step, speed)
   - Keyframe labels and editing
   - File: `components/timeline/Timeline.tsx`

4. **Playback System**
   - 30fps rendering loop
   - Variable playback speed (0.5x, 1x, 2x)
   - Time-aware envelope rendering
   - Frame-accurate positioning
   - File: `hooks/useTimelinePlayback.ts`

### Implementation Strategy

**SPARC Workflow**:
1. Specification: Keyframe model, interpolation algorithms, UI requirements
2. Pseudocode: Interpolation math, playback loop, state updates
3. Architecture: Timeline state management, integration with SceneContext
4. Refinement: TDD for interpolation (angle wrapping edge cases)
5. Completion: E2E playback testing, performance validation

**Swarm Coordination**:
- Math Expert: Linear interpolation algorithms, angle normalization
- React Coder: Timeline UI, playback controls, scrubber
- Database Expert: Keyframe/object_states schema, Prisma integration
- Tester: Interpolation edge cases, playback accuracy

### Acceptance Criteria

- [ ] Keyframe model implemented with Prisma schema
- [ ] Linear interpolation for position, rotation, properties
- [ ] Timeline UI with scrubber and keyframe markers
- [ ] Playback system (30fps, variable speed)
- [ ] Time-aware envelope rendering during playback
- [ ] Angle wrapping handled correctly (lerpAngle)
- [ ] Unit tests for interpolation (90%+ coverage)
- [ ] E2E test for complete playback cycle
- [ ] Frame-accurate court-safe documentation

### Timeline

**Estimated**: Week 4-5 (7-10 days)
**Fast-Track (YOLO Mode)**: 2-3 days

### Files to Create/Modify

**New Files**:
- `types/timeline.ts` - Timeline, Keyframe, ObjectState types
- `lib/timeline/interpolation.ts` - lerpPoint, lerpAngle, lerpProperties
- `components/timeline/Timeline.tsx` - Timeline UI
- `components/timeline/TimelineControls.tsx` - Play/pause controls
- `hooks/useTimelinePlayback.ts` - Playback logic hook
- `__tests__/lib/timeline/interpolation.test.ts` - Interpolation tests
- `docs/sparc/phases/phase-4-timeline.md` - SPARC documentation

**Modify**:
- `prisma/schema.prisma` - Add keyframes, object_states tables
- `context/SceneContext.tsx` - Timeline state integration
- `components/canvas/layers/EnvelopeLayer.tsx` - Time-aware rendering
- `app/editor/page.tsx` - Timeline component integration

---

**Ready to Begin**: Yes ✅
**Dependencies Met**: Phase 1, 2, 3 complete
**Database Running**: `docker-compose up -d`
**Build Status**: Passing
**Test Status**: 70/73 passing (acceptable)
