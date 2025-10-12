import type { Response } from 'express';

export class ObjectStorageService {
  streamFile(objectPath: string, res: Response): Promise<void>;
  uploadFile(localPath: string, objectPath: string): Promise<void>;
}

export const objectStorageService: ObjectStorageService;
