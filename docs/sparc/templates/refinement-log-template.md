# [Feature Name] Refinement Log

## TDD Cycle Tracking

### Iteration 1: [Date]

#### Red Phase (Write Failing Test)
```typescript
// Test file: __tests__/[feature].test.ts
describe('[Feature]', () => {
  it('should [expected behavior]', () => {
    // Arrange
    const input = ...;

    // Act
    const result = featureFunction(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```
- Test result: FAIL (as expected)
- Failure message: [message]

#### Green Phase (Make Test Pass)
```typescript
// Implementation in: lib/[feature].ts
export function featureFunction(input: Type): Result {
  // Minimal implementation to make test pass
  return result;
}
```
- Test result: PASS
- Notes: [any observations]

#### Refactor Phase
- Refactoring applied: [description]
- Test still passes: YES
- Performance improvement: [if applicable]

### Iteration 2: [Date]
[Repeat Red-Green-Refactor cycle]

## Code Review Notes
- Reviewer: [agent/person]
- Date: [date]
- Findings:
  - [ ] Finding 1
  - [ ] Finding 2

## Performance Measurements
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| [metric] | [value] | [value] | [target] |

## Issues Encountered
- Issue 1: [description]
  - Resolution: [how fixed]
