
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';


export function TransformDto<T>(dto: Type<T>) {
  return UseInterceptors(new TransformDtoInterceptor(dto));
}

@Injectable()
export class TransformDtoInterceptor<T> implements NestInterceptor {
  constructor(private readonly dtoClass: Type<T>) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const isAuthEndpoint = request.url.includes('/auth');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        map((data) => {
          // only Message
          if (data && typeof data === 'object' && 'message' in data && Object.keys(data).length === 1) {
            return data;
          }
          // if data is empty
          if (data === null || data === undefined) {
            return { message: 'Success' };
          }

          // if pagination
          if ('hasNextPage' in data && 'items' in data) {
            const { items, hasNextPage, cursor } = data;
            return {
              message: 'Success',
              items: plainToInstance(this.dtoClass, items, {
                excludeExtraneousValues: true,
              }),
              hasNextPage,
              cursor,
            }
          }

          // if auth response
          if (isAuthEndpoint && 'user' in data && 'accessToken' in data) {
            const { user, accessToken } = data;
            return {
              message: 'Success',
              user: plainToInstance(this.dtoClass, user, {
                excludeExtraneousValues: true,
              }),
              accessToken,
            };
          }

          // genarel case
          return {
            message: 'Success',
            data: plainToInstance(this.dtoClass, data, {
              excludeExtraneousValues: true,
            }),
          };

        }),
      );
  }
}
