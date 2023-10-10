import { ApiPropertyOptions } from '@nestjs/swagger';
import { TransformFunction } from './transform.cast';

export type ValidationType = 'number' | 'string' | 'boolean' | 'date' | 'object' | 'uuid' | 'mongoId' | 'enum';

export type RootOption = {
    type?: ValidationType;
    objectType?: any;
    apiProperty?: ApiPropertyOptions;
    required?: boolean | ((o: any) => boolean); // default=false
    optional?: boolean; // default=false --> Use require: true
    isArray?: boolean;
    description: string;
    exclude?: boolean; // default=false
    hide?: boolean; // default=false
    queryIsArray?: boolean;
    example?: any;

    transform?: {
        func?: TransformFunction;
        separatorSplitArray?: string; // Default=','. Указание разделителя для массивов.
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    decorates?: Function[];

    _disableTransform?: boolean;
};

export type ValidateOptions = Omit<RootOption, 'type' | 'objectType' | '_disableTransform'>;

export type Options = {
    string: ValidateOptions & {
        maxLength?: number;
        minLength?: number;
        notEmpty?: boolean;
        isEmail?: boolean;
        isPhone?: boolean;
        isUrl?: boolean;
        upperCase?: boolean;
        lowerCase?: boolean;
    };
    number: ValidateOptions & {
        max?: number;
        min?: number;
        isInt?: boolean;
        isFloat?: boolean;
    };
    boolean: ValidateOptions;
    date: ValidateOptions & {
        /**
         * Переводить в поле в Date сохраняя время. Если указано false, то время обрезается и поле становиться формата yyyy-mm-dd
         * @default true
         */
        time?: boolean;
    };
    object: ValidateOptions & { type?: any };
    uuid: ValidateOptions;
    mongoId: ValidateOptions;
    enum: ValidateOptions & { enum: any };
};
