import { applyDecorators, Delete, Get, HttpCode, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { FormDataRequest } from 'nestjs-form-data';
import { BadRequestDto, InternalServerErrorDto, NotFoundRequest } from './errors';
import { SuccessResponse } from './request/shared.dto';

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
type PostFileHandlerOptions = HandlerOptions & HandlerOptionsWrite;
type PatchFileHandlerOptions = PostFileHandlerOptions;

export class Handler {
    static ApiErrors() {
        return applyDecorators(
            ApiBadRequestResponse({ type: () => BadRequestDto }),
            ApiInternalServerErrorResponse({ type: () => InternalServerErrorDto }),
            ApiNotFoundResponse({ type: () => NotFoundRequest }),
        );
    }

    static ApiOk(options: HandlerOptionsResponse) {
        return applyDecorators(
            ///
            HttpCode(200),
            ApiOkResponse({ type: () => options.response, isArray: options?.isArray }),
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
            UsePipes(new ValidationPipe({ transform: true, validateCustomDecorators: true })),
            //
            Post(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
            Handler.ApiErrors(),
        ];
        if (options.payload) decorators.push(ApiBody({ type: () => options.payload, isArray: options.payloadIsArray }));
        return applyDecorators(...decorators);
    }

    static Patch(options: PatchHandlerOptions) {
        const decorators = [
            UsePipes(new ValidationPipe({ transform: true })),
            //
            Patch(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
            Handler.ApiErrors(),
        ];
        if (options.payload) decorators.push(ApiBody({ type: () => options.payload, isArray: options.payloadIsArray }));
        return applyDecorators(...decorators);
    }

    static Put(options: PatchHandlerOptions) {
        const decorators = [
            UsePipes(new ValidationPipe({ transform: true })),
            //
            Put(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
            Handler.ApiErrors(),
        ];
        if (options.payload) decorators.push(ApiBody({ type: () => options.payload, isArray: options.payloadIsArray }));
        return applyDecorators(...decorators);
    }

    static Get(options: GetHandlerOptions) {
        return applyDecorators(
            UsePipes(new ValidationPipe({ transform: true })),
            //
            Get(options.path),
            Handler.ApiOk(options),
            Handler.Docs(options),
            Handler.ApiErrors(),
        );
    }

    static Delete(options: DeleteHandlerOptions) {
        return applyDecorators(
            UsePipes(new ValidationPipe({ transform: true })),
            //
            Delete(options.path),
            Handler.ApiOk({ response: SuccessResponse, ...options }),
            Handler.Docs(options),
            Handler.ApiErrors(),
        );
    }

    // ----- File ----
    private static FileMethod(decorator: any, options: PatchFileHandlerOptions | PostFileHandlerOptions) {
        const { payload, ...opts } = options;
        const decorators = [
            UsePipes(new ValidationPipe({ transform: true })),
            //
            decorator(opts),
            FormDataRequest(),
            ApiConsumes('multipart/form-data'),
            // UseInterceptors(FileInterceptor('file')),
        ];
        if (payload) decorators.push(ApiBody({ schema: payload }));
        return applyDecorators(...decorators);
    }

    static PatchFile(options: PatchFileHandlerOptions) {
        return Handler.FileMethod(Handler.Patch, options);
    }

    static PostFile(options: PostHandlerOptions) {
        return Handler.FileMethod(Handler.Post, options);
    }
}
