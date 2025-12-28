import { calculateForkliftVision } from '@/lib/envelopes/forklift-vision';

describe('Forklift Vision Envelope', () => {
  describe('calculateForkliftVision', () => {
    it('should create 120° vision cone at 15m range', () => {
      const forklift = {
        id: 'forklift-1',
        position: { x: 10, y: 10 },
        rotation: 0, // Facing east
        forkHeight: 0,
        hasLoad: false
      };

      const envelope = calculateForkliftVision(forklift);

      expect(envelope.type).toBe('forklift-vision');
      expect(envelope.objectId).toBe('forklift-1');
      expect(envelope.visionCone.points.length).toBeGreaterThan(0);
      expect(envelope.visionCone.closed).toBe(true);
    });

    it('should create rear blind spot', () => {
      const forklift = {
        id: 'forklift-1',
        position: { x: 10, y: 10 },
        rotation: 0,
        forkHeight: 0,
        hasLoad: false
      };

      const envelope = calculateForkliftVision(forklift);

      // Should have at least rear + fork blind spots
      expect(envelope.blindSpots.length).toBeGreaterThanOrEqual(2);
    });

    it('should create fork blind spot', () => {
      const forklift = {
        id: 'forklift-1',
        position: { x: 10, y: 10 },
        rotation: 90, // Facing north
        forkHeight: 0,
        hasLoad: false
      };

      const envelope = calculateForkliftVision(forklift);

      // Fork blind spot should be present
      expect(envelope.blindSpots.length).toBeGreaterThanOrEqual(2);
    });

    it('should add load obstruction blind spot when carrying load', () => {
      const forklift = {
        id: 'forklift-1',
        position: { x: 10, y: 10 },
        rotation: 0,
        forkHeight: 1.5, // Elevated load
        hasLoad: true
      };

      const envelope = calculateForkliftVision(forklift);

      // Should have rear + fork + load blind spots
      expect(envelope.blindSpots.length).toBe(3);
      expect(envelope.loadObstructed).toBe(true);
    });

    it('should not add load blind spot when forks are low', () => {
      const forklift = {
        id: 'forklift-1',
        position: { x: 10, y: 10 },
        rotation: 0,
        forkHeight: 0.5, // Low forks
        hasLoad: true
      };

      const envelope = calculateForkliftVision(forklift);

      // Should only have rear + fork blind spots
      expect(envelope.blindSpots.length).toBe(2);
      expect(envelope.loadObstructed).toBe(false);
    });

    it('should handle rotation correctly', () => {
      const forklift1 = {
        id: 'forklift-1',
        position: { x: 10, y: 10 },
        rotation: 0, // East
        forkHeight: 0,
        hasLoad: false
      };

      const forklift2 = {
        ...forklift1,
        rotation: 180 // West
      };

      const envelope1 = calculateForkliftVision(forklift1);
      const envelope2 = calculateForkliftVision(forklift2);

      // Vision cones should be different based on rotation
      expect(envelope1.visionCone).not.toEqual(envelope2.visionCone);
    });
  });
});
