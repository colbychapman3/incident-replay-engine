import { calculateRampClearance, calculateAllRampClearances } from '@/lib/envelopes/ramp-clearance';
import { Polygon } from '@/types/geometry';

describe('Ramp Clearance Envelope', () => {
  const rampBoundary: Polygon = {
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 0, y: 10 }
    ],
    closed: true
  };

  describe('calculateRampClearance', () => {
    it('should detect no violations when vehicles are below clearance', () => {
      const input = {
        ramp: {
          id: 'ramp-1',
          position: { x: 10, y: 5 },
          boundary: rampBoundary,
          clearanceHeight: 3.5
        },
        vehicles: [
          {
            id: 'vehicle-1',
            position: { x: 10, y: 5 }, // On ramp
            height: 3.0 // Below clearance
          },
          {
            id: 'vehicle-2',
            position: { x: 10, y: 5 },
            height: 2.5
          }
        ]
      };

      const envelope = calculateRampClearance(input);

      expect(envelope.type).toBe('ramp-clearance');
      expect(envelope.rampId).toBe('ramp-1');
      expect(envelope.clearanceHeight).toBe(3.5);
      expect(envelope.violations).toHaveLength(0);
    });

    it('should detect violation when vehicle exceeds clearance', () => {
      const input = {
        ramp: {
          id: 'ramp-1',
          position: { x: 10, y: 5 },
          boundary: rampBoundary,
          clearanceHeight: 3.5
        },
        vehicles: [
          {
            id: 'vehicle-1',
            position: { x: 10, y: 5 }, // On ramp
            height: 4.2 // Exceeds clearance by 0.7m
          }
        ]
      };

      const envelope = calculateRampClearance(input);

      expect(envelope.violations).toHaveLength(1);
      expect(envelope.violations[0].vehicleId).toBe('vehicle-1');
      expect(envelope.violations[0].vehicleHeight).toBe(4.2);
      expect(envelope.violations[0].exceedance).toBeCloseTo(0.7, 1);
    });

    it('should not detect violation when vehicle is off ramp', () => {
      const input = {
        ramp: {
          id: 'ramp-1',
          position: { x: 10, y: 5 },
          boundary: rampBoundary,
          clearanceHeight: 3.5
        },
        vehicles: [
          {
            id: 'vehicle-1',
            position: { x: 100, y: 100 }, // Far from ramp
            height: 5.0 // Would exceed, but not on ramp
          }
        ]
      };

      const envelope = calculateRampClearance(input);

      expect(envelope.violations).toHaveLength(0);
    });

    it('should handle multiple violations', () => {
      const input = {
        ramp: {
          id: 'ramp-1',
          position: { x: 10, y: 5 },
          boundary: rampBoundary,
          clearanceHeight: 3.5
        },
        vehicles: [
          {
            id: 'vehicle-1',
            position: { x: 5, y: 5 },
            height: 4.0 // Exceeds by 0.5m
          },
          {
            id: 'vehicle-2',
            position: { x: 15, y: 5 },
            height: 4.2 // Exceeds by 0.7m
          },
          {
            id: 'vehicle-3',
            position: { x: 10, y: 5 },
            height: 3.0 // OK
          }
        ]
      };

      const envelope = calculateRampClearance(input);

      expect(envelope.violations).toHaveLength(2);
      expect(envelope.violations[0].vehicleId).toBe('vehicle-1');
      expect(envelope.violations[1].vehicleId).toBe('vehicle-2');
    });
  });

  describe('calculateAllRampClearances', () => {
    it('should calculate clearances for multiple ramps', () => {
      const ramp1Boundary: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 }
        ],
        closed: true
      };

      const ramp2Boundary: Polygon = {
        points: [
          { x: 20, y: 0 },
          { x: 30, y: 0 },
          { x: 30, y: 10 },
          { x: 20, y: 10 }
        ],
        closed: true
      };

      const ramps = [
        {
          id: 'ramp-1',
          position: { x: 5, y: 5 },
          boundary: ramp1Boundary,
          clearanceHeight: 3.5
        },
        {
          id: 'ramp-2',
          position: { x: 25, y: 5 },
          boundary: ramp2Boundary,
          clearanceHeight: 4.0
        }
      ];

      const vehicles = [
        {
          id: 'vehicle-1',
          position: { x: 5, y: 5 }, // On ramp-1
          height: 4.0 // Exceeds ramp-1 (3.5m)
        }
      ];

      const envelopes = calculateAllRampClearances(ramps, vehicles);

      expect(envelopes).toHaveLength(2);
      expect(envelopes[0].violations).toHaveLength(1);
      expect(envelopes[1].violations).toHaveLength(0);
    });
  });
});
