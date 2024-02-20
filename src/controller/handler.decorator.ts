import { applyDecorators, Delete, Get, HttpCode, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

type HandlerOptionsWrite = {
    /**
     * @description Тип входных данных в теле запроса
     */
    payload?: any;
    /**
     * @description Является массивом
     */
    payloadIsArray?: boolean;
};
type HandlerOptionsResponse = {
    /**
     * @description Тип выходных данных ручки
     */
    response?: any;

    /**
     * @description Ответ является массивом
     */
    isArray?: boolean;
};

type HandlerOptionsDocs = {
    /**
     * @description Путь ручки
     */
    path?: string;

    /**
     * @description Названии Операции
     */
    operation?: string;

    /**
     * @description Описание ручки
     */
    description: string;
};

type HandlerOptions = HandlerOptionsDocs & HandlerOptionsResponse;

type PostHandlerOptions = HandlerOptions & HandlerOptionsWrite;
type PatchHandlerOptions = HandlerOptions & HandlerOptionsWrite;
type GetHandlerOptions = HandlerOptions;
type DeleteHandlerOptions = HandlerOptions;

export class Handler {
    static ApiOk(options: HandlerOptionsResponse) {
        return applyDecorators(
            ///
            HttpCode(200),
            ApiOkResponse({ type: options.response, isArray: options?.isArray }),
        );
    }

    static Docs(options: HandlerOptionsDocs) {
        return applyDecorators(
            ApiOperation({
                operationId: options?.operation,
                summary: options?.description,
            }),
        );
    }

    // ==================================
    //             Methods
    // ==================================

    static Post(options: PostHandlerOptions) {
        const decorators = [
            //
            Post(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
        ];
        if (options.payload) decorators.push(ApiBody({ type: options.payload, isArray: options.payloadIsArray }));
        return applyDecorators(...decorators);
    }

    static Patch(options: PatchHandlerOptions) {
        const decorators = [
            //
            Patch(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
        ];
        if (options.payload) decorators.push(ApiBody({ type: options.payload, isArray: options.payloadIsArray }));
        return applyDecorators(...decorators);
    }

    static Put(options: PatchHandlerOptions) {
        const decorators = [
            //
            Put(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
        ];
        if (options.payload) decorators.push(ApiBody({ type: options.payload, isArray: options.payloadIsArray }));
        return applyDecorators(...decorators);
    }

    static Get(options: GetHandlerOptions) {
        return applyDecorators(
            //
            Get(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
        );
    }

    static Delete(options: DeleteHandlerOptions) {
        return applyDecorators(
            //
            Delete(options.path),
            Handler.ApiOk({ ...options }),
            Handler.Docs(options),
        );
    }
}
