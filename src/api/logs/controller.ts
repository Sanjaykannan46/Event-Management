import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { LogFile,LogEntry } from './types.js';
const getAllLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logsDir = path.resolve(process.cwd(), 'logs');
      const files = await fs.readdir(logsDir);
      const logFiles: LogFile[] = [];
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          const logEntries: LogEntry[] = content
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
              try {
                if (line.startsWith('{')) {
                  return JSON.parse(line);
                } else {
                  const match = line.match(/\[(.*?)\]\s+(\w+):\s+(.*)/);
                  if (match) {
                    const [_, timestamp, level, messageRaw] = match;
                    
                    let message = messageRaw;
                    let meta = {};
                    
                    const metaStart = messageRaw.indexOf('\n{');
                    if (metaStart > -1) {
                      message = messageRaw.substring(0, metaStart).trim();
                      try {
                        const metaString = messageRaw.substring(metaStart).trim();
                        meta = JSON.parse(metaString);
                      } catch (e) {
                      }
                    }
                    
                    return {
                      timestamp,
                      level,
                      message,
                      meta
                    };
                  }
                  return {
                    level: "unknown",
                    message: line,
                    timestamp: new Date().toISOString()
                  };
                }
              } catch (e) {
                return {
                  level: "unknown",
                  message: line,
                  timestamp: new Date().toISOString()
                };
              }
            });
          
          logFiles.push({
            name: file,
            content: logEntries
          });
        }
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const level = (req.query.level as string)?.toLowerCase();
      
      let allLogs = logFiles.flatMap(file => 
        file.content.map(entry => ({
          ...entry,
          file: file.name
        }))
      );
      
      if (level) {
        allLogs = allLogs.filter(log => log.level?.toLowerCase() === level);
      }
      
      allLogs.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
      
      const totalLogs = allLogs.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedLogs = allLogs.slice(startIndex, endIndex);
      
      res.status(200).json({
        success: true,
        count: paginatedLogs.length,
        total: totalLogs,
        page,
        totalPages: Math.ceil(totalLogs / limit),
        data: paginatedLogs,
        files: logFiles.map(file => file.name)
      });
      
    } catch (error) {
      logger.error(`Error retrieving logs: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve logs",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  

const getLogsByFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const filePath = path.resolve(process.cwd(), 'logs', filename);
      
      if (!filePath.startsWith(path.resolve(process.cwd(), 'logs'))) {
        res.status(403).json({
          success: false,
          message: "Access denied"
        });
        return;
      }
      
      try {
        await fs.access(filePath);
      } catch (e) {
        res.status(404).json({
          success: false,
          message: "Log file not found"
        });
        return;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      
      const logEntries = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            const match = line.match(/\[(.*?)\]\s+(\w+):\s+(.*)/);
            if (match) {
              const [_, timestamp, level, message] = match;
              return { timestamp, level, message };
            }
            return { level: "unknown", message: line, timestamp: new Date().toISOString() };
          }
        });
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const totalLogs = logEntries.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedLogs = logEntries.slice(startIndex, endIndex);
      
      res.status(200).json({
        success: true,
        file: filename,
        count: paginatedLogs.length,
        total: totalLogs,
        page,
        totalPages: Math.ceil(totalLogs / limit),
        data: paginatedLogs
      });
      
    } catch (error) {
      logger.error(`Error retrieving logs from file: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve logs",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

export {
    getAllLogs,
    getLogsByFile
};