import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    res.on('finish', () => {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode}`);
    });
    next();
  }
}
