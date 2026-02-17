import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

export interface Pagination {
  page?: number;
  limit?: number;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) { }

  async create(payload: Partial<Blog>): Promise<Blog> {
    const item = this.blogRepository.create(payload);
    return this.blogRepository.save(item);
  }

  async findAll(options?: {
    status?: Blog['status'];
    skip?: number;
    take?: number;
    orderBy?: keyof Blog;
    order?: 'ASC' | 'DESC';
  }): Promise<Blog[]> {
    return this.blogRepository.find({
      where: options?.status ? { status: options.status } : undefined,
      skip: options?.skip,
      take: options?.take,
      order: options?.orderBy
        ? { [options.orderBy]: options.order || 'ASC' }
        : undefined,
    });
  }


  async paginated(options?: {
    status?: Blog['status'];
    skip?: number;
    take?: number;
    orderBy?: keyof Blog;
    order?: 'ASC' | 'DESC';
    page?: Pagination;
  }) {
    const page = options?.page?.page || 1;
    const limit = options?.page?.limit || 10;
    const [items, total] = await this.blogRepository.findAndCount({
      where: options?.status ? { status: options.status } : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: options?.orderBy
        ? { [options.orderBy]: options.order || 'ASC' }
        : undefined,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      pagination: {
        total,
        length: items.length,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1,
      },
    };
  }

  async findOneBy(param: Partial<Pick<Blog, 'id' | 'slug'>>): Promise<Blog> {
    const item = await this.blogRepository.findOne({ where: param });
    if (!item) {
      throw new NotFoundException(`Blog not found`);
    }
    return item;
  }
}
