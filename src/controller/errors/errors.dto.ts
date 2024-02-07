import { ErrorCodes } from './error-codes.enum';
import { Validate } from '../../validator';

export class BadRequestDto {
    @Validate.Number({ description: 'Код статуса', example: 400 })
    statusCode = 400;

    @Validate.String({ description: 'Код ошибки', example: 'something wrong' })
    message: string;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.BAD_REQUEST })
    errorCode = ErrorCodes.BAD_REQUEST;

    constructor() {
        this.errorCode = ErrorCodes.BAD_REQUEST;
    }
}

export class InternalServerErrorDto {
    @Validate.Number({ description: 'Код статуса', example: 500 })
    statusCode = 500;

    @Validate.String({ description: 'Код ошибки', example: 'something wrong' })
    message: string;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.INTERNAL_SERVER_ERROR })
    errorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
}

export class NotFoundRequest {
    @Validate.Number({ description: 'Код статуса', example: 404 })
    statusCode = 404;

    @Validate.String({ description: 'Код ошибки', example: 'something wrong' })
    message: string;

    @Validate.Number({ description: 'Код ошибки', example: ErrorCodes.NOT_FOUND })
    errorCode = ErrorCodes.NOT_FOUND;
}
