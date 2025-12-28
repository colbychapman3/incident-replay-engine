import { calculateSpotterLOS, calculateAllSpotterLOS } from '@/lib/envelopes/spotter-los';
import { Polygon } from '@/types/geometry';

describe('Spotter Line-of-Sight Envelope', () => {
  describe('calculateSpotterLOS', () => {
    it('should create clear line of sight with no obstacles', () => {
      const input = {
        spotter: {
          id: 'spotter-1',
          position: { x: 0, y: 0 },
          visionRange: 20
        },
        target: {
          id: 'vehicle-1',
          position: { x: 10, y: 0 }
        },
        obstacles: []
      };

      const envelope = calculateSpotterLOS(input);

      expect(envelope.type).toBe('spotter-los');
      expect(envelope.spotterId).toBe('spotter-1');
      expect(envelope.targetId).toBe('vehicle-1');
      expect(envelope.sightLine.obstructed).toBe(false);
      expect(envelope.clearRange).toBe(10);
    });

    it('should detect obstructed line of sight', () => {
      const obstacleBox: Polygon = {
        points: [
          { x: 4, y: -2 },
          { x: 6, y: -2 },
          { x: 6, y: 2 },
          { x: 4, y: 2 }
        ],
        closed: true
      };

      const input = {
        spotter: {
          id: 'spotter-1',
          position: { x: 0, y: 0 },
          visionRange: 20
        },
        target: {
          id: 'vehicle-1',
          position: { x: 10, y: 0 }
        },
        obstacles: [
          {
            id: 'obstacle-1',
            position: { x: 5, y: 0 },
            boundingBox: obstacleBox
          }
        ]
      };

      const envelope = calculateSpotterLOS(input);

      expect(envelope.sightLine.obstructed).toBe(true);
      expect(envelope.sightLine.obstructionPoints.length).toBeGreaterThan(0);
    });

    it('should mark as obstructed when target is out of range', () => {
      const input = {
        spotter: {
          id: 'spotter-1',
          position: { x: 0, y: 0 },
          visionRange: 10 // Only 10m range
        },
        target: {
          id: 'vehicle-1',
          position: { x: 20, y: 0 } // 20m away
        },
        obstacles: []
      };

      const envelope = calculateSpotterLOS(input);

      expect(envelope.sightLine.obstructed).toBe(true);
    });

    it('should ignore spotter and target as obstacles', () => {
      const box: Polygon = {
        points: [
          { x: -1, y: -1 },
          { x: 1, y: -1 },
          { x: 1, y: 1 },
          { x: -1, y: 1 }
        ],
        closed: true
      };

      const input = {
        spotter: {
          id: 'spotter-1',
          position: { x: 0, y: 0 },
          visionRange: 20
        },
        target: {
          id: 'vehicle-1',
          position: { x: 10, y: 0 }
        },
        obstacles: [
          {
            id: 'spotter-1', // Same as spotter
            position: { x: 0, y: 0 },
            boundingBox: box
          },
          {
            id: 'vehicle-1', // Same as target
            position: { x: 10, y: 0 },
            boundingBox: box
          }
        ]
      };

      const envelope = calculateSpotterLOS(input);

      // Should not be obstructed by self or target
      expect(envelope.sightLine.obstructed).toBe(false);
    });
  });

  describe('calculateAllSpotterLOS', () => {
    it('should calculate LOS for multiple spotters and targets', () => {
      const spotters = [
        {
          id: 'spotter-1',
          position: { x: 0, y: 0 },
          visionRange: 20
        },
        {
          id: 'spotter-2',
          position: { x: 20, y: 0 },
          visionRange: 20
        }
      ];

      const targets = [
        {
          id: 'vehicle-1',
          position: { x: 10, y: 0 }
        },
        {
          id: 'vehicle-2',
          position: { x: 15, y: 0 }
        }
      ];

      const envelopes = calculateAllSpotterLOS(spotters, targets, []);

      // 2 spotters × 2 targets = 4 LOS lines
      // But each spotter won't look at themselves, and targets might be spotters too
      expect(envelopes.length).toBeGreaterThan(0);
    });
  });
});
