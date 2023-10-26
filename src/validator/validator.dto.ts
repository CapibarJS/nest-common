import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsDecimal,
    IsEmail,
    IsEnum,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
    ValidateNested,
    ValidationOptions,
} from 'class-validator';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
    toDate,
    toDateTime,
    toLowerCase,
    toUpperCase,
    transformToArray,
    transformToBoolean,
    transformToNumber,
    transformToString,
} from './transform.cast';
import { Options, RootOption, ValidationType } from './validator.type';

// ======--- Validate Type ---======
const IsTypes = {
    number: (options: ValidationOptions) => IsNumber({ maxDecimalPlaces: 24 }, options),
    string: IsString,
    boolean: IsBoolean,
    date: IsDate,
    object: IsObject,
    uuid: (options: ValidationOptions) => IsUUID('all', options),
    mongoId: IsMongoId,
    enum: undefined,
};

// eslint-disable-next-line @typescript-eslint/ban-types
const IsOptionalIf = (required: Function) =>
    ValidateIf((object, value) => {
        return !required(object) ? value !== null && value !== undefined : false;
    });

// ======--- Transform function ---======
const TransformFunc = {
    string: transformToString,
    number: transformToNumber,
    boolean: transformToBoolean,
    date: toDateTime,
    object: (args: any) => args?.obj?.[args?.key],
};

// ======--- Swagger Type ---======
const SwaggerType = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
};

const ApiPropertyType = {
    hide: ApiHideProperty,
    optional: ApiPropertyOptional,
};

function defaultValidateDecorations(options: RootOption) {
    // Set CONST
    options.optional = !(options?.required ?? false);
    options.apiProperty.isArray = options?.isArray;
    options.apiProperty.description = options.description;

    options.apiProperty.example =
        typeof options.example === 'object' || typeof options.example === 'function'
            ? () => options.example
            : options.example;

    const apiPropertyType: 'hide' | 'optional' | undefined = options?.exclude
        ? 'hide'
        : options?.hide
        ? 'hide'
        : options.optional
        ? 'optional'
        : undefined;

    const decorates = [];

    const isOptional = options?.optional ?? true;
    const isArray = options?.isArray ?? false;

    // ======--- Options ---======
    if (!isOptional && typeof options?.required === 'function') {
        decorates.push(IsOptionalIf(options.required));
    } else if (isOptional) decorates.push(IsOptional());

    const isTypeFunc = IsTypes[options.type]?.({ each: isArray });
    if (options?.type && isTypeFunc) decorates.push(isTypeFunc);

    // ======--- Is Array ---======
    if (options?.isArray) decorates.push(IsArray());

    // ======--- Swagger ---======
    const swaggerType = SwaggerType?.[options.type];

    const apiProperty = ApiPropertyType?.[apiPropertyType] ?? ApiProperty;
    decorates.push(
        apiProperty({
            ...options.apiProperty,
            ...(swaggerType && { type: swaggerType }),
            ...(options?.objectType && {
                type: () => options.objectType,
            }),
        }),
    );

    const disableTransform = options?._disableTransform ?? false;
    if (!disableTransform) {
        const transformFunction = TransformFunc?.[options.type];
        if (options?.isArray && options?.queryIsArray) {
            decorates.push(
                Transform(
                    transformToArray(
                        options?.transform?.func ?? transformFunction,
                        options?.transform?.separatorSplitArray,
                    ),
                ),
            );
        } else if (!options?.isArray && transformFunction) {
            decorates.push(Transform(transformFunction));
        }
    }

    // ======--- Other ---======
    if (!options?.exclude) decorates.push(Expose());
    decorates.push(...(options?.decorates ?? []));

    return decorates;
}

// ________________________________________________________________
// =--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=--=
// =======---=======---== Validate Decorators ==---=======---======
/**
 * Класс-декоратор для описания полей Dto.
 * - Делает валидацию полей (class-validator)
 * - Преобразовывает (Transform) поля в необходимые типы (class-transform)
 * - Описывает поля для OpenAPI v3 (@nest/swagger)
 * @example Необязательное поле с комментарием для OpenAPI.
 * > @Validate.String({ descriptions: 'Ключ в uuid формате' })
 * @example Обязательное поле.
 * > @Validate.String({ descriptions: '...', required: true })
 * @example Поле - массив.
 * > @Validate.String({ descriptions: '...', isArray: true })
 * @example Поле - массив. Если нужно использовать в query-параметрах в запросах.
 * > @Validate.String({ descriptions: '...', isArray: true, queryIsArray: true })
 * @example Не отображать поле в OpenApi.
 * > @Validate.String({ descriptions: '...', hide: true })
 * @example Не возвращать поле при методах class-transformer.
 * > @Validate.String({ descriptions: '...', exclude: true })
 * @example Передача дополнительных параметров apiProperty (OpenAPI).
 * > @Validate.String({ descriptions: '...', exclude: true })
 */
export class Validate {
    private static getOptions<T extends ValidationType>(
        options: Options[T],
        type?: ValidationType,
        objectType?: any,
    ): RootOption {
        if (!options?.apiProperty) options.apiProperty = {} as ApiPropertyOptions;
        const opt = options as RootOption;
        opt.type = type;
        opt.objectType = objectType;

        return opt;
    }

