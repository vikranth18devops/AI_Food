export interface LogContext {
  service?: string;
  correlationId?: string;
  requestId?: string;
  [key: string]: any;
}

export class StructuredLogger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'authorization', 'apiKey', 'secret'];
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }
    return sanitized;
  }

  private formatMessage(level: string, message: string, context?: LogContext) {
    const payload = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      ...(context ? this.sanitize(context) : {}),
    };
    return JSON.stringify(payload);
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: any, context?: LogContext) {
    const errObj = error ? { errorName: error.name, errorMessage: error.message, stack: error.stack } : {};
    this.info(message, { ...context, service: this.serviceName, ...errObj });
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }
}
