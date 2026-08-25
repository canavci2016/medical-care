import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';
import * as awsCredentialsInterface from './interfaces/aws-credentials.interface';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Service {
  s3Client: S3Client;

  constructor(
    private readonly awsCredentials: awsCredentialsInterface.AwsCredentials,
  ) {
    this.s3Client = new S3Client({
      region: this.awsCredentials.region,
      credentials: {
        accessKeyId: this.awsCredentials.accessKeyId,
        secretAccessKey: this.awsCredentials.secretAccessKey,
      },
    });
  }

  async getSignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.awsCredentials.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 5, // URL expires in 5 minutes
    });

    return { url, key };
  }

  async downloadAndUploadToS3(fileUrl: string, key: string) {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    const result = await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.awsCredentials.bucket,
        Key: key,
        Body: response.data,
        ContentType: response.headers['content-type'],
      }),
    );

    return this.getFullS3Url(key);
  }

  getFullS3Url(key: string) {
    return `${this.getBaseS3Url()}/${key}`;
  }

  getBaseS3Url() {
    return `https://${this.awsCredentials.bucket}.s3.${this.awsCredentials.region}.amazonaws.com`;
  }
}
