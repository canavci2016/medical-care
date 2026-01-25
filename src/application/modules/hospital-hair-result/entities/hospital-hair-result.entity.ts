import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { HospitalHairResultImage } from './hospital-hair-result-image.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';

export enum HairProcedureType {
  HAIR = 'hair',
  BEARD = 'beard',
  EYEBROW = 'eyebrow',
}

@Entity('hospital_hair_results')
@Index(['verified', 'monthsAfter'])
export class HospitalHairResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* ===============================
     RELATIONS
  =============================== */

  @Column({ type: 'uuid', nullable: true })
  hospitalId: string;

  @Column({ type: 'uuid', nullable: true })
  doctorId?: string;

  @OneToMany(() => HospitalHairResultImage, (image) => image.result, {
    cascade: true,
  })
  images: HospitalHairResultImage[];
  /* ===============================
     PROCEDURE INFO
  =============================== */

  @Column({
    type: 'enum',
    enum: HairProcedureType,
  })
  procedureType: HairProcedureType;

  @Column({
    type: 'enum',
    enum: HairTransplantTechnique,
  })
  technique: HairTransplantTechnique;

  @Column({ type: 'int' })
  graftCount: number;

  @Column({ type: 'int', nullable: true })
  operationDurationMinutes?: number;

  @Column({ type: 'date', nullable: true })
  operationDate?: Date;

  /* ===============================
     RESULT TIMELINE
  =============================== */

  /**
   * Current snapshot month displayed in listings
   * Example: 6, 9, 12
   */
  @Index()
  @Column({ type: 'int' })
  monthsAfter: number;

  /**
   * Full timeline reference (0, 1, 3, 6, 9, 12)
   */
  @Column({ type: 'simple-array' })
  availableMonths: number[];

  /* ===============================
     PATIENT DATA (ANONYMIZED)
  =============================== */

  @Column({ nullable: true })
  patientAgeRange?: string; // "25-30"

  @Column({ nullable: true })
  norwoodScale?: string; // "NW3"

  @Column({ nullable: true })
  donorAreaQuality?: string; // "Good", "Average"

  @Column({ nullable: true })
  hairType?: string; // "Straight", "Wavy"

  /* ===============================
     VERIFICATION & TRUST
  =============================== */

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verifiedBy?: string; // Admin or medical reviewer

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ default: false })
  consentReceived: boolean;

  /* ===============================
     VISIBILITY & SOCIAL
  =============================== */

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: false })
  sharedOnInstagram: boolean;

  @Column({ nullable: true })
  instagramPostUrl?: string;

  /* ===============================
     SEO & ANALYTICS
  =============================== */

  @Column({ nullable: true })
  slug?: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  saveCount: number;

  /* ===============================
     NOTES
  =============================== */

  @Column({ type: 'text', nullable: true })
  doctorNotes?: string;

  @Column({ type: 'text', nullable: true })
  patientStory?: string;

  /* ===============================
     TIMESTAMPS
  =============================== */

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
