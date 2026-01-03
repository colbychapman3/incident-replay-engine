import winston from 'winston';

/**
 * Structured logging with Winston
 * Replaces console.log() for production use
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console output
  new winston.transports.Console(),

  // Error logs to file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),

  // All logs to file
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});

/**
 * Security audit logger for court-safe compliance
 * Logs all security-relevant events with structured data
 */
export interface AuditLogEntry {
  action: string;
  userId?: string;
  projectId?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export function auditLog(entry: AuditLogEntry) {
  const logData = {
    timestamp: new Date().toISOString(),
    category: 'SECURITY_AUDIT',
    ...entry
  };

  logger.info(JSON.stringify(logData));

  // In production, also send to external audit service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to external audit service (e.g., Datadog, Sentry, CloudWatch)
  }
}

/**
 * Helper functions for common log scenarios
 */

export const log = {
  // Authentication events
  authSuccess: (userId: string, ipAddress: string) => {
    auditLog({
      action: 'AUTH_SUCCESS',
      userId,
      ipAddress,
      success: true
    });
  },

  authFailure: (email: string, ipAddress: string, reason: string) => {
    auditLog({
      action: 'AUTH_FAILURE',
      metadata: { email },
      ipAddress,
      success: false,
      error: reason
    });
  },

  tokenRevoked: (userId: string, reason: string) => {
    auditLog({
      action: 'TOKEN_REVOKED',
      userId,
      success: true,
      metadata: { reason }
    });
  },

  // Project operations
  projectCreated: (userId: string, projectId: string, projectName: string) => {
    auditLog({
      action: 'PROJECT_CREATED',
      userId,
      projectId,
      success: true,
      metadata: { projectName }
    });
  },

  projectModified: (userId: string, projectId: string, changes: string[]) => {
    auditLog({
      action: 'PROJECT_MODIFIED',
      userId,
      projectId,
      success: true,
      metadata: { changes }
    });
  },

  projectDeleted: (userId: string, projectId: string) => {
    auditLog({
      action: 'PROJECT_DELETED',
      userId,
      projectId,
      success: true
    });
  },

  // Export operations
  exportRequested: (userId: string, projectId: string, format: string) => {
    auditLog({
      action: 'EXPORT_REQUESTED',
      userId,
      projectId,
      success: true,
      metadata: { format }
    });
  },

  // Rate limiting
  rateLimitExceeded: (ipAddress: string, endpoint: string) => {
    auditLog({
      action: 'RATE_LIMIT_EXCEEDED',
      ipAddress,
      success: false,
      metadata: { endpoint }
    });
  },

  // Security events
  suspiciousActivity: (userId: string | undefined, ipAddress: string, description: string) => {
    logger.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      category: 'SECURITY_ALERT',
      action: 'SUSPICIOUS_ACTIVITY',
      userId,
      ipAddress,
      description
    }));
  }
};
