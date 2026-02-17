import { faker } from '@faker-js/faker';
import { BlogCategory } from '../entities/blog-category.entity';

const categoryNames = [
  'Hair Transplant',
  'Recovery',
  'Patient Stories',
  'Technique Guide',
  'Clinic Tips',
  'Scalp Care',
  'Before & After',
  'Expert Advice',
];

const generateBlogCategory = (
  overrides?: Partial<BlogCategory>,
): BlogCategory => {
  const name = faker.helpers.arrayElement(categoryNames);

  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name.toLowerCase()),
    blogs: [],
    ...overrides,
  };
};

export const generateBlogCategoryMockData = (
  count: number = 10,
): BlogCategory[] =>
  Array.from({ length: count }, () => generateBlogCategory());

export { generateBlogCategory };
