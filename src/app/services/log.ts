import { Injectable } from '@angular/core';

export interface LogEntry {
  message: string;
  time: Date;
}

@Injectable({ providedIn: 'root' })
export class LogService {
  logs: LogEntry[] = [];

  add(message: string) {
    this.logs.unshift({ message, time: new Date() });
  }
}