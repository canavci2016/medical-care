import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('hospital hair-result creation view', () => {
  const template = readFileSync(
    join(__dirname, 'views', 'hospital-create-hair-result.hbs'),
    'utf8',
  );

  it('places graft count and operation date in the same row', () => {
    expect(template).toMatch(
      /<div class='row'>\s*<div class='col-md-6 mb-3'>[\s\S]*?id='graftCount'[\s\S]*?<\/div>\s*<div class='col-md-6 mb-3'>[\s\S]*?id='operationDate'[\s\S]*?<\/div>\s*<\/div>/,
    );
  });

  it('places months after and available months in the same row', () => {
    expect(template).toMatch(
      /<div class='row'>\s*<div class='col-md-6 mb-3'>[\s\S]*?id='monthsAfter'[\s\S]*?<\/div>\s*<div class='col-md-6 mb-3'>[\s\S]*?id='availableMonths'[\s\S]*?<\/div>\s*<\/div>/,
    );
  });

  it('accepts images through file uploads instead of manual image URLs', () => {
    expect(template).not.toMatch(/Image URLs|id='imageUrls'/i);
    expect(template).toMatch(/id='imageFile'/);
    expect(template).toMatch(/imageUrls: uploadedImageUrls/);
  });
});
