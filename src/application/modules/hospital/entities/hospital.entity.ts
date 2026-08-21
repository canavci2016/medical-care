import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface HospitalReview {
  authorName: string;
  authorPhoto: string;
  comment: string;
  publishTime: string;
  rating?: number;
}

export interface HospitalFacility {
  multilingualStaff?: boolean;
  airportTransferService?: boolean;
  digitalHairAnalysis?: boolean;
  privateRecoveryRooms?: boolean;
  hotelAccommodation?: boolean;
  acceptCreditCard?: boolean;
}

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* ===============================
     BASIC INFO
  =============================== */

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  coverImageUrl?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'uuid', nullable: true })
  cityId?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ type: 'uuid', nullable: true })
  countryId?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  googlePlaceId?: string;

  /* ===============================
     CONTACT
  =============================== */

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  website?: string;

  /* ===============================
     INSTAGRAM (SOCIAL PROOF)
  =============================== */

  @Index()
  @Column({ nullable: true })
  instagramHandle?: string;

  @Column({ nullable: true })
  instagramUrl?: string;

  @Column({ type: 'int', nullable: true })
  instagramFollowers?: number;

  @Column({ default: false })
  instagramVerified: boolean;

  /* ===============================
     MEDICAL / TRUST
  =============================== */

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({
    type: 'simple-array',
    nullable: true,
    enum: HairTransplantTechnique,
  })
  techniques?: HairTransplantTechnique[]; // ['FUE', 'DHI', 'Beard', 'Eyebrow']

  /* ===============================
     RELATIONS
  =============================== */

  /*
  @OneToMany(() => HospitalResult, result => result.hospital)
  results: HospitalResult[];

  @OneToMany(() => Doctor, doctor => doctor.hospital)
  doctors: Doctor[];
  */

  @Column({ type: 'simple-array', nullable: true })
  weekDayOpenings?: string[];

  @Column({ nullable: true })
  directionsUri?: string;

  @Column({ nullable: true })
  reviewUri?: string;

  @Column({ type: 'json', nullable: true })
  reviews?: HospitalReview[];

  @Column({ type: 'json', nullable: true })
  facility?: HospitalFacility;

  /* ===============================
     TIMESTAMPS
  =============================== */

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  procedureCount?: number;
}
