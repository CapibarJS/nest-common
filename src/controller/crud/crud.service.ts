import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelMapperBase } from '../../validator';
import { SuccessResponse } from '../request/shared.dto';
import { PrismaRepository, RepositoryType } from '../../prisma';

@Injectable()
export class CrudService<T extends RepositoryType, TModel = unknown, TDtoCreate = TModel, TDtoUpdate = TDtoCreate> {
    constructor(protected readonly repository: PrismaRepository<T>, protected Mapper: ModelMapperBase<any>) {}

    async create(data: TDtoCreate) {
        const entity = await this.repository.create.call(this.repository, { data });
        return this.Mapper.mapToResponse(entity);
    }

    async createMany(list: TDtoCreate[]) {
        const created = await this.repository.getPrisma.$transaction(
            list.map((data) => this.repository.create.call(this.repository, { data })),
        );
        return this.Mapper.mapToListResponse(created);
    }

    async findMany(...args: (Parameters<typeof this.repository.findMany> & { pagination?: boolean }) | undefined) {
        const { pagination, ..._args } = args;
        console.log({
            pagination,
            _args,
        });
        const entities = await this.repository.findMany.call(this.repository, ..._args);
        const total = await this.repository.count.call(this.repository, ..._args);
        const items = this.Mapper.mapToListResponse(entities);
        return pagination ? { total, items } : items;
    }

    async findById(id: string, ...args: Parameters<typeof this.repository.findUnique> | undefined | any) {
        const filter = args?.[0];
        const entity = await this.repository.findUnique.call(this.repository, { where: { id, ...filter?.where } });
        if (!entity) throw new NotFoundException(`${this.repository.model} with id=${id} not found`);
        return this.Mapper.mapToResponse(entity);
    }

    async update(id: string, data: TDtoUpdate) {
        const entity = await this.repository.update.call(this.repository, { where: { id }, data });
        return this.Mapper.mapToResponse(entity);
    }

    async deleteById(id: string): Promise<SuccessResponse> {
        await this.repository.delete.call(this.repository, { where: { id } });
        return { status: true };
    }

    async updateManyByIds(data: TDtoUpdate[]) {
        const results = [];
        // @ts-ignore
        for (const { id, ...rest } of data) {
            results.push(this.repository.update.call(this.repository, { where: { id }, data: rest }));
        }
        return this.Mapper.mapToListResponse(await Promise.all(results));
    }

    async deleteManyByIds(ids: string[]): Promise<SuccessResponse> {
        await this.repository.deleteMany.call(this.repository, { where: { id: { in: ids } } });
        return { status: true };
    }
}
