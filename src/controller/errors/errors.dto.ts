import { ErrorCodes } from './error-codes.enum';
import {Validate} from "../../validator";

export class ErrorDto {
    @Validate.Number({ description: 'Код статуса', example: 400 })
    statusCode: number;

    @Validate.String({ description: 'Сообщение', example: 'something wrong' })
    message: string;

    @Validate.String({ description: 'Описание ошибки', example: 'Bad Request' })
    error: string;

    @Validate.Enum({ description: 'Код ошибки', example: ErrorCodes.BAD_REQUEST, enum: ErrorCodes })
    errorCode: ErrorCodes;
}

export class BadRequestDto extends ErrorDto {
    statusCode = 400;

    @Validate.String({ description: 'Код ошибки', example: ['something wrong, something wrong'] })
    // @ts-ignore
    message: Array<string> | string;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.BAD_REQUEST })
    errorCode = ErrorCodes.BAD_REQUEST;

    constructor() {
        super();
        this.errorCode = ErrorCodes.BAD_REQUEST;
    }
}

export class InternalServerErrorDto extends ErrorDto {
    statusCode = 500;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.INTERNAL_SERVER_ERROR })
    errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
}

export class ConflictErrorDto extends ErrorDto {
    statusCode = 409;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.CONFLICT })
    errorCode = ErrorCodes.CONFLICT;
}

export class NotFoundRequest extends ErrorDto {
    statusCode = 404;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.NOT_FOUND })
    errorCode = ErrorCodes.NOT_FOUND;
}

export class ForbiddenResponse extends ErrorDto {
    statusCode = 403;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.FORBIDDEN })
    errorCode = ErrorCodes.FORBIDDEN;
}
