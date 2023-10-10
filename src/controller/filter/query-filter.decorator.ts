import { applyDecorators, createParamDecorator } from '@nestjs/common/decorators';
import { QueryFilterOptions } from './query-filter.interface';
import { ExecutionContext } from '@nestjs/common';
import { QueryFilterService } from './query-filter.service';
import { ApiQuery } from '@nestjs/swagger';
import { QueryFilterInput } from './query-filter.input';

// const QueryFilterDecorator = createParamDecorator((data: Partial<QueryFilterOptions>, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return new QueryFilterService().parseQuery(request.query, data);
// });

export function QueryFilterHandler() {
    return applyDecorators(ApiQuery({ type: QueryFilterInput, required: false }));
}

export const QueryFilter = (data?: Partial<QueryFilterOptions>) => {
    return (target: unknown, propertyKey: string | symbol, parameterIndex: number) => {
        const paramDecorator = createParamDecorator(
            (defaultData: Partial<QueryFilterOptions>, ctx: ExecutionContext) => {
                const request = ctx.switchToHttp().getRequest();
                return new QueryFilterService().parseQuery(request.query, data);
            },
        )();

        paramDecorator(target, propertyKey, parameterIndex);
    };
};
