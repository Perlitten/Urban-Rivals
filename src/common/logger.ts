export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogContext {
  component: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  extra?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.DEBUG;
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatMessage(level: string, context: LogContext, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.formatContext(context);
    const levelEmoji = this.getLevelEmoji(level);
    
    return `${levelEmoji} [${timestamp}] [${level}] ${contextStr} ${message}`;
  }

  private formatContext(context: LogContext): string {
    const parts = [context.component];
    
    if (context.operation) parts.push(`::${context.operation}`);
    if (context.requestId) parts.push(`(${context.requestId})`);
    if (context.userId) parts.push(`[user:${context.userId}]`);
    
    return `[${parts.join('')}]`;
  }

  private getLevelEmoji(level: string): string {
    switch (level) {
      case 'DEBUG': return '🔍';
      case 'INFO': return '📋';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      default: return '📋';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  debug(context: LogContext, message: string, ...args: any[]): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const formatted = this.formatMessage('DEBUG', context, message);
    console.log(formatted, ...args);
  }

  info(context: LogContext, message: string, ...args: any[]): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const formatted = this.formatMessage('INFO', context, message);
    console.log(formatted, ...args);
  }

  warn(context: LogContext, message: string, ...args: any[]): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const formatted = this.formatMessage('WARN', context, message);
    console.warn(formatted, ...args);
  }

  error(context: LogContext, message: string, error?: Error, ...args: any[]): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const formatted = this.formatMessage('ERROR', context, message);
    console.error(formatted, error || '', ...args);
    
    // Additional error details
    if (error) {
      console.error(`${this.getLevelEmoji('ERROR')} Stack trace:`, error.stack);
      if (context.extra) {
        console.error(`${this.getLevelEmoji('ERROR')} Context data:`, context.extra);
      }
    }
  }

  // Performance monitoring
  startTimer(context: LogContext, operation: string): () => void {
    const startTime = performance.now();
    this.debug(context, `⏱️ Starting timer for: ${operation}`);
    
    return () => {
      const duration = performance.now() - startTime;
      this.info(context, `⏱️ ${operation} completed in ${duration.toFixed(2)}ms`);
    };
  }

  // Network request logging
  logRequest(context: LogContext, method: string, url: string, data?: any): void {
    this.info({...context, operation: 'HTTP_REQUEST'}, `🌐 ${method} ${url}`, data ? { data } : {});
  }

  logResponse(context: LogContext, method: string, url: string, status: number, responseTime: number): void {
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    this.info({...context, operation: 'HTTP_RESPONSE'}, `${emoji} ${method} ${url} - ${status} (${responseTime}ms)`);
  }

  // ML Operations logging
  logMLOperation(context: LogContext, operation: string, input: any, output?: any, error?: Error): void {
    const mlContext = {...context, operation: `ML_${operation.toUpperCase()}`};
    
    if (error) {
      this.error(mlContext, `ML operation failed: ${operation}`, error, { input });
    } else {
      this.info(mlContext, `🤖 ML operation completed: ${operation}`, {
        inputSize: JSON.stringify(input).length,
        outputSize: output ? JSON.stringify(output).length : 0
      });
    }
  }

  // User action logging
  logUserAction(context: LogContext, action: string, details?: any): void {
    this.info({...context, operation: 'USER_ACTION'}, `👤 User action: ${action}`, details);
  }

  // System state logging
  logSystemState(context: LogContext, state: Record<string, any>): void {
    this.debug({...context, operation: 'SYSTEM_STATE'}, '📊 System state snapshot', state);
  }

  // Page navigation logging
  logPageChange(context: LogContext, from: string, to: string): void {
    this.info({...context, operation: 'NAVIGATION'}, `🔄 Page changed: ${from} → ${to}`);
  }

  // Extension lifecycle
  logExtensionEvent(context: LogContext, event: string, details?: any): void {
    this.info({...context, operation: 'EXTENSION_LIFECYCLE'}, `🔧 Extension event: ${event}`, details);
  }

  // Data operations
  logDataOperation(context: LogContext, operation: string, collection: string, recordCount?: number): void {
    this.debug({...context, operation: 'DATA_OP'}, `💾 ${operation} on ${collection}`, 
      recordCount !== undefined ? { recordCount } : {});
  }

  // Worker communication
  logWorkerMessage(context: LogContext, direction: 'SEND' | 'RECEIVE', workerType: string, messageType: string, requestId?: string): void {
    const arrow = direction === 'SEND' ? '📤' : '📥';
    this.debug({...context, operation: 'WORKER_MSG', requestId}, 
      `${arrow} ${direction} ${workerType}: ${messageType}`);
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Convenience functions for common logging scenarios
export const createContext = (component: string, operation?: string, extra?: Record<string, any>): LogContext => ({
  component,
  operation,
  extra
});

// Component-specific logger factories
export const createBackgroundLogger = (operation?: string) => 
  createContext('BACKGROUND', operation);

export const createContentLogger = (operation?: string) => 
  createContext('CONTENT', operation);

export const createMLLogger = (operation?: string) => 
  createContext('ML_WORKER', operation);

export const createUILogger = (operation?: string) => 
  createContext('UI', operation);

export const createStorageLogger = (operation?: string) => 
  createContext('STORAGE', operation);

export const createParserLogger = (operation?: string) => 
  createContext('PARSER', operation); 