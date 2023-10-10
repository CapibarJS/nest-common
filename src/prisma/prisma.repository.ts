import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { Injectable } from '@nestjs/common';

export type RepositoryType = Exclude<keyof PrismaClient, symbol | `$${string}`>;

@Injectable()
export class PrismaRepository<K extends RepositoryType> {
    constructor(
        protected readonly prisma: PrismaService,
        public readonly model: K,
    ) {}

    get getPrisma() {
        return this.prisma;
    }

    get getModel() {
        // @ts-ignore
        return this.prisma[this.model];
    }

    get getModelName() {
        return this.model;
    }

    create(...args: Parameters<PrismaClient[K]['create']>): ReturnType<PrismaClient[K]['create']> {
        return this.getModel.create.call(this, ...args);
    }

    createMany(...args: Parameters<PrismaClient[K]['createMany']>): ReturnType<PrismaClient[K]['createMany']> {
        return this.getModel.createMany.call(this, ...args);
    }

    delete(...args: Parameters<PrismaClient[K]['delete']>): ReturnType<PrismaClient[K]['delete']> {
        return this.getModel.delete.call(this, ...args);
    }

    deleteMany(...args: Parameters<PrismaClient[K]['deleteMany']>): ReturnType<PrismaClient[K]['deleteMany']> {
        return this.getModel.deleteMany.call(this, ...args);
    }

    findFirst(...args: Parameters<PrismaClient[K]['findFirst']>): ReturnType<PrismaClient[K]['findFirst']> {
        return this.getModel.findFirst.call(this, ...args);
    }

    findMany(...args: Parameters<PrismaClient[K]['findMany']>): ReturnType<PrismaClient[K]['findMany']> {
        return this.getModel.findMany.call(this, ...args);
    }

    findUnique(...args: Parameters<PrismaClient[K]['findUnique']>): ReturnType<PrismaClient[K]['findUnique']> {
        return this.getModel.findUnique.call(this, ...args);
    }

    update(...args: Parameters<PrismaClient[K]['update']>): ReturnType<PrismaClient[K]['update']> {
        return this.getModel.update.call(this, ...args);
    }

    updateMany(...args: Parameters<PrismaClient[K]['updateMany']>): ReturnType<PrismaClient[K]['updateMany']> {
        return this.getModel.updateMany.call(this, ...args);
    }

    upsert(...args: Parameters<PrismaClient[K]['upsert']>): ReturnType<PrismaClient[K]['upsert']> {
        return this.getModel.upsert.call(this, ...args);
    }

    count(...args: Parameters<PrismaClient[K]['count']>): ReturnType<PrismaClient[K]['count']> {
        return this.getModel.count.call(this, ...args);
    }
}