    /**
     * Декоратор UUID.
     * @example Base. Type: **string**
     * - @Validate.UUID({ descriptions: 'поле в UUID формате' })
     *   uuid: string;
     * @param {Options.uuid} options
     * @constructor
     */
    static UUID(options: Options['uuid']) {
        const opt = Validate.getOptions(options, 'uuid');
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор MongoId.
     * @example Base. Type: **string**
     * - @Validate.MongoId({ descriptions: 'поле в MongoId формате' })
     *   id: string;
     * @param {Options.mongoId} options
     * @constructor
     */
    static MongoId(options: Options['mongoId']) {
        const opt = Validate.getOptions(options, 'mongoId');
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор Enum.
     * @example Base. Type: **any**
     * - @Validate.Enum({ descriptions: 'поле в Enum формате', enum: EnumStatus })
     *   status: EnumStatus;
     * @param {Options.enum} options
     * @constructor
     */
    static Enum(options: Options['enum']) {
        const opt = Validate.getOptions(options, 'enum');
        opt.apiProperty.enum = options?.enum;
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======
        if (options?.enum) decorates.push(IsEnum(options.enum));

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор String.
     * @example Base. Type: **string**
     * - @Validate.String({ descriptions: 'поле в String формате' })
     * @example Максимальная и/или Минимальная длина строки. Type: **string**
     * - @Validate.String({ descriptions: '...', minLength: 5, maxLength: 10 })
     * @example Разрешить передавать пустую строку. Type: **string**
     * - @Validate.String({ descriptions: '...', notEmpty: false })
     * @example Поле с валидацией на E-mail. Type: **string**
     * - @Validate.String({ descriptions: '...', email: true })
     * @example Поле с валидацией на телефон. Type: **string**
     * - @Validate.String({ descriptions: '...', phone: true })
     * @example Поле с преобразованием строки в верхний регистр. Type: **string**
     * - @Validate.String({ descriptions: '...', upperCase: true })
     * @example Поле с преобразованием строки в нижний регистр. Type: **string**
     * - @Validate.String({ descriptions: '...', lowerCase: true })
     * @param {Options.string} options
     * @constructor
     */
    static String(options: Options['string']) {
        const opt = Validate.getOptions(options, 'string');
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======
        if (options?.maxLength) decorates.push(MaxLength(options.maxLength));
        if (options?.minLength) decorates.push(MinLength(options.minLength));
        if (options?.notEmpty ?? true) decorates.push(IsNotEmpty());
        if (options?.isEmail) decorates.push(IsEmail(), Transform(toLowerCase));
        if (options?.isPhone) decorates.push(IsPhoneNumber());
        if (options?.isUrl) decorates.push(IsUrl(undefined, { each: options.isArray }));
        if (options?.upperCase) decorates.push(Transform(toUpperCase));
        if (options?.lowerCase) decorates.push(Transform(toLowerCase));

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор Number. По умолчанию динамический тип между Float и Int
     * @example Base. Type: **number**
     * - @Validate.Number({ descriptions: 'поле в Number формате' })
     * @example Максимальное и/или Минимальное число. Type: **number**
     * - @Validate.Number({ descriptions: '...', min: 5, max: 10 })
     * @example Поле преобразовывает и валидирует значение в Int. Type: **Int**
     * - @Validate.Number({ descriptions: '...', isInt: true })
     * @example Поле преобразовывает значение в Float. Type: **Float**
     * - @Validate.Number({ descriptions: '...', isFloat: true })
     * @param {Options.number} options
     * @constructor
     */
    static Number(options: Options['number']) {
        const opt = Validate.getOptions(options, 'number');
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======
        if (options?.max) decorates.push(Max(options.max));
        if (options?.min) decorates.push(Min(options.min));
        if (options?.isInt) decorates.push(IsInt());
        if (options?.isFloat) decorates.push(IsDecimal());

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор Boolean. Type: **boolean**
     * @example Base. Type: **boolean**
     * - @Validate.Boolean({ descriptions: 'поле в Boolean формате' })
     * @param {Options.boolean} options
     * @constructor
     */
    static Boolean(options: Options['boolean']) {
        const opt = Validate.getOptions(options, 'boolean');
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор Date.
     * @example Base. Type: **Date**
     * - @Validate.Date({ descriptions: 'поле в Date формате' })
     * @example Переводить в поле в Date сохраняя время. Если указано false, то дата становится формата yyyy-mm-dd. Type: **string**
     * - @Validate.Date({ descriptions: '...', time: false })
     * @param {Options.number} options
     * @constructor
     */
    static Date(options: Options['date']) {
        const isDateTime = options?.time ?? true;
        const opt = Validate.getOptions(options, isDateTime ? 'date' : 'string');
        const decorates = [
            ...defaultValidateDecorations({
                ...opt,
                _disableTransform: !isDateTime,
            }),
        ];

        // ======--- Options ---======
        if (!isDateTime) decorates.push(Transform(toDate));

        return applyDecorators(...decorates);
    }

    /**
     * Декоратор Object.
     * @example Base. Type: **Object** | **any**
     * - @Validate.Date({ descriptions: 'поле в Object формате' })
     *  json: object;
     * @example Типизированное поле. Приводит параметр к типу указанному в `type`. Type: **Object** | **any**
     * - @Validate.Date({ descriptions: 'поле в Object формате', type: StatusDto })
     *  status: StatusDto;
     * @param {Options.number} options
     * @constructor
     */
    static Object(options: Options['object']) {
        const opt = Validate.getOptions(options, 'object', options?.type);
        const decorates = [...defaultValidateDecorations(opt)];

        // ======--- Options ---======
        if (opt?.objectType) {
            decorates.push(Type(() => opt.objectType));
            decorates.push(ValidateNested());
        }

        return applyDecorators(...decorates);
    }
}
