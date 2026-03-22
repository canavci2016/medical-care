import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GooglePlaceService } from './google-place.service';
import { GOOGLE_PLACE_API_KEY } from './google.constants';

export interface GoogleModuleOptions {
  apiKey: string;
}

export interface GoogleModuleAsyncOptions extends Pick<
  ModuleMetadata,
  'imports'
> {
  useFactory: (
    ...args: any[]
  ) => GoogleModuleOptions | Promise<GoogleModuleOptions>;
  inject?: FactoryProvider['inject'];
}

@Module({})
export class GoogleModule {
  static forRoot(options: GoogleModuleOptions): DynamicModule {
    return {
      global: true,
      module: GoogleModule,
      imports: [HttpModule],
      providers: [
        { provide: GOOGLE_PLACE_API_KEY, useValue: options.apiKey },
        GooglePlaceService,
      ],
      exports: [GooglePlaceService],
    };
  }

  static forRootAsync(options: GoogleModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: GoogleModule,
      imports: [...(options.imports ?? []), HttpModule],
      providers: [
        {
          provide: GOOGLE_PLACE_API_KEY,
          useFactory: async (...args: any[]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const resolved = await options.useFactory(...args);
            return resolved.apiKey;
          },
          inject: options.inject ?? [],
        },
        GooglePlaceService,
      ],
      exports: [GooglePlaceService],
    };
  }
}
