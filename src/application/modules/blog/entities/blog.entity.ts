// blog.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { BlogCategory } from './blog-category.entity';
import { BlogTag } from './blog-tag.entity';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // -------- BASIC INFO --------

  @Column({ length: 200 })
  @Index()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  categoryId?: string;

  // -------- MEDIA --------

  @Column({ nullable: true })
  featuredImage: string;

  // -------- SEO --------

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  @Column('simple-array', { nullable: true })
  metaKeywords: string[];

  // -------- STATUS --------

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  // -------- RELATIONS --------

  @ManyToOne(() => BlogCategory, (category) => category.blogs, {
    eager: true,
  })
  category: BlogCategory;

  @ManyToMany(() => BlogTag, (tag) => tag.blogs, { eager: true })
  @JoinTable()
  tags: BlogTag[];

  // -------- ANALYTICS --------

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  readingTime: number; // minutes

  // -------- TIMESTAMPS --------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
