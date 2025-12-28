# Current Phase: Phase 3 - Operational Envelopes

**Status**: Ready to Begin
**Previous Phase**: Phase 2 - Assets & Canvas (✅ COMPLETE)

## Phase 1 & 2 Completion Summary

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

## Next: Phase 3 - Operational Envelopes

**Core Business Value**: These 4 envelope types are the primary value proposition of the Incident Replay Engine.

### Required Implementations

1. **Forklift Visibility Cone & Blind Spot Overlay**
   - Vision cone: 120° arc, 15m range
   - Blind spots: Rear, forks, load-obstructed areas
   - Rendering: Green cone, red cross-hatched blind spots
   - Dynamic: Updates based on fork height and rotation
   - File: `lib/envelopes/forklift-vision.ts`

2. **MAFI Trailer Swing Envelope During Turns**
   - Input: Articulation angle (steering wheel control)
   - Calculation: Inner/outer sweep path
   - Pivot point: Rear axle visualization
   - Rendering: Yellow/orange warning zone
   - File: `lib/envelopes/mafi-swing.ts`

3. **Spotter Line-of-Sight Indicators**
   - Ray-casting: From spotter to target
   - Obstruction detection: Vehicles, ramps, stanchions
   - Rendering: Green line (clear) or red dashed (obstructed)
   - Alert: "OBSTRUCTED" label when blocked
   - File: `lib/envelopes/spotter-los.ts`

4. **Ramp Clearance Height Zones**
   - Metadata: Each ramp has clearance height
   - Detection: Automatic violation when vehicle height > clearance
   - Rendering: Purple dashed boundary, red markers
   - Alert: "⚠ +0.7m" (amount exceeding limit)
   - File: `lib/envelopes/ramp-clearance.ts`

### Implementation Strategy

**SPARC Workflow**:
1. Specification: Document each envelope type's requirements
2. Pseudocode: Algorithm design for calculations
3. Architecture: Integration with EnvelopeLayer
4. Refinement: TDD implementation (Red-Green-Refactor)
5. Completion: Integration tests, visual verification

**Swarm Coordination**:
- Geometry Expert: Ray-casting, polygon math, arc calculations
- Canvas Coder: EnvelopeLayer rendering, performance optimization
- Tester: Unit tests for each envelope calculation
- Coordinator: Integration and validation

### Acceptance Criteria

- [ ] All 4 envelope types implemented
- [ ] Envelope calculations use world coordinates (meters)
- [ ] Envelopes update dynamically on object movement
- [ ] Toggle controls for each envelope type
- [ ] Performance optimization (memoization, selective rendering)
- [ ] Unit tests for each envelope (90%+ coverage)
- [ ] Visual accuracy verified against maritime standards
- [ ] Integration with existing EnvelopeLayer component

### Timeline

**Estimated**: Week 3-4 (7-10 days)
**Fast-Track (YOLO Mode)**: 2-3 days

### Files to Create/Modify

**New Files**:
- `lib/envelopes/forklift-vision.ts`
- `lib/envelopes/mafi-swing.ts`
- `lib/envelopes/spotter-los.ts`
- `lib/envelopes/ramp-clearance.ts`
- `__tests__/lib/envelopes/*.test.ts`
- `docs/sparc/phases/phase-3-envelopes.md`

**Modify**:
- `components/canvas/layers/EnvelopeLayer.tsx` (integrate 4 envelope renderers)
- `types/envelopes.ts` (envelope type definitions)
- `lib/geometry.ts` (add any missing utilities)

---

**Ready to Begin**: Yes ✅
**Dependencies Met**: Phase 1 & 2 complete
**Database Running**: `docker-compose up -d`
**Build Status**: Passing
**Test Status**: 50/53 passing (acceptable)
