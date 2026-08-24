import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  AfterLoad,
  ManyToOne,
} from 'typeorm';
import { HospitalHairResultImage } from './hospital-hair-result-image.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { Hospital } from '../../hospital/entities/hospital.entity';

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

  @ManyToOne(() => Hospital, (hospital) => hospital.id)
  hospital: Hospital;
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
  original_url?: string; // Original patient history reference URL

  @Column({ nullable: true })
  patientAgeRange?: string; // "25-30"

  @Column({ nullable: true })
  norwoodScale?: string; // "NW3"

  @Column({ nullable: true })
  hairType?: string; // "Straight", "Wavy"

  /* ===============================
     VERIFICATION & TRUST
  =============================== */

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  consentReceived: boolean;

  /* ===============================
     VISIBILITY & SOCIAL
  =============================== */

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  featured: boolean;

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

  sortedImages: HospitalHairResultImage[];
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  beforeAndAfterImageUrl: string | null;
  previewImageUrl: string | null;

  @AfterLoad()
  calculateFullName() {
    const sortedImages = this?.images?.sort((a, b) => {
      if (a.isBefore && a.isAfter) return -1;
      if (b.isBefore && b.isAfter) return 1;
      if (a.isBefore) return -1;
      return a.month - b.month;
    });
    this.sortedImages = sortedImages || [];

    this.beforeImageUrl =
      sortedImages.find(
        (img) => img.isBefore && !img.isAfter && img.angle === 'front',
      )?.imageUrl || null;

    this.beforeImageUrl =
      this.beforeImageUrl ||
      sortedImages.find((img) => img.isBefore && !img.isAfter)?.imageUrl ||
      null;

    this.afterImageUrl =
      sortedImages.find(
        (img) => img.isAfter && !img.isBefore && img.angle === 'front',
      )?.imageUrl || null;

    this.afterImageUrl =
      this.afterImageUrl ||
      sortedImages.find((img) => img.isAfter && !img.isBefore)?.imageUrl ||
      null;

    this.beforeAndAfterImageUrl =
      sortedImages.find(
        (img) => img.isBefore && img.isAfter && img.angle === 'front',
      )?.imageUrl || null;

    this.beforeAndAfterImageUrl =
      this.beforeAndAfterImageUrl ||
      sortedImages.find((img) => img.isBefore && img.isAfter)?.imageUrl ||
      null;

    this.previewImageUrl =
      this.beforeAndAfterImageUrl ||
      this.afterImageUrl ||
      this.beforeImageUrl ||
      null;
  }
}
