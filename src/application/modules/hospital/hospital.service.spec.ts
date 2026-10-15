import { BadRequestException } from '@nestjs/common';
import { HospitalService } from './hospital.service';

describe('HospitalService', () => {
  describe('update email', () => {
    let service: HospitalService;
    let hospitalRepository: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      hospitalRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
      };
      service = new HospitalService(
        hospitalRepository as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
      );
    });

    it('looks up the email before saving it', async () => {
      const hospital = { id: 'hospital-id', name: 'Hospital' };
      hospitalRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(hospital);
      hospitalRepository.save.mockResolvedValue(hospital);

      await service.update('hospital-id', { email: 'new@example.com' });

      expect(hospitalRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { email: 'new@example.com' },
        select: ['id'],
      });
      expect(hospitalRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com' }),
      );
    });

    it('rejects an email already used by another hospital', async () => {
      hospitalRepository.findOne.mockResolvedValue({
        id: 'another-hospital-id',
      });

      await expect(
        service.update('hospital-id', { email: 'used@example.com' }),
      ).rejects.toThrow(BadRequestException);

      expect(hospitalRepository.save).not.toHaveBeenCalled();
    });
  });
});
