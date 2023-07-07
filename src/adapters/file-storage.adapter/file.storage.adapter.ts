import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { settings } from '../../../config/settings';

@Injectable()
export class S3StorageAdapter {
  private s3Client: S3Client;

  constructor() {
    const REGION = 'eu-central-1';
    this.s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: settings.aws.ACCESS_KEY_ID,
        secretAccessKey: settings.aws.SECRET_ACCESS_KEY,
      },
      endpoint: 'https://s3.eu-central-1.amazonaws.com',
    });
  }

  public async saveFile(buffer: Buffer): Promise<any> {
    const bucketParams = {
      Bucket: 'notebooktoscvbucket',
      Key: `${uuidv4()}`,
      Body: buffer,
      ContentType: 'text/csv',
    };
    const command = new PutObjectCommand(bucketParams);
    try {
      await this.s3Client.send(command);
    } catch (e) {
      throw new Error(e);
    }
    return {
      urlForDownload: `https://notebooktoscvbucket.s3.eu-central-1.amazonaws.com/${bucketParams.Key}`,
    };
  }
}
