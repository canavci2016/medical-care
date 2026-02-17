import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogCategory } from './entities/blog-category.entity';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepository: Repository<BlogCategory>,
  ) { }

  async create(payload: Partial<BlogCategory>): Promise<BlogCategory> {
    const item = this.blogCategoryRepository.create(payload);
    return this.blogCategoryRepository.save(item);
  }

  async findAll(options: {
    orderBy: string;
    order: 'ASC' | 'DESC';
  }): Promise<BlogCategory[]> {
    return this.blogCategoryRepository.find({
      order: {
        [options.orderBy]: options.order,
      },
    });
  }

  async findOne(id: string): Promise<BlogCategory> {
    const item = await this.blogCategoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`BlogCategory with ID "${id}" not found`);
    }
    return item;
  }

  async update(
    id: string,
    payload: Partial<BlogCategory>,
  ): Promise<BlogCategory> {
    const item = await this.findOne(id);
    Object.assign(item, payload);
    return this.blogCategoryRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.blogCategoryRepository.remove(item);
  }
}
