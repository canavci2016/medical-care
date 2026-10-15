import { ForbiddenException } from '@nestjs/common';
import { HospitalDashboardController } from './hospital-dashboard.controller';

describe('HospitalDashboardController', () => {
  describe('deleteHairResult', () => {
    const resultId = 'result-id';
    let controller: HospitalDashboardController;
    let hospitalHairResultService: {
      findOne: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      hospitalHairResultService = {
        findOne: jest.fn(),
        remove: jest.fn(),
      };
      controller = new HospitalDashboardController(
        hospitalHairResultService as never,
        {} as never,
        {} as never,
      );
    });

    it('deletes a result owned by the logged-in hospital', async () => {
      hospitalHairResultService.findOne.mockResolvedValue({
        id: resultId,
        hospitalId: 'hospital-id',
      });

      await expect(
        controller.deleteHairResult({ hospitalId: 'hospital-id' }, resultId),
      ).resolves.toEqual({ success: true });

      expect(hospitalHairResultService.remove).toHaveBeenCalledWith(resultId);
    });

    it('does not delete a result owned by another hospital', async () => {
      hospitalHairResultService.findOne.mockResolvedValue({
        id: resultId,
        hospitalId: 'another-hospital-id',
      });

      await expect(
        controller.deleteHairResult({ hospitalId: 'hospital-id' }, resultId),
      ).rejects.toThrow(ForbiddenException);

      expect(hospitalHairResultService.remove).not.toHaveBeenCalled();
    });
  });
});
