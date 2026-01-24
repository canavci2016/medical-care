import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { HospitalHairResult } from './hospital-hair-result.entity';

@Entity('hospital_hair_result_images')
@Index(['result', 'month'])
export class HospitalHairResultImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HospitalHairResult, (result) => result.images, {
    onDelete: 'CASCADE',
  })
  result: HospitalHairResult;

  @Column()
  imageUrl: string;

  @Column({ type: 'int' })
  month: number; // 0, 1, 3, 6, 12

  @Column({ default: false })
  isBefore: boolean;

  @Column({ default: false })
  isAfter: boolean;

  @Column({ nullable: true })
  angle?: string; // "front", "left", "right", "top"

  @Column({ nullable: true })
  lighting?: string;

  @Column({ default: false })
  watermarked: boolean;
}
