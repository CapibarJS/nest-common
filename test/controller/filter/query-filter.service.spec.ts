import { QueryFilterService } from '../../../src/controller/filter/query-filter.service';

describe('QueryFilterService', () => {
    let queryFilterService: QueryFilterService;

    beforeAll(async () => {
        queryFilterService = new QueryFilterService();
    });

    describe('parseSort', () => {
        test('Сортировка asc - вложенный объект', () => {
            const filters = queryFilterService.parseQuery({ sort: 'location.city' });

            expect(filters).toBeDefined();
            expect(filters.sort[0]).toBeDefined();
            expect(filters.sort[0].location['city']).toBeDefined();
            expect(filters.sort[0].location['city']).toEqual('asc');
        });

        test('Сортировка desc - вложенный объект', () => {
            const filters = queryFilterService.parseQuery({ sort: '-location.city' });

            expect(filters).toBeDefined();
            expect(filters.sort[0]).toBeDefined();
            expect(filters.sort[0].location['city']).toBeDefined();
            expect(filters.sort[0].location['city']).toEqual('desc');
        });

        test('Сортировка - проверка вложенных компетенций', () => {
            const filters = queryFilterService.parseQuery({ sort: 'competencies[0]._count' });

            expect(filters).toBeDefined();
            expect(filters.sort[0]).toBeDefined();
            expect(filters.sort[0].competencies).toBeInstanceOf(Array);
            expect(filters.sort[0].competencies[0]['_count']).toBeDefined();
            expect(filters.sort[0].competencies[0]['_count']).toEqual('asc');
        });

        test('Сложная сортировка со вложенными объектами', () => {
            const filters = queryFilterService.parseQuery({
                sort: '-name,workStatus,location.city,-competencies._count,revenueNotVat[0].revenue',
            });

            expect(filters).toBeDefined();
            expect(filters.sort.length).toEqual(5);

            expect(filters.sort[0].name).toEqual('desc');
            expect(filters.sort[1].workStatus).toEqual('asc');
            expect(filters.sort[2].location['city']).toEqual('asc');
            expect(filters.sort[3].competencies['_count']).toEqual('desc');
            expect(filters.sort[4].revenueNotVat[0]['revenue']).toEqual('asc');
        });
    });
});
