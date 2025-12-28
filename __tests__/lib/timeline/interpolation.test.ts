import {
  lerpPoint,
  lerpAngle,
  lerpNumber,
  lerpObjectState,
  calculateInterpolationFactor,
  findSurroundingKeyframes
} from '@/lib/timeline/interpolation';

describe('Timeline Interpolation', () => {
  describe('lerpPoint', () => {
    it('should interpolate between two points', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 20 };

      expect(lerpPoint(start, end, 0)).toEqual({ x: 0, y: 0 });
      expect(lerpPoint(start, end, 0.5)).toEqual({ x: 5, y: 10 });
      expect(lerpPoint(start, end, 1)).toEqual({ x: 10, y: 20 });
    });

    it('should clamp t to [0, 1]', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 20 };

      expect(lerpPoint(start, end, -0.5)).toEqual({ x: 0, y: 0 });
      expect(lerpPoint(start, end, 1.5)).toEqual({ x: 10, y: 20 });
    });
  });

  describe('lerpAngle', () => {
    it('should interpolate angles linearly', () => {
      expect(lerpAngle(0, 90, 0.5)).toBeCloseTo(45, 1);
      expect(lerpAngle(90, 180, 0.5)).toBeCloseTo(135, 1);
    });

    it('should handle 0°/360° boundary correctly (shortest path)', () => {
      // 350° to 10° should go through 0° (not 180°)
      expect(lerpAngle(350, 10, 0.5)).toBeCloseTo(0, 1);

      // 10° to 350° should go through 0° (not 180°)
      expect(lerpAngle(10, 350, 0.5)).toBeCloseTo(0, 1);
    });

    it('should handle full rotation', () => {
      expect(lerpAngle(0, 360, 0.5)).toBeCloseTo(0, 1); // 360° = 0°
    });

    it('should handle negative angles', () => {
      expect(lerpAngle(-45, 45, 0.5)).toBeCloseTo(0, 1);
    });

    it('should clamp t to [0, 1]', () => {
      expect(lerpAngle(0, 90, -0.5)).toBeCloseTo(0, 1);
      expect(lerpAngle(0, 90, 1.5)).toBeCloseTo(90, 1);
    });
  });

  describe('lerpNumber', () => {
    it('should interpolate numbers linearly', () => {
      expect(lerpNumber(0, 100, 0.5)).toBe(50);
      expect(lerpNumber(10, 20, 0.25)).toBe(12.5);
    });

    it('should handle negative numbers', () => {
      expect(lerpNumber(-10, 10, 0.5)).toBe(0);
    });
  });

  describe('lerpObjectState', () => {
    it('should interpolate complete object state', () => {
      const start = {
        position: { x: 0, y: 0 },
        rotation: 0,
        properties: { speed: 0, forkHeight: 0 },
        visible: true
      };

      const end = {
        position: { x: 10, y: 20 },
        rotation: 90,
        properties: { speed: 10, forkHeight: 2 },
        visible: true
      };

      const result = lerpObjectState(start, end, 0.5);

      expect(result.position).toEqual({ x: 5, y: 10 });
      expect(result.rotation).toBeCloseTo(45, 1);
      expect(result.properties.speed).toBe(5);
      expect(result.properties.forkHeight).toBe(1);
      expect(result.visible).toBe(true);
    });

    it('should handle visibility with step interpolation', () => {
      const start = {
        position: { x: 0, y: 0 },
        rotation: 0,
        properties: {},
        visible: true
      };

      const end = {
        position: { x: 10, y: 20 },
        rotation: 90,
        properties: {},
        visible: false
      };

      // Visibility switches at t=0.5
      expect(lerpObjectState(start, end, 0.4).visible).toBe(true);
      expect(lerpObjectState(start, end, 0.6).visible).toBe(false);
    });

    it('should handle missing properties gracefully', () => {
      const start = {
        position: { x: 0, y: 0 },
        rotation: 0,
        properties: { speed: 5 },
        visible: true
      };

      const end = {
        position: { x: 10, y: 20 },
        rotation: 90,
        properties: { forkHeight: 2 },
        visible: true
      };

      const result = lerpObjectState(start, end, 0.5);

      expect(result.properties.speed).toBe(5); // Preserved from start
      expect(result.properties.forkHeight).toBe(2); // Taken from end
    });
  });

  describe('calculateInterpolationFactor', () => {
    it('should calculate correct interpolation factor', () => {
      expect(calculateInterpolationFactor(5, 0, 10)).toBe(0.5);
      expect(calculateInterpolationFactor(2.5, 0, 10)).toBe(0.25);
      expect(calculateInterpolationFactor(7.5, 0, 10)).toBe(0.75);
    });

    it('should clamp to [0, 1]', () => {
      expect(calculateInterpolationFactor(-5, 0, 10)).toBe(0);
      expect(calculateInterpolationFactor(15, 0, 10)).toBe(1);
    });

    it('should handle zero duration', () => {
      expect(calculateInterpolationFactor(5, 5, 5)).toBe(0);
    });
  });

  describe('findSurroundingKeyframes', () => {
    const keyframes = [
      { timestamp: 0 },
      { timestamp: 5 },
      { timestamp: 10 },
      { timestamp: 15 }
    ];

    it('should find surrounding keyframes for time in middle', () => {
      expect(findSurroundingKeyframes(keyframes, 7.5)).toEqual([1, 2]);
      expect(findSurroundingKeyframes(keyframes, 2)).toEqual([0, 1]);
      expect(findSurroundingKeyframes(keyframes, 12)).toEqual([2, 3]);
    });

    it('should handle time before first keyframe', () => {
      expect(findSurroundingKeyframes(keyframes, -5)).toEqual([0, 0]);
    });

    it('should handle time after last keyframe', () => {
      expect(findSurroundingKeyframes(keyframes, 20)).toEqual([3, 3]);
    });

    it('should handle time exactly on keyframe', () => {
      expect(findSurroundingKeyframes(keyframes, 5)).toEqual([1, 2]);
      expect(findSurroundingKeyframes(keyframes, 10)).toEqual([2, 3]);
    });

    it('should handle empty keyframes array', () => {
      expect(findSurroundingKeyframes([], 5)).toBeNull();
    });
  });
});
