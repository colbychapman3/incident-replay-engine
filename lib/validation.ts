import { z } from 'zod';

/**
 * Validation schemas for API request bodies
 * Using Zod for runtime type checking and validation
 */

// Project creation schema
export const CreateProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(200, 'Project name too long'),

  description: z.string()
    .max(2000, 'Description too long')
    .optional(),

  incidentDate: z.string()
    .datetime({ message: 'Invalid date format' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')),

  incidentTime: z.string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS')
    .optional(),

  location: z.string()
    .max(500, 'Location too long')
    .optional(),

  sceneType: z.enum(['vessel-deck', 'port-road'], {
    message: 'Scene type must be vessel-deck or port-road'
  }),

  dimensions: z.object({
    width: z.number()
      .positive('Width must be positive')
      .max(1000, 'Width too large (max 1000m)')
      .finite(),

    height: z.number()
      .positive('Height must be positive')
      .max(1000, 'Height too large (max 1000m)')
      .finite()
  })
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// Project update schema (all fields optional)
export const UpdateProjectSchema = CreateProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// PNG export schema
export const ExportPNGSchema = z.object({
  canvasDataURL: z.string()
    .regex(/^data:image\/png;base64,/, 'Must be a valid PNG data URL')
    .max(10 * 1024 * 1024, 'Image too large (max 10MB)'), // 10MB limit

  filename: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Filename can only contain letters, numbers, hyphens, and underscores')
    .max(100, 'Filename too long')
    .optional()
    .default('incident-snapshot')
});

export type ExportPNGInput = z.infer<typeof ExportPNGSchema>;

// PDF export schema
export const ExportPDFSchema = z.object({
  projectName: z.string()
    .min(1, 'Project name required')
    .max(200, 'Project name too long'),

  keyframes: z.array(z.object({
    id: z.string(),
    timestamp: z.number().nonnegative(),
    label: z.string().max(200)
  }))
    .max(100, 'Too many keyframes (max 100)'),

  canvasDataURLs: z.array(z.string())
    .optional()
});

export type ExportPDFInput = z.infer<typeof ExportPDFSchema>;

// Scene object schema
export const SceneObjectSchema = z.object({
  assetId: z.string(),
  type: z.enum(['vehicle', 'actor', 'safety']),

  properties: z.object({
    position: z.object({
      x: z.number().finite(),
      y: z.number().finite()
    }),
    rotation: z.number().finite().min(0).max(360)
  })
});

export type SceneObjectInput = z.infer<typeof SceneObjectSchema>;

// Keyframe schema
export const KeyframeSchema = z.object({
  timestamp: z.number()
    .nonnegative('Timestamp must be non-negative')
    .finite(),

  label: z.string()
    .max(200, 'Label too long'),

  description: z.string()
    .max(1000, 'Description too long')
    .optional(),

  objectStates: z.record(
    z.string(), // key: object ID
    z.object({
      position: z.object({
        x: z.number().finite(),
        y: z.number().finite()
      }),
      rotation: z.number().finite(),
      visible: z.boolean().optional()
    })
  )
});

export type KeyframeInput = z.infer<typeof KeyframeSchema>;

/**
 * Validate and parse request body
 * @throws ZodError if validation fails
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns success/error object
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(err =>
    `${err.path.join('.')}: ${err.message}`
  );

  return { success: false, errors };
}
