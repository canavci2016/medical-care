import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_tags')
export class BlogTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs: Blog[];
}
