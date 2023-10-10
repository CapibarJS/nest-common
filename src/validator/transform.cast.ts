import { TransformFnParams } from 'class-transformer';

export type TransformFunction = (params: Partial<TransformFnParams>) => any;

const transform = (params: TransformFnParams, callback: (value: any) => any) => {
    if ([undefined, null].includes(params?.value)) return params?.value;
    return callback(params.value);
};

export function toLowerCase(params: TransformFnParams): string {
    return transform(params, (v) => v.toLowerCase());
}

export function toUpperCase(params: TransformFnParams): string {
    return transform(params, (v) => v.toUpperCase());
}

export function trim(value: string): string {
    return value.trim();
}

export function toDateTime(params: TransformFnParams): Date {
    return transform(params, (v) => new Date(v));
}

export function toDate(params: TransformFnParams): Date {
    const onlyDate = (v: Date) => v.toJSON().split('T')[0];
    return transform(params, (v) => (v instanceof Date ? onlyDate(v) : onlyDate(new Date(v))));
}

export function transformToBoolean({ value }: TransformFnParams): boolean | undefined | null {
    if (value === undefined) return;
    if (value === 'null' || value === null) return null;
    return value == 'true' || value == '1';
}

export function transformToNumber(params: TransformFnParams): number {
    return transform(params, (v) => Number(v));
}

export function transformToString(params: TransformFnParams): string {
    return transform(params, (v) => String(v));
}

export const transformToArray =
    (transform: TransformFunction = transformToString, separator = ',') =>
    (params: TransformFnParams) => {
        if (params.value === undefined) return;
        return String(params.value)
            .split(separator)
            .map((x) => transform({ value: x }));
    };
