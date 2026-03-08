import { faker } from '@faker-js/faker';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { Hospital } from '../entities/hospital.entity';

const techniques = Object.values(HairTransplantTechnique);

const getRandomTechniques = (): HairTransplantTechnique[] => {
  const count = faker.number.int({ min: 1, max: techniques.length });
  return faker.helpers.arrayElements(techniques, count);
};

const generateHospital = (overrides?: Partial<Hospital>): Hospital => {
  return {
    id: faker.string.uuid(),
    name: faker.company.name() + ' Hair Clinic',
    logoUrl: faker.image.urlLoremFlickr({ category: 'business' }),
    coverImageUrl: faker.image.urlLoremFlickr({ category: 'building' }),
    description: faker.lorem.paragraphs(2),
    city: faker.location.city(),
    country: faker.location.country(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    googlePlaceId: faker.string.alphanumeric({ length: 27, casing: 'mixed' }),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    website: faker.internet.url(),
    instagramHandle: faker.internet.username(),
    instagramUrl: `https://www.instagram.com/${faker.internet.username()}`,
    instagramFollowers: faker.number.int({ min: 1000, max: 500000 }),
    instagramVerified: faker.datatype.boolean(),
    isVerified: faker.datatype.boolean(),
    rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 50, max: 3000 }),
    techniques: getRandomTechniques(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

export const generateHospitalMockData = (count: number = 10): Hospital[] =>
  Array.from({ length: count }, () => generateHospital());

export { generateHospital };
