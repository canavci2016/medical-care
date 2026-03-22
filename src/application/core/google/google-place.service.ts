import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { GOOGLE_PLACE_API_KEY } from './google.constants';

@Injectable()
export class GooglePlaceService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(GOOGLE_PLACE_API_KEY) private readonly apiKey: string,
  ) { }

  async getPlaceDetails(placeId: string) {
    const API_KEY = this.apiKey;
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const { data } = await this.httpService.axiosRef.get<{
      rating: number;
      userRatingCount: number;
      formattedAddress: string;
      websiteUri: string;
      internationalPhoneNumber: string;
      displayName: { text: string };
    }>(url, {
      params: {
        fields: '*',
        key: API_KEY,
      },
    });

    return data;
  }
}
