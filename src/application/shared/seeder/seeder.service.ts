import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Hospital } from 'src/application/modules/hospital/entities/hospital.entity';
import { Doctor } from 'src/application/modules/doctor/entities/doctor.entity';
import { HospitalHairResult } from 'src/application/modules/hospital-hair-result/entities/hospital-hair-result.entity';
import { HospitalHairResultImage } from 'src/application/modules/hospital-hair-result/entities/hospital-hair-result-image.entity';
import { Blog } from 'src/application/modules/blog/entities/blog.entity';
import { BlogCategory } from 'src/application/modules/blog/entities/blog-category.entity';
import { generateHospitalMockData } from 'src/application/modules/hospital/mocks/hospital.mock';
import { generateDoctorMockData } from 'src/application/modules/doctor/mocks/doctor.mock';
import { generateHospitalHairResult } from 'src/application/modules/hospital-hair-result/mocks/hospital-hair-result.mock';
import { generateProgressImages } from 'src/application/modules/hospital-hair-result/mocks/hospital-hair-result-image.mock';
import { generateBlogCategoryMockData } from 'src/application/modules/blog/mocks/blog-category.mock';
import { generateBlogMockData } from 'src/application/modules/blog/mocks/blog.mock';

export interface SeederOptions {
  hospitalCount?: number;
  doctorCount?: number;
  hospitalHairResultCount?: number;
  blogCategoryCount?: number;
  blogCount?: number;
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
    @InjectRepository(HospitalHairResultImage)
    private readonly hospitalHairResultImageRepository: Repository<HospitalHairResultImage>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepository: Repository<BlogCategory>,
  ) {}

  async seed(options: SeederOptions = {}): Promise<void> {
    const {
      hospitalCount = 20,
      doctorCount = 50,
      hospitalHairResultCount = 100,
      blogCategoryCount = 8,
      blogCount = 40,
    } = options;

    this.logger.log('Starting database seeding...');

    await this.seedHospitals(hospitalCount);
    await this.seedDoctors(doctorCount);
    await this.seedHospitalHairResults(hospitalHairResultCount);
    await this.seedBlogCategories(blogCategoryCount);
    await this.seedBlogs(blogCount);

    this.logger.log('Database seeding completed!');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing database...');

    await this.hospitalHairResultRepository.delete({ slug: Not('') });
    await this.blogRepository.delete({ slug: Not('') });
    await this.blogCategoryRepository.delete({ slug: Not('') });
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
    const savedResults = await this.hospitalHairResultRepository.save(entities);
    this.logger.log(`Seeded ${savedResults.length} hospital hair results`);

    // Seed images for each hair result
    await this.seedHospitalHairResultImages(savedResults);
  }

  private async seedHospitalHairResultImages(
    results: HospitalHairResult[],
  ): Promise<void> {
    const existingCount = await this.hospitalHairResultImageRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Hospital hair result images already seeded (${existingCount} records). Skipping...`,
      );
      return;
    }

    const allImages: Partial<HospitalHairResultImage>[] = [];

    for (const result of results) {
      const progressImages = generateProgressImages().map((image) => ({
        ...image,
        result: result,
      }));
      allImages.push(...progressImages);
    }

    const imageEntities = allImages.map((data) =>
      this.hospitalHairResultImageRepository.create(data),
    );
    await this.hospitalHairResultImageRepository.save(imageEntities);
    this.logger.log(
      `Seeded ${imageEntities.length} hospital hair result images`,
    );
  }

  private async seedBlogCategories(count: number): Promise<void> {
    const existingCount = await this.blogCategoryRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Blog categories already seeded (${existingCount} records). Skipping...`,
      );
      return;
    }

    const categories = generateBlogCategoryMockData(count).map((data, index) =>
      this.blogCategoryRepository.create({
        ...data,
        name: `${data.name} ${index + 1}`,
        slug: `${data.slug}-${index + 1}`,
      }),
    );

    await this.blogCategoryRepository.save(categories);
    this.logger.log(`Seeded ${categories.length} blog categories`);
  }

  private async seedBlogs(count: number): Promise<void> {
    const existingCount = await this.blogRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Blogs already seeded (${existingCount} records). Skipping...`,
      );
      return;
    }

    const categories = await this.blogCategoryRepository.find();

    if (categories.length === 0) {
      this.logger.warn('No blog categories found. Cannot seed blogs.');
      return;
    }

    const blogs = generateBlogMockData(count).map((data, index) => {
      const category = categories[index % categories.length];

      return this.blogRepository.create({
        ...data,
        slug: `${data.slug}-${index + 1}`,
        category,
      });
    });

    await this.blogRepository.save(blogs);
    this.logger.log(`Seeded ${blogs.length} blogs`);
  }
}
