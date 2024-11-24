import { create } from 'zustand';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

interface AttemptSummary {
  total: number;
  successful: number;
  failed: number;
  averageDuration: number;
}

export class MappingLogger {
  private logs: LogEntry[] = [];
  private attempts: AttemptSummary = {
    total: 0,
    successful: 0,
    failed: 0,
    averageDuration: 0
  };
  private startTimes: Map<string, number> = new Map();

  clear() {
    this.logs = [];
    this.attempts = {
      total: 0,
      successful: 0,
      failed: 0,
      averageDuration: 0
    };
    this.startTimes.clear();
    console.log('Mapping logs cleared');
  }

  log(level: 'info' | 'warning' | 'error', message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    // Format duration if present
    if (data?.duration) {
      if (typeof data.duration === 'number') {
        logEntry.duration = data.duration;
        data.duration = `${data.duration.toFixed(2)}ms`;
      } else {
        delete data.duration;
      }
    }
    
    this.logs.push(logEntry);
    
    // Format console output
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const duration = logEntry.duration ? ` (${data.duration})` : '';
    
    console.log(
      `[${timestamp}] [${level.toUpperCase()}] ${message}${duration}`,
      data ? '\n' + JSON.stringify(data, null, 2) : ''
    );
  }

  startAttempt(transactionId: string) {
    this.startTimes.set(transactionId, performance.now());
    this.attempts.total++;
  }

  endAttempt(transactionId: string, success: boolean) {
    const startTime = this.startTimes.get(transactionId);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.startTimes.delete(transactionId);

      if (success) {
        this.attempts.successful++;
      } else {
        this.attempts.failed++;
      }

      // Update average duration
      const totalAttempts = this.attempts.successful + this.attempts.failed;
      this.attempts.averageDuration = (
        (this.attempts.averageDuration * (totalAttempts - 1) + duration) / 
        totalAttempts
      );

      return duration;
    }
    return 0;
  }

  getLogs() {
    return this.logs;
  }

  getAttemptSummary(): AttemptSummary {
    return { ...this.attempts };
  }

  getPerformanceMetrics() {
    return {
      averageDuration: this.attempts.averageDuration,
      successRate: this.attempts.total > 0 
        ? (this.attempts.successful / this.attempts.total) * 100 
        : 0,
      totalAttempts: this.attempts.total,
      successfulAttempts: this.attempts.successful,
      failedAttempts: this.attempts.failed
    };
  }
}

export const mappingLogger = new MappingLogger();