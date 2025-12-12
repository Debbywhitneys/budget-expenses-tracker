import { Injectable, ConsoleLogger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logDir = 'logs';
  private readonly logFile = 'myLogFile.log';

  constructor() {
    super();
    this.ensureLogDirExists();
  }

  private async ensureLogDirExists(): Promise<void> {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  protected getTimestamp(): string {
    const now = new Date();
    const nairobiTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }),
    );

    const month = String(nairobiTime.getMonth() + 1).padStart(2, '0');
    const day = String(nairobiTime.getDate()).padStart(2, '0');
    const year = String(nairobiTime.getFullYear());

    let hours = nairobiTime.getHours();
    const minutes = String(nairobiTime.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const hoursStr = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${hoursStr}:${minutes} ${ampm}`;
  }

  private async writeToFile(
    level: string,
    message: string,
    context?: string,
    ip?: string,
  ): Promise<void> {
    const timestamp = this.getTimestamp();
    const ipInfo = ip ? ` - IP: ${ip}` : '';
    const contextInfo = context ? ` - [${context}]` : '';
    const logEntry = `${timestamp}${ipInfo}${contextInfo} ${level.toUpperCase()}: ${message}\n`;

    const logPath = join(this.logDir, this.logFile);

    try {
      await fs.appendFile(logPath, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(message: any, context?: string, ip?: string): void {
    super.log(message, context);
    this.writeToFile('log', String(message), context, ip);
  }

  error(message: any, trace?: string, context?: string, ip?: string): void {
    super.error(message, trace, context);
    const errorMessage = trace ? `${message}\nStack Trace: ${trace}` : message;
    this.writeToFile('error', String(errorMessage), context, ip);
  }

  warn(message: any, context?: string, ip?: string): void {
    super.warn(message, context);
    this.writeToFile('warn', String(message), context, ip);
  }

  debug(message: any, context?: string, ip?: string): void {
    super.debug(message, context);
    this.writeToFile('debug', String(message), context, ip);
  }

  verbose(message: any, context?: string, ip?: string): void {
    super.verbose(message, context);
    this.writeToFile('verbose', String(message), context, ip);
  }

  // Custom method for database operation logging
  database(
    operation: string,
    table: string,
    context?: string,
    ip?: string,
  ): void {
    const message = `Database ${operation} operation on ${table}`;
    this.log(message, context, ip);
  }

  // Custom method for authentication logging
  auth(message: string, userId?: number, context?: string, ip?: string): void {
    const authMessage = userId ? `User ${userId}: ${message}` : message;
    this.log(authMessage, context, ip);
  }
}
