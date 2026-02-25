import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { AwsS3Service } from 'src/application/shared/modules/aws/s3.service';
import { randomUUID } from 'node:crypto';

export interface Pagination {
  page?: number;
  limit?: number;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(payload: Partial<Blog>): Promise<Blog> {
    if (!payload.id) {
      const requiredFields: (keyof Blog)[] = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featuredImage',
        'metaTitle',
        'metaDescription',
        'metaKeywords',
        'status',
        'isFeatured',
        'publishedAt',
        'category',
        'viewCount',
        'readingTime',
      ];

      const missingFields = requiredFields.filter((field) => {
        const value = payload[field];

        if (value === undefined || value === null) {
          return true;
        }

        if (typeof value === 'string' && value.trim() === '') {
          return true;
        }

        if (Array.isArray(value) && value.length === 0) {
          return true;
        }

        return false;
      });

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `All blog properties must be entered. Missing fields: ${missingFields.join(', ')}`,
        );
      }
    }

    const item = this.blogRepository.create(payload);
    return this.blogRepository.save(item);
  }

  async generateUploadUrl(contentType: string) {
    const res = await this.awsS3Service.getSignedUploadUrl(
      `uploads/${randomUUID()}`,
      contentType,
    );
    return res;
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
    categoryId?: string;
    title?: string;
    page?: Pagination;
  }) {
    const page = options?.page?.page || 1;
    const limit = options?.page?.limit || 10;
    const where: Record<string, unknown> = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.categoryId) {
      where.category = { id: options.categoryId };
    }

    if (options?.title) {
      where.title = ILike(`%${options.title}%`);
    }

    const [items, total] = await this.blogRepository.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
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
