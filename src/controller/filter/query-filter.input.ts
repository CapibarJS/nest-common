import { QueryFilterModel, QueryFilterSelectModel, QueryFilterSortModel } from './query-filter.interface';
import { Validate } from '../../validator';

export class QueryFilterInput implements QueryFilterModel {
    @Validate.Number({ description: 'Номер страницы', example: 1, isInt: true })
    page: number;

    // @Validate.Number({ description: 'Сколько элементов нужно пропустить', example: 10, isInt: true })
    skip: number;

    @Validate.Number({ description: 'Сколько элементов нужно взять', isInt: true })
    take: number;

    @Validate.String({ description: 'Сортировка', example: '-id,name' })
    sort: QueryFilterSortModel[];

    @Validate.Object({ description: 'Фильтр полей', type: Object })
    filter: object;

    @Validate.Object({ description: 'Выборка полей', type: Object, example: { name: true } })
    select: QueryFilterSelectModel;

    static getOptions(filter: QueryFilterModel) {
        return {
            select: filter?.select,
            where: filter?.filter,
            take: filter?.take,
            skip: filter?.skip,
            orderBy: filter?.sort,
        };
    }
}
