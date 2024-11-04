import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          this.logger.log(`${method} ${url} ${Date.now() - now}ms`, {
            body: body,
            response: data,
          });
        },
        error: (error: any) => {
          this.logger.error(`${method} ${url} ${Date.now() - now}ms`, {
            body: body,
            error: error.message,
          });
        },
      }),
    );
  }
}
