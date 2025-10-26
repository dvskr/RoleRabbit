/**
 * Logger Utility
 * Environment-aware logging that removes logs in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isProduction && level === 'debug') return false;
    return true;
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) return;
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return;
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    if (!this.shouldLog('error')) return;
    console.error(`[ERROR] ${message}`, ...args);
  }

  log(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for default import
export default logger;

