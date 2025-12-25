# ADR-001: State Management Pattern

## Status
Accepted

## Context
The Incident Replay Engine requires managing complex scene state including objects, keyframes, timeline, envelopes, and change history. We need a state management solution that is:
- Predictable and deterministic (critical for court-safe documentation)
- Simple to understand and maintain
- Capable of handling undo/redo functionality
- Testable with high coverage

Options considered: Redux, Zustand, MobX, Recoil, React Context + useReducer.

## Decision
Use **React Context + useReducer** pattern with a single `SceneContext` provider.

### Implementation Details
- Single `SceneContext` at app root in `layout.tsx`
- Reducer function in `context/scene-reducer.ts`
- Action types defined in `types/scene.ts` as discriminated union
- All state changes go through reducer dispatch (no direct mutations)
- Reducer creates `ChangeRecord` entries for undo/redo stack

### Action Types
```typescript
type SceneAction =
  | { type: 'ADD_OBJECT'; payload: SceneObject }
  | { type: 'MOVE_OBJECT'; payload: { id: string; position: Point } }
  | { type: 'ROTATE_OBJECT'; payload: { id: string; rotation: number } }
  | { type: 'DELETE_OBJECT'; payload: { id: string } }
  | { type: 'SET_KEYFRAME'; payload: number }
  | { type: 'TOGGLE_ENVELOPE'; payload: EnvelopeType }
  | { type: 'UNDO' }
  | { type: 'REDO' };
```

## Consequences

### Positive
- Zero external dependencies for state management
- Reducer logic is pure and easily testable
- Deterministic state updates (same action always produces same result)
- Complete audit trail via ChangeRecord entries
- Easy to implement undo/redo (time-travel debugging)
- TypeScript discriminated unions provide excellent type safety
- React DevTools support out of the box

### Negative
- Boilerplate for defining actions and reducer cases
- Performance may degrade with very large state (mitigated by memoization)
- No built-in middleware for async actions (implement via useEffect)
- No time-travel debugging UI (unlike Redux DevTools)

### Neutral
- Requires discipline to avoid direct state mutations
- State structure must be designed upfront

## Alternatives Considered

### Alternative 1: Redux Toolkit
- Pros: Time-travel debugging, middleware ecosystem, excellent DevTools
- Cons: Additional dependency, more complex setup, overkill for this project
- Why rejected: Adds unnecessary complexity for a single-page canvas editor

### Alternative 2: Zustand
- Pros: Lightweight, simple API, good performance
- Cons: Another dependency, less explicit action tracking
- Why rejected: React Context is sufficient and has zero dependencies

### Alternative 3: Direct useState
- Pros: Simplest possible approach
- Cons: No centralized state, difficult undo/redo, hard to test
- Why rejected: Insufficient for complex state like scene with objects and keyframes

## Implementation Notes
1. Define SceneState interface in `types/scene.ts`
2. Implement reducer in `context/scene-reducer.ts` with pure functions
3. Create SceneContext provider in `context/SceneContext.tsx`
4. Wrap app in provider at `app/layout.tsx`
5. Export `useSceneContext()` hook for components
6. Write comprehensive tests for all reducer actions

## Related Decisions
- ADR-003: 5-Layer Konva Architecture (state controls which layers re-render)
- Future: Persistence strategy for auto-save

## References
- React useReducer: https://react.dev/reference/react/useReducer
- Discriminated Unions: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html
