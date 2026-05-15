export interface LogFile {
    name: string;
    content: LogEntry[];
  }
  
export interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    meta?: any;
    [key: string]: any;
  }