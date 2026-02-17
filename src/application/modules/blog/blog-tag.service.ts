import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogTag } from './entities/blog-tag.entity';

@Injectable()
export class BlogTagService {
  constructor(
    @InjectRepository(BlogTag)
    private readonly blogTagRepository: Repository<BlogTag>,
  ) { }

  async create(payload: Partial<BlogTag>): Promise<BlogTag> {
    const item = this.blogTagRepository.create(payload);
    return this.blogTagRepository.save(item);
  }

  async findAll(): Promise<BlogTag[]> {
    return this.blogTagRepository.find();
  }

  async findOne(id: string): Promise<BlogTag> {
    const item = await this.blogTagRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`BlogTag with ID "${id}" not found`);
    }
    return item;
  }

  async update(id: string, payload: Partial<BlogTag>): Promise<BlogTag> {
    const item = await this.findOne(id);
    Object.assign(item, payload);
    return this.blogTagRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.blogTagRepository.remove(item);
  }
}
