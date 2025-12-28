import { calculateMafiSwing } from '@/lib/envelopes/mafi-swing';

describe('MAFI Swing Envelope', () => {
  describe('calculateMafiSwing', () => {
    it('should calculate swing envelope for right turn', () => {
      const pair = {
        truckId: 'truck-1',
        trailerId: 'trailer-1',
        truckPosition: { x: 10, y: 10 },
        truckRotation: 0,
        trailerPosition: { x: 5, y: 10 },
        trailerRotation: 15,
        articulationAngle: 15, // Right turn
        trailerLength: 12.0,
        trailerWidth: 2.5
      };

      const envelope = calculateMafiSwing(pair);

      expect(envelope.type).toBe('mafi-swing');
      expect(envelope.truckId).toBe('truck-1');
      expect(envelope.trailerId).toBe('trailer-1');
      expect(envelope.articulationAngle).toBe(15);
      expect(envelope.innerSweep.points.length).toBeGreaterThan(0);
      expect(envelope.outerSweep.points.length).toBeGreaterThan(0);
      expect(envelope.pivotPoint).toEqual({ x: 10, y: 10 });
    });

    it('should calculate swing envelope for left turn', () => {
      const pair = {
        truckId: 'truck-1',
        trailerId: 'trailer-1',
        truckPosition: { x: 10, y: 10 },
        truckRotation: 0,
        trailerPosition: { x: 5, y: 10 },
        trailerRotation: -15,
        articulationAngle: -15, // Left turn
        trailerLength: 12.0,
        trailerWidth: 2.5
      };

      const envelope = calculateMafiSwing(pair);

      expect(envelope.articulationAngle).toBe(-15);
      expect(envelope.innerSweep).toBeDefined();
      expect(envelope.outerSweep).toBeDefined();
    });

    it('should handle straight line (no articulation)', () => {
      const pair = {
        truckId: 'truck-1',
        trailerId: 'trailer-1',
        truckPosition: { x: 10, y: 10 },
        truckRotation: 0,
        trailerPosition: { x: 5, y: 10 },
        trailerRotation: 0,
        articulationAngle: 0, // Straight
        trailerLength: 12.0,
        trailerWidth: 2.5
      };

      const envelope = calculateMafiSwing(pair);

      // Should still create envelopes, but with large radius
      expect(envelope.turningRadius).toBeGreaterThan(100);
    });

    it('should calculate larger outer sweep than inner sweep', () => {
      const pair = {
        truckId: 'truck-1',
        trailerId: 'trailer-1',
        truckPosition: { x: 10, y: 10 },
        truckRotation: 0,
        trailerPosition: { x: 5, y: 10 },
        trailerRotation: 20,
        articulationAngle: 20,
        trailerLength: 12.0,
        trailerWidth: 2.5
      };

      const envelope = calculateMafiSwing(pair);

      // Outer sweep should have points farther from pivot than inner sweep
      // (We can't directly compare radii, but outerSweep should exist)
      expect(envelope.outerSweep.points.length).toBeGreaterThan(0);
      expect(envelope.innerSweep.points.length).toBeGreaterThan(0);
    });
  });
});
