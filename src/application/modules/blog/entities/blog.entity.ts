// blog.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BlogCategory } from './blog-category.entity';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @BeforeInsert()
  @BeforeUpdate()
  setSlugFromTitle(): void {
    if (!this.title) {
      return;
    }

    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  // -------- BASIC INFO --------

  @Column({ length: 200 })
  @Index()
  title!: string;

  @Column({ unique: true })
  @Index()
  slug!: string;

  @Column({ type: 'text' })
  excerpt!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'uuid' })
  categoryId?: string;

  // -------- MEDIA --------

  @Column({ nullable: true })
  featuredImage!: string;

  // -------- SEO --------

  @Column({ nullable: true })
  metaTitle!: string;

  @Column({ nullable: true })
  metaDescription!: string;

  @Column('simple-array', { nullable: true })
  metaKeywords!: string[];

  // -------- STATUS --------

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @Column({ default: false })
  isFeatured!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt!: Date;

  // -------- RELATIONS --------

  @ManyToOne(() => BlogCategory, (category) => category.blogs, {
    eager: true,
  })
  category!: BlogCategory;

  // -------- ANALYTICS --------

  @Column({ default: 0 })
  viewCount!: number;

  @Column({ default: 0 })
  readingTime!: number; // minutes

  // -------- TIMESTAMPS --------

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
