import { BadRequestException } from '@nestjs/common';

import {
    QueryFilterModel,
    QueryFilterOptions,
    QueryFilterSelectModel,
    QueryFilterSortModel,
} from './query-filter.interface';
import { set } from 'lodash';

const defaultQueryFilterOptions: QueryFilterOptions = {
    limitParamName: 'take',
    limitDefaultValue: 20,
    maxLimit: 10000,

    filterParamName: 'filter',
    filterDefaultValue: {},

    selectParamName: 'select',
    selectDefaultValue: {},

    pageParamName: 'page',
    pageDefaultValue: 1,

    orderParamName: 'sort',
    orderDefaultValue: 'id',
};

export class QueryFilterService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private query: any;
    private options: QueryFilterOptions = defaultQueryFilterOptions;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query: any,
        options: Partial<QueryFilterOptions> = {},
    ): QueryFilterModel {
        if (typeof query !== 'object') {
            throw new BadRequestException('Malformed QueryString');
        }

        this.options = { ...defaultQueryFilterOptions, ...options };

        this.query = query;

        const page = this.parsePage();
        const take = this.parseLimit();
        const sort = this.parseSort();
        const filter = this.parseFilter();
        const select = this.parseSelect();

        return {
            page,
            skip: this.calculateSkip(page, take),
            take,
            sort,
            filter,
            select: Object.keys(select).length ? select : undefined,
        };
    }

    private parsePage(): number {
        const pageRequestData = this.query[this.options.pageParamName];
        const page = parseInt(pageRequestData) || this.options.pageDefaultValue;
        if (page < 1) return this.options.pageDefaultValue;
        return page;
    }

    private parseLimit(): number {
        const limitRequestData = this.query[this.options.limitParamName];
        let limit = parseInt(limitRequestData) || this.options.limitDefaultValue;
        if (limit < 1) limit = this.options.limitDefaultValue;
        if (limit > this.options.maxLimit) limit = this.options.maxLimit;
        return limit;
    }

    private calculateSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    private parseFilter(): object {
        let filter: object = {};
        const filterRequestData = this.query[this.options.filterParamName] || this.options.filterDefaultValue;
        try {
            filter = JSON.parse(filterRequestData);
        } catch (e) {
            return filter;
        }
        return filter;
    }

    private parseSelect(): QueryFilterSelectModel {
        const selectRequestData = this.query[this.options.selectParamName] || this.options.selectDefaultValue;
        try {
            return JSON.parse(selectRequestData);
        } catch {
            return {};
        }
    }

    private parseSort(): QueryFilterSortModel[] {
        const sort: QueryFilterSortModel[] = [];

        const sortRequestData = this.query[this.options.orderParamName] || this.options.orderDefaultValue;

        const sortQuery = (sortRequestData as string).trim();

        if (sortQuery !== undefined) {
            if (sortQuery.length > 0) {
                const sortParams = sortQuery.split(',');

                for (let sortParam of sortParams) {
                    sortParam = sortParam.trim();
                    let sortDirection = 'asc' as 'asc' | 'desc' as 'desc';

                    if (sortParam.startsWith('-')) {
                        sortParam = sortParam.substring(1);
                        sortDirection = 'desc';
                    }

                    // Проверка на объект
                    const isPossibleObject = sortParam.split('.');

                    if (isPossibleObject.length > 1) {
                        sort.push(set({}, sortParam, sortDirection));
                    } else {
                        sort.push({ [sortParam]: sortDirection });
                    }
                }
            }
        }

        return sort;
    }
}
