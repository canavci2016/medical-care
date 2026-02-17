import { faker } from '@faker-js/faker';
import { Blog, BlogStatus } from '../entities/blog.entity';
import { generateBlogCategory } from './blog-category.mock';
import { generateBlogTagMockData } from './blog-tag.mock';

const keywordPool = [
  'hair transplant',
  'fue',
  'dhi',
  'aftercare',
  'graft',
  'hairline',
  'recovery',
  'clinic',
  'results',
  'donor area',
  'norwood',
  'before after',
];

const generateBlog = (overrides?: Partial<Blog>): Blog => {
  const title = faker.lorem.sentence({ min: 4, max: 8 }).replace('.', '');
  const createdAt = faker.date.past({ years: 1 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  const publishedAt = faker.date.between({ from: createdAt, to: new Date() });
  const tagCount = faker.number.int({ min: 2, max: 5 });

  return {
    id: faker.string.uuid(),
    title,
    slug: faker.helpers.slugify(title.toLowerCase()),
    excerpt: faker.lorem.paragraph(),
    content: faker.lorem.paragraphs(5, '\n\n'),
    featuredImage: faker.image.urlLoremFlickr({ category: 'business' }),
    metaTitle: `${title} | Medical Care`,
    metaDescription: faker.lorem.sentence({ min: 10, max: 20 }),
    metaKeywords: faker.helpers.arrayElements(keywordPool, tagCount),
    status: BlogStatus.PUBLISHED,
    isFeatured: faker.datatype.boolean({ probability: 0.2 }),
    publishedAt,
    category: generateBlogCategory(),
    tags: generateBlogTagMockData(tagCount),
    viewCount: faker.number.int({ min: 0, max: 10000 }),
    readingTime: faker.number.int({ min: 3, max: 15 }),
    createdAt,
    updatedAt,
    deletedAt: undefined,
    ...overrides,
  };
};

export const generateBlogMockData = (count: number = 10): Blog[] =>
  Array.from({ length: count }, () => generateBlog());

export { generateBlog };
