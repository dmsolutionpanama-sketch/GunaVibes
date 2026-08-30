import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

  return app;
};

export const apiApp = createServer();

