import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('admin hair-result detail view', () => {
  const template = readFileSync(
    join(__dirname, 'views', 'admin', 'hospital-hair-result-detail.hbs'),
    'utf8',
  );

  it('links to the public detail page for the current result', () => {
    expect(template).toContain(
      "href='/results/{{result.id}}' class='btn btn-outline-primary btn-sm'>View Public Result</a>",
    );
  });
});
