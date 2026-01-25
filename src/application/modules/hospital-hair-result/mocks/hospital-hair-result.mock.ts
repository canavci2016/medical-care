import { faker } from '@faker-js/faker';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import {
  HospitalHairResult,
  HairProcedureType,
} from '../entities/hospital-hair-result.entity';

const procedureTypes = Object.values(HairProcedureType);
const techniques = Object.values(HairTransplantTechnique);
const ageRanges = ['20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50+'];
const norwoodScales = ['NW1', 'NW2', 'NW3', 'NW3V', 'NW4', 'NW5', 'NW6', 'NW7'];
const donorQualities = ['Excellent', 'Good', 'Average', 'Below Average'];
const hairTypes = ['Straight', 'Wavy', 'Curly', 'Coily'];
const availableMonthsOptions = [
  [0, 1, 3, 6],
  [0, 1, 3, 6, 9],
  [0, 1, 3, 6, 9, 12],
  [0, 3, 6, 12],
  [0, 6, 12],
];

const generateHospitalHairResult = (
  overrides?: Partial<HospitalHairResult>,
): Partial<HospitalHairResult> => {
  const availableMonths = faker.helpers.arrayElement(availableMonthsOptions);
  const monthsAfter = faker.helpers.arrayElement(availableMonths);

  return {
    id: faker.string.uuid(),
    hospitalId: faker.string.uuid(),
    doctorId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
    procedureType: faker.helpers.arrayElement(procedureTypes),
    technique: faker.helpers.arrayElement(techniques),
    graftCount: faker.number.int({ min: 1500, max: 5000 }),
    operationDurationMinutes: faker.number.int({ min: 180, max: 480 }),
    operationDate: faker.date.past({ years: 2 }),
    monthsAfter,
    availableMonths,
    patientAgeRange: faker.helpers.arrayElement(ageRanges),
    norwoodScale: faker.helpers.arrayElement(norwoodScales),
    donorAreaQuality: faker.helpers.arrayElement(donorQualities),
    hairType: faker.helpers.arrayElement(hairTypes),
    verified: faker.datatype.boolean(),
    verifiedBy: faker.datatype.boolean() ? faker.person.fullName() : undefined,
    verifiedAt: faker.datatype.boolean() ? faker.date.recent() : undefined,
    consentReceived: faker.datatype.boolean({ probability: 0.8 }),
    isPublic: faker.datatype.boolean({ probability: 0.9 }),
    featured: faker.datatype.boolean({ probability: 0.2 }),
    sharedOnInstagram: faker.datatype.boolean({ probability: 0.3 }),
    instagramPostUrl: faker.datatype.boolean()
      ? `https://www.instagram.com/p/${faker.string.alphanumeric(11)}`
      : undefined,
    slug: faker.helpers.slugify(
      `${faker.word.adjective()}-${faker.word.noun()}-result`,
    ),
    viewCount: faker.number.int({ min: 0, max: 10000 }),
    saveCount: faker.number.int({ min: 0, max: 500 }),
    doctorNotes: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined,
    patientStory: faker.datatype.boolean()
      ? faker.lorem.paragraphs(2)
      : undefined,
    ...overrides,
  };
};

export const generateHospitalHairResultMockData = (
  count: number = 10,
): Partial<HospitalHairResult>[] =>
  Array.from({ length: count }, () => generateHospitalHairResult());

export { generateHospitalHairResult };
