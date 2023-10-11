import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelMapperBase } from '../../validator/mapper';
import { SuccessResponse } from '../request/shared.dto';
import { PrismaRepository, RepositoryType } from '../../prisma/prisma.repository';

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

    async findMany(...args: Parameters<typeof this.repository.findMany> | undefined) {
        const entities = await this.repository.findMany.call(this.repository, ...args);
        return this.Mapper.mapToListResponse(entities);
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

    async deleteManyByIds(ids: string[]): Promise<SuccessResponse> {
        await this.repository.deleteMany.call(this.repository, { where: { id: { in: ids } } });
        return { status: true };
    }
}
