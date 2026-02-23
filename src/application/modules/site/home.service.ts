import { Injectable } from '@nestjs/common';
import { HospitalService } from '../hospital/hospital.service';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly doctorService: DoctorService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) { }

  async getLatestHairResults() {
    const { data: results } = await this.hospitalHairResultService.findAll({
      random: true,
    });
    const hospitals = await this.hospitalService.findAll({
      id: results.map((r) => r.hospitalId),
    });

    const doctors = await this.doctorService.findAll({
      id: results
        .map((r) => r.doctorId)
        .filter((id): id is string => id !== undefined),
    });

    const finalResults = results.map((result) => ({
      ...result,
      hospital: hospitals.find((hos) => hos.id === result.hospitalId),
      doctor: doctors.find((doc) => doc.id === result.doctorId),
    }));

    return finalResults;
  }
}
