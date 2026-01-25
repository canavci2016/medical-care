import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Hospital } from 'src/application/modules/hospital/entities/hospital.entity';
import { Doctor } from 'src/application/modules/doctor/entities/doctor.entity';
import { HospitalHairResult } from 'src/application/modules/hospital-hair-result/entities/hospital-hair-result.entity';
import { generateHospitalMockData } from 'src/application/modules/hospital/mocks/hospital.mock';
import { generateDoctorMockData } from 'src/application/modules/doctor/mocks/doctor.mock';
import { generateHospitalHairResult } from 'src/application/modules/hospital-hair-result/mocks/hospital-hair-result.mock';

export interface SeederOptions {
  hospitalCount?: number;
  doctorCount?: number;
  hospitalHairResultCount?: number;
}

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(HospitalHairResult)
    private readonly hospitalHairResultRepository: Repository<HospitalHairResult>,
  ) { }

  async seed(options: SeederOptions = {}): Promise<void> {
    const {
      hospitalCount = 20,
      doctorCount = 50,
      hospitalHairResultCount = 100,
    } = options;

    this.logger.log('Starting database seeding...');

    await this.seedHospitals(hospitalCount);
    await this.seedDoctors(doctorCount);
    await this.seedHospitalHairResults(hospitalHairResultCount);

    this.logger.log('Database seeding completed!');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing database...');

    await this.hospitalHairResultRepository.delete({ slug: Not('') });
    await this.doctorRepository.delete({ fullName: Not('xyz') });
    await this.hospitalRepository.delete({ name: Not('xyz') });

    this.logger.log('Database cleared!');
  }

  private async seedHospitals(count: number): Promise<void> {
    const existingCount = await this.hospitalRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Hospitals already seeded (${existingCount} records). Skipping...`,
      );
      return;
    }

    const hospitals = generateHospitalMockData(count).map((data) =>
      this.hospitalRepository.create(data),
    );
    await this.hospitalRepository.save(hospitals);
    this.logger.log(`Seeded ${hospitals.length} hospitals`);
  }

  private async seedDoctors(count: number): Promise<void> {
    const existingCount = await this.doctorRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Doctors already seeded (${existingCount} records). Skipping...`,
      );
      return;
    }

    const hospitals = await this.hospitalRepository.find();
    if (hospitals.length === 0) {
      this.logger.warn(
        'No hospitals found. Seeding doctors without hospital associations.',
      );
    }

    const doctors = generateDoctorMockData(count).map((data, index) => {
      const hospitalId =
        hospitals.length > 0
          ? hospitals[index % hospitals.length].id
          : undefined;
      return this.doctorRepository.create({ ...data, hospitalId });
    });

    await this.doctorRepository.save(doctors);
    this.logger.log(`Seeded ${doctors.length} doctors`);
  }

  private async seedHospitalHairResults(count: number): Promise<void> {
    const existingCount = await this.hospitalHairResultRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Hospital hair results already seeded (${existingCount} records). Skipping...`,
      );
      return;
    }

    const hospitals = await this.hospitalRepository.find();
    const doctors = await this.doctorRepository.find();

    if (hospitals.length === 0) {
      this.logger.warn(
        'No hospitals found. Cannot seed hospital hair results.',
      );
      return;
    }

    const results: Partial<HospitalHairResult>[] = [];
    for (let i = 0; i < count; i++) {
      const hospital = hospitals[i % hospitals.length];
      const doctor =
        doctors.length > 0 ? doctors[i % doctors.length] : undefined;

      results.push(
        generateHospitalHairResult({
          hospitalId: hospital.id,
          doctorId: doctor?.id,
        }),
      );
    }

    const entities = results.map((data) =>
      this.hospitalHairResultRepository.create(data),
    );
    await this.hospitalHairResultRepository.save(entities);
    this.logger.log(`Seeded ${entities.length} hospital hair results`);
  }
}
