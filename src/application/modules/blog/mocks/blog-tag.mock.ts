import { faker } from '@faker-js/faker';
import { BlogTag } from '../entities/blog-tag.entity';

const tagNames = [
  'Fue',
  'Dhi',
  'Sapphire Fue',
  'Norwood Scale',
  'Donor Area',
  'Aftercare',
  'Graft Count',
  'Hairline Design',
  'Shedding Phase',
  'Result Timeline',
  'Anesthesia',
  'Clinic Selection',
];

const generateBlogTag = (overrides?: Partial<BlogTag>): BlogTag => {
  const name = faker.helpers.arrayElement(tagNames);

  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name.toLowerCase()),
    blogs: [],
    ...overrides,
  };
};

export const generateBlogTagMockData = (count: number = 10): BlogTag[] =>
  Array.from({ length: count }, () => generateBlogTag());

export { generateBlogTag };
