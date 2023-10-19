export interface QueryFilterModel {
    page: number;
    skip: number;
    take: number;
    sort: QueryFilterSortModel[];
    filter: QueryFilterWhereModel;
    select: QueryFilterSelectModel;
    pagination: boolean;
}

export interface QueryFilterSortModel {
    [k: string]: 'asc' | 'desc';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFilterWhereModel = Record<string, any>;

export interface QueryFilterSelectModel {
    [k: string]: boolean | QueryFilterSelectModel;
}

export interface QueryFilterOptions {
    limitParamName: string;
    limitDefaultValue: number;
    maxLimit: number;

    pageParamName: string;
    pageDefaultValue: number;

    orderParamName: string;
    orderDefaultValue: string;

    filterParamName: string;
    filterDefaultValue: object;

    selectParamName: string;
    selectDefaultValue: QueryFilterSelectModel;
}
