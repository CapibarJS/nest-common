type ModelMapperCallback<T, K = T> = (data: T | K) => Record<keyof T | string, unknown>;

type ModelMapperOptions<T, K = T> = {
    hideId: boolean;
    callback: ModelMapperCallback<T, K>;
};

export class ModelMapperBase<TModel = any, TResult = TModel, TModelData = TResult> {
    constructor(
        protected fields: (keyof TResult)[],
        protected target?: TModelData,
        protected options?: ModelMapperOptions<TModel, TModelData>,
    ) {
        if (!this.options) this.options = {} as ModelMapperOptions<TModel, TModelData>;
    }

    mapToResponse<T = TResult>(
        data: TModel | TModelData,
        fields: (keyof TResult)[] = this.fields,
        options?: ModelMapperOptions<TModel, TModelData>,
    ): T {
        return {
            ...(!options?.hideId && { id: String(data?.['_id'] ?? data?.['id']) }),
            ...Object.fromEntries(Object.entries(data).filter(([key]) => fields.includes(key as keyof TResult))),
            ...options?.callback?.(data),
        } as T;
    }

    mapToListResponse<T = TResult>(
        arr: Array<TModel | TModelData>,
        fields: (keyof TResult)[] = this.fields,
        options?: ModelMapperOptions<TModel, TModelData>,
    ) {
        return arr.map((x) => this.mapToResponse<T>(x, fields, options)) as T[];
    }
}
