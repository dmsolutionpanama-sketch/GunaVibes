import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes';
import { db } from './db';

export const createServer = () => {
  const app = express();

  // Hide server technology
  app.disable('x-powered-by');

  // Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure storage folder structure exists on startup
  db.ensureStorageDirectories();

  // Serve uploads publicly with caching and video range-stream support
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: '30d',
      etag: true,
      setHeaders: (res, filePath) => {
        if (
          filePath.endsWith('.mp4') ||
          filePath.endsWith('.webm') ||
          filePath.endsWith('.mov') ||
          filePath.endsWith('.ogv')
        ) {
          res.setHeader('Accept-Ranges', 'bytes');
        }
      },
    })
  );

  // Honeypot Trap Routes to catch & block hack tools and malicious scanners
  const honeypotPaths = [
    '/wp-admin',
    '/wp-login.php',
    '/admin.php',
    '/phpmyadmin',
    '/.env',
    '/xmlrpc.php',
    '/wp-config.php',
    '/shell.php',
    '/.git',
    '/config.json',
  ];

  honeypotPaths.forEach((badPath) => {
    app.all(badPath, (req: Request, res: Response) => {
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      db.logSecurityThreat(ip, req.path, 'Honeypot Scanner Trap Hit');
      res.status(403).json({ error: 'Access Denied: Security Violation Logged' });
    });
  });

  // Mount API router
  app.use('/api', router);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Guna Vibes API', timestamp: new Date().toISOString() });
  });

  // Global Error Handler guaranteeing JSON responses (prevents HTML error leak)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Express API error caught:', err);
    if (res.headersSent) {
      return next(err);
    }
    const status = typeof err.status === 'number' ? err.status : 500;
    res.status(status).json({
      success: false,
      error: err.message || 'Error procesando la solicitud en el servidor',
    });
  });

  return app;
};

export const apiApp = createServer();

