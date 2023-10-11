import { Validate } from '../../validator';

export class SuccessResponse {
    @Validate.Boolean({ description: 'Статус', example: true, required: true })
    status: boolean;
}
