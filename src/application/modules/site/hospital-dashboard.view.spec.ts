import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('hospital-dashboard view', () => {
  it('does not expose password, slug, rating, or review count fields', () => {
    const template = readFileSync(
      join(__dirname, 'views', 'hospital-dashboard.hbs'),
      'utf8',
    );

    expect(template).not.toMatch(/<label[^>]*>\s*Password\s*<\/label>/i);
    expect(template).not.toMatch(/id=['"]slug['"]/i);
    expect(template).not.toMatch(/id=['"]rating['"]/i);
    expect(template).not.toMatch(/id=['"]reviewCount['"]/i);
  });
});
