import {
    ArgumentMetadata,
    Body,
    Injectable,
    Param,
    UsePipes,
    ValidationPipe,
    ValidationPipeOptions,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import { QueryFilter, QueryFilterHandler } from '../filter/query-filter.decorator';
import { QueryFilterInput } from '../filter/query-filter.input';
import { Handler } from '../handler.decorator';

type DtoOptions<T = any, C = any, U = any> = {
    Read: T;
    Create?: C;
    Update?: U;
};
type CrudControllerOptions = {
    dto: DtoOptions;
};

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
    constructor(
        options: ValidationPipeOptions,
        private readonly targetTypes: { body?: any; query?: any; param?: any },
    ) {
        super(options);
    }

    async transform(value: any, metadata: ArgumentMetadata) {
        const targetType = this.targetTypes[metadata.type];
        if (!targetType) {
            return super.transform(value, metadata);
        }
        return super.transform(value, { ...metadata, metatype: targetType });
    }
}

export const CrudController = (options: CrudControllerOptions) => {
    if (!options) throw new Error('CrudControllerOptions not initialized');
    /**
     * Dto init
     */
    if (options?.dto?.Read) {
        // Dto Update
        if (options.dto?.Create && !options.dto?.Update) options.dto.Update = options.dto.Create;
        else if (!options.dto?.Update) options.dto.Update = options.dto.Read;

        // Dto Create
        if (!options.dto?.Create) options.dto.Create = options.dto.Read;
    }

    const createPipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { body: options.dto.Create });
    const updatePipe = new AbstractValidationPipe({ whitelist: true, transform: true }, { body: options.dto.Update });

    // ----------------

    @Injectable()
    class Controller<TService extends CrudService<any> = any, TRDto = any, TCDto = TRDto, TUDto = TCDto> {
        constructor(public service: TService) {}

        @Handler.Get({
            path: 'list',
            operation: 'list',
            description: 'Получение постраничного списка элементов с фильтрацией и сортировкой',
            response: options.dto.Read,
            isArray: true,
        })
        @QueryFilterHandler()
        async list(
            @QueryFilter() queryFilter: QueryFilterInput,
        ): Promise<{ total: number; items: (TRDto | unknown)[] }> {
            const filter = QueryFilterInput.getOptions(queryFilter);
            return this.service.list({ ...filter });
        }

        @Handler.Get({
            path: 'findMany',
            operation: 'findMany',
            description: 'Получение списка элементов с фильтрацией и сортировкой',
            response: options.dto.Read,
            isArray: true,
        })
        @QueryFilterHandler()
        async findMany(@QueryFilter() queryFilter: QueryFilterInput): Promise<(TRDto | unknown)[]> {
            const filter = QueryFilterInput.getOptions(queryFilter);
            return this.service.findMany({ ...filter });
        }

        @Handler.Get({
            path: 'findById/:id',
            operation: 'findById',
            description: 'Получение элемента по ID',
            response: options.dto.Read,
        })
        async findById(@Param('id') id: string): Promise<TRDto | unknown> {
            return this.service.findById(id);
        }

        @UsePipes(createPipe)
        @Handler.Post({
            path: 'create',
            operation: 'create',
            description: 'Создание элемента',
            response: options.dto.Read,
            payload: options.dto.Create,
        })
        async create(@Body() payload: TCDto): Promise<TRDto | unknown> {
            return this.service.create(payload);
        }

        @UsePipes(updatePipe)
        @Handler.Patch({
            path: 'update/:id',
            operation: 'update',
            description: 'Изменение элемента по ID',
            response: options.dto.Read,
            payload: options.dto.Create,
        })
        async update(@Param('id') id: string, @Body() payload: TUDto): Promise<TRDto | unknown> {
            return this.service.update(id, payload);
        }

        @Handler.Delete({
            path: 'delete/:id',
            operation: 'delete',
            description: 'Удаление элемента по ID',
        })
        async delete(@Param('id') id: string) {
            return this.service.deleteById(id);
        }
    }

    return Controller;
};
