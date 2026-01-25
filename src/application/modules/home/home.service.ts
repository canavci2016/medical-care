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
    return this.hospitalHairResultService.findAll({ skip: 0, take: 10 });
  }
}
