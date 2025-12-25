# ADR-002: Coordinate System

## Status
Accepted

## Context
The Incident Replay Engine must produce court-admissible documentation that uses real-world measurements (meters) for accuracy and legal defensibility. However, canvas rendering requires pixel coordinates. We need a system that:
- Stores all positions in real-world units (meters)
- Renders to canvas in pixels
- Allows zoom/pan without data corruption
- Never exposes pixel values to users
- Maintains precision for court-safe documentation

## Decision
Use a **dual coordinate system** with explicit conversion functions.

### Coordinate Systems

**World Coordinates (Primary)**
- Unit: **Meters**
- Origin: Scene top-left corner (0, 0)
- Positive X: Right
- Positive Y: Down
- Stored in database (SceneObject positions, ObjectState positions)
- Displayed in UI (measurements, labels, tooltips)

**Canvas Coordinates (Rendering Only)**
- Unit: **Pixels**
- Origin: Canvas top-left corner (0, 0)
- Conversion factor: `pixelsPerMeter` (default: 20 pixels = 1 meter)
- Used only for Konva rendering
- Never persisted to database
- Never shown to users

### Conversion Interface
```typescript
interface CoordinateSystem {
  pixelsPerMeter: number; // Zoom level
  worldWidth: number;     // Scene width in meters
  worldHeight: number;    // Scene height in meters
}

function worldToCanvas(point: Point, system: CoordinateSystem): Point {
  return {
    x: point.x * system.pixelsPerMeter,
    y: point.y * system.pixelsPerMeter
  };
}

function canvasToWorld(point: Point, system: CoordinateSystem): Point {
  return {
    x: point.x / system.pixelsPerMeter,
    y: point.y / system.pixelsPerMeter
  };
}
```

## Consequences

### Positive
- **Court-safe**: All documentation in meters, as required by maritime industry
- **Precision**: No rounding errors from pixel-based storage
- **Zoom**: `pixelsPerMeter` can change without affecting data
- **Clarity**: Explicit conversion functions prevent confusion
- **Type safety**: TypeScript ensures correct coordinate system usage

### Negative
- **Conversion overhead**: Every render requires coordinate conversion
- **Two coordinate spaces**: Developers must be aware of both systems
- **Testing complexity**: Tests must cover both coordinate systems

### Neutral
- **Konva compatibility**: Konva expects pixels, so conversion is necessary regardless

## Alternatives Considered

### Alternative 1: Store Everything in Pixels
- Pros: No conversion needed, simpler rendering
- Cons: Zoom changes data, not court-safe, precision loss
- Why rejected: **Violates court-safe documentation requirement**

### Alternative 2: Use Konva Transform for Zoom
- Pros: Konva handles coordinate conversion automatically
- Cons: Data stored in arbitrary units, difficult to validate measurements
- Why rejected: Obscures true measurements, harder to debug

### Alternative 3: CSS-based Scaling
- Pros: Browser handles zoom
- Cons: Blurry rendering at non-integer scales, poor canvas performance
- Why rejected: Unacceptable visual quality for professional tool

## Implementation Notes

### Conversion Points
1. **Object Placement**: User clicks canvas → convert to world → store in state
2. **Object Rendering**: Read world position from state → convert to canvas → render with Konva
3. **Measurements**: Display world coordinates in UI (e.g., "15.3m")
4. **Export**: Use world coordinates for PDF measurements, convert to pixels for image rendering

### Zoom Implementation
```typescript
const [pixelsPerMeter, setPixelsPerMeter] = useState(20); // Default zoom

// Zoom in: increase pixelsPerMeter
function zoomIn() {
  setPixelsPerMeter(prev => Math.min(prev * 1.2, 100));
}

// Zoom out: decrease pixelsPerMeter
function zoomOut() {
  setPixelsPerMeter(prev => Math.max(prev / 1.2, 5));
}
```

### Precision Considerations
- World coordinates stored as `Float` in database (Prisma)
- Rounding to 2 decimal places for display (e.g., "15.34m")
- Full precision maintained in calculations

## Related Decisions
- ADR-001: State Management (world coordinates stored in SceneState)
- Future: Pan/zoom controls implementation

## References
- Maritime measurement standards
- Court evidence admissibility requirements
- Konva coordinate systems: https://konvajs.org/docs/groups_and_layers/Groups.html
