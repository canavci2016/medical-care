import { faker } from '@faker-js/faker';
import { Doctor } from '../entities/doctor.entity';

const titles = ['Dr.', 'Prof.', 'Prof. Dr.', 'Assoc. Prof.', 'MD'];

const generateDoctor = (overrides?: Partial<Doctor>): Doctor => {
  return {
    id: faker.string.uuid(),
    fullName: faker.person.fullName(),
    title: faker.helpers.arrayElement(titles),
    hospitalId: faker.string.uuid(),
    ...overrides,
  };
};

export const generateDoctorMockData = (count: number = 10): Doctor[] =>
  Array.from({ length: count }, () => generateDoctor());

export { generateDoctor };
