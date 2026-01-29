import { faker } from '@faker-js/faker';
import { HospitalHairResultImage } from '../entities/hospital-hair-result-image.entity';

const angles = ['front', 'left', 'right', 'top'];
const lightings = ['natural', 'studio', 'flash', 'ambient'];
const months = [0, 1, 3, 6, 9, 12];
const images = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIH0HqcgWOseobKXjtbGz8kyH20N-a7_QOXQ&s',
  'https://ik.imagekit.io/jmtrc6fzf/wp-content/uploads/2020/01/best-hair-transplant-results-jaipur.jpg',
  'https://www.dhiindia.com/blog/wp-content/uploads/2023/12/Yogesh-Sharma-results-after-1st-Month.png',
  'https://www.hairpalace.co.uk/wp-content/uploads/2024/04/crown-hair-transplant-timeline.jpg',
  'https://worbimed.com/wp-content/uploads/2024/05/hair-transplant-before-and-after.webp',
  'https://www.drserkanaygin.com/wp-content/uploads/2025/09/Bastian-Hair-Transplant-Before-After-e1756900352390.webp',
  'https://ik.imagekit.io/jmtrc6fzf/wp-content/uploads/2020/01/crown-hair-transplant-results.jpg',
  'https://ik.imagekit.io/jmtrc6fzf/wp-content/uploads/2020/01/crown-hair-transplant-results.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8SqJOD-crc3AdIwnzXsip3OzLF2UWr8Ptpg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVpk1FDXrn4gJ2MrB2V80pDxH7yjbno9cwsA&s',
  'https://www.dentalhairclinicturkey.com/wp-content/uploads/2023/09/4000-grafts-hair-transplant-before-and-after-result-by-heva-clinic.jpg',
  'https://www.hairclub.com/wp-content/uploads/2023/10/bn-xtrands-justinl-654d10e0bf2db.webp',
  'https://i.ytimg.com/vi/uqOd75YefZo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDe-uXkGXipxcEnSK_PkPbXK1NRDQ',
];

const generateHospitalHairResultImage = (
  overrides?: Partial<HospitalHairResultImage>,
): Partial<HospitalHairResultImage> => {
  const month = faker.helpers.arrayElement(months);
  const isBefore = month === 0;

  return {
    id: faker.string.uuid(),
    imageUrl: faker.helpers.arrayElement(images),
    month,
    isBefore,
    isAfter: !isBefore && month >= 6,
    angle: faker.helpers.arrayElement(angles),
    lighting: faker.helpers.arrayElement(lightings),
    watermarked: faker.datatype.boolean({ probability: 0.7 }),
    ...overrides,
  };
};

const generateHospitalHairResultImages = (
  count: number,
  overrides?: Partial<HospitalHairResultImage>,
): Partial<HospitalHairResultImage>[] => {
  return Array.from({ length: count }, () =>
    generateHospitalHairResultImage(overrides),
  );
};

const generateProgressImages = (
  resultId?: string,
): Partial<HospitalHairResultImage>[] => {
  return months.map((month) =>
    generateHospitalHairResultImage({
      month,
      isBefore: month === 0,
      isAfter: month >= 6,
    }),
  );
};

export {
  generateHospitalHairResultImage,
  generateHospitalHairResultImages,
  generateProgressImages,
};
