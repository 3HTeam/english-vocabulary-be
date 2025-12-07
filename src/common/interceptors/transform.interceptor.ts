import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data?: T;
  message?: string;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const {
            message,
            data: nestedData,
            ...rest
          } = data as Record<string, unknown>;

          const payload = (nestedData ?? rest) as T;
          const hasPayload =
            payload !== undefined &&
            !(
              typeof payload === 'object' &&
              payload !== null &&
              Object.keys(payload as Record<string, unknown>).length === 0
            );

          const response: Response<T> = {
            statusCode,
          };

          if (hasPayload) {
            response.data = payload;
          }

          if (message) {
            response.message = message as string;
          }

          return response;
        }

        const response: Response<T> = {
          statusCode,
        };

        if (data !== undefined) {
          response.data = data as T;
        }

        return response;
      }),
    );
  }
}
