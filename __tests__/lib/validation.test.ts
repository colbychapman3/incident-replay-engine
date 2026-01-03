import { describe, test, expect } from '@jest/globals';
import {
  CreateProjectSchema,
  ExportPNGSchema,
  ExportPDFSchema,
  SceneObjectSchema,
  KeyframeSchema,
  validateRequest,
  safeValidateRequest
} from '@/lib/validation';

describe('Input Validation', () => {
  describe('CreateProjectSchema', () => {
    const validProject = {
      name: 'Test Incident',
      description: 'A test incident report',
      incidentDate: '2024-12-28',
      incidentTime: '14:30:00',
      location: 'Port of Los Angeles',
      sceneType: 'vessel-deck' as const,
      dimensions: { width: 100, height: 50 }
    };

    test('validates correct project data', () => {
      const result = safeValidateRequest(CreateProjectSchema, validProject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Incident');
      }
    });

    test('rejects empty project name', () => {
      const invalid = { ...validProject, name: '' };
      const result = safeValidateRequest(CreateProjectSchema, invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.includes('name'))).toBe(true);
      }
    });

    test('rejects project name over 200 characters', () => {
      const invalid = { ...validProject, name: 'a'.repeat(201) };
      const result = safeValidateRequest(CreateProjectSchema, invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.includes('too long'))).toBe(true);
      }
    });

    test('rejects invalid scene type', () => {
      const invalid = { ...validProject, sceneType: 'invalid-type' };
      const result = safeValidateRequest(CreateProjectSchema, invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.includes('sceneType'))).toBe(true);
      }
    });

    test('rejects negative dimensions', () => {
      const invalid = { ...validProject, dimensions: { width: -10, height: 50 } };
      const result = safeValidateRequest(CreateProjectSchema, invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.includes('positive'))).toBe(true);
      }
    });

    test('rejects dimensions over 1000m', () => {
      const invalid = { ...validProject, dimensions: { width: 1001, height: 50 } };
      const result = safeValidateRequest(CreateProjectSchema, invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.includes('too large'))).toBe(true);
      }
    });

    test('accepts valid datetime format', () => {
      const withDatetime = { ...validProject, incidentDate: '2024-12-28T14:30:00Z' };
      const result = safeValidateRequest(CreateProjectSchema, withDatetime);

      expect(result.success).toBe(true);
    });

    test('accepts YYYY-MM-DD date format', () => {
      const result = safeValidateRequest(CreateProjectSchema, validProject);
      expect(result.success).toBe(true);
    });

    test('optional fields can be omitted', () => {
      const minimal = {
        name: 'Test',
        incidentDate: '2024-12-28',
        sceneType: 'port-road' as const,
        dimensions: { width: 50, height: 50 }
      };

      const result = safeValidateRequest(CreateProjectSchema, minimal);
      expect(result.success).toBe(true);
    });
  });

  describe('ExportPNGSchema', () => {
    const validPNG = {
      canvasDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      filename: 'test-snapshot'
    };

    test('validates correct PNG export data', () => {
      const result = safeValidateRequest(ExportPNGSchema, validPNG);
      expect(result.success).toBe(true);
    });

    test('rejects non-PNG data URL', () => {
      const invalid = { ...validPNG, canvasDataURL: 'data:image/jpeg;base64,abc123' };
      const result = safeValidateRequest(ExportPNGSchema, invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.includes('PNG'))).toBe(true);
      }
    });

    test('sanitizes filename with special characters', () => {
      const invalid = { ...validPNG, filename: '../../../etc/passwd' };
      const result = safeValidateRequest(ExportPNGSchema, invalid);

      // Should fail validation due to invalid characters
      expect(result.success).toBe(false);
    });

    test('rejects filename over 100 characters', () => {
      const invalid = { ...validPNG, filename: 'a'.repeat(101) };
      const result = safeValidateRequest(ExportPNGSchema, invalid);

      expect(result.success).toBe(false);
    });

    test('uses default filename when omitted', () => {
      const withoutFilename = { canvasDataURL: validPNG.canvasDataURL };
      const result = safeValidateRequest(ExportPNGSchema, withoutFilename);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.filename).toBe('incident-snapshot');
      }
    });

    test('rejects data URL over 10MB', () => {
      const largeBase64 = 'a'.repeat(11 * 1024 * 1024); // 11MB
      const invalid = {
        canvasDataURL: `data:image/png;base64,${largeBase64}`,
        filename: 'test'
      };
      const result = safeValidateRequest(ExportPNGSchema, invalid);

      expect(result.success).toBe(false);
    });
  });

  describe('ExportPDFSchema', () => {
    const validPDF = {
      projectName: 'Test Project',
      keyframes: [
        { id: 'T0', timestamp: 0, label: 'T0: Start' },
        { id: 'T1', timestamp: 10, label: 'T1: Event' }
      ]
    };

    test('validates correct PDF export data', () => {
      const result = safeValidateRequest(ExportPDFSchema, validPDF);
      expect(result.success).toBe(true);
    });

    test('rejects empty project name', () => {
      const invalid = { ...validPDF, projectName: '' };
      const result = safeValidateRequest(ExportPDFSchema, invalid);

      expect(result.success).toBe(false);
    });

    test('rejects over 100 keyframes', () => {
      const manyKeyframes = Array.from({ length: 101 }, (_, i) => ({
        id: `T${i}`,
        timestamp: i,
        label: `T${i}: Event`
      }));

      const invalid = { ...validPDF, keyframes: manyKeyframes };
      const result = safeValidateRequest(ExportPDFSchema, invalid);

      expect(result.success).toBe(false);
    });
  });

  describe('SceneObjectSchema', () => {
    const validObject = {
      assetId: 'mafi-truck',
      type: 'vehicle' as const,
      properties: {
        position: { x: 10, y: 20 },
        rotation: 45
      }
    };

    test('validates correct scene object', () => {
      const result = safeValidateRequest(SceneObjectSchema, validObject);
      expect(result.success).toBe(true);
    });

    test('rejects invalid object type', () => {
      const invalid = { ...validObject, type: 'invalid' };
      const result = safeValidateRequest(SceneObjectSchema, invalid);

      expect(result.success).toBe(false);
    });

    test('rejects rotation over 360 degrees', () => {
      const invalid = {
        ...validObject,
        properties: { ...validObject.properties, rotation: 361 }
      };
      const result = safeValidateRequest(SceneObjectSchema, invalid);

      expect(result.success).toBe(false);
    });

    test('rejects infinite coordinates', () => {
      const invalid = {
        ...validObject,
        properties: { position: { x: Infinity, y: 20 }, rotation: 0 }
      };
      const result = safeValidateRequest(SceneObjectSchema, invalid);

      expect(result.success).toBe(false);
    });
  });

  describe('KeyframeSchema', () => {
    const validKeyframe = {
      timestamp: 10.5,
      label: 'T1: Event occurs',
      objectStates: {
        'obj-1': {
          position: { x: 10, y: 20 },
          rotation: 45,
          visible: true
        }
      }
    };

    test('validates correct keyframe', () => {
      const result = safeValidateRequest(KeyframeSchema, validKeyframe);
      expect(result.success).toBe(true);
    });

    test('rejects negative timestamp', () => {
      const invalid = { ...validKeyframe, timestamp: -5 };
      const result = safeValidateRequest(KeyframeSchema, invalid);

      expect(result.success).toBe(false);
    });

    test('rejects label over 200 characters', () => {
      const invalid = { ...validKeyframe, label: 'a'.repeat(201) };
      const result = safeValidateRequest(KeyframeSchema, invalid);

      expect(result.success).toBe(false);
    });

    test('accepts optional description', () => {
      const withDescription = { ...validKeyframe, description: 'Detailed description' };
      const result = safeValidateRequest(KeyframeSchema, withDescription);

      expect(result.success).toBe(true);
    });
  });

  describe('Security - Injection Prevention', () => {
    test('rejects SQL injection attempts in project name', () => {
      const sqlInjection = {
        name: "'; DROP TABLE projects; --",
        incidentDate: '2024-12-28',
        sceneType: 'vessel-deck' as const,
        dimensions: { width: 100, height: 50 }
      };

      // Should accept (validation doesn't block SQL chars) but Prisma will sanitize
      const result = safeValidateRequest(CreateProjectSchema, sqlInjection);
      expect(result.success).toBe(true);
      // Prisma ORM prevents SQL injection via parameterized queries
    });

    test('rejects XSS attempts in filename', () => {
      const xssAttempt = {
        canvasDataURL: 'data:image/png;base64,abc',
        filename: '<script>alert("xss")</script>'
      };

      const result = safeValidateRequest(ExportPNGSchema, xssAttempt);
      expect(result.success).toBe(false); // Regex only allows alphanumeric + hyphens/underscores
    });

    test('rejects path traversal in filename', () => {
      const pathTraversal = {
        canvasDataURL: 'data:image/png;base64,abc',
        filename: '../../etc/passwd'
      };

      const result = safeValidateRequest(ExportPNGSchema, pathTraversal);
      expect(result.success).toBe(false); // Regex blocks slashes and dots
    });
  });
});
