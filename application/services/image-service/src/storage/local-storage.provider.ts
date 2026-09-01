import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.provider.interface';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { loadAppConfig } from '@foodlens/shared-config';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    const config = loadAppConfig();
    this.uploadDir = path.resolve(config.storagePath || './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalName: string, mimeType: string) {
    const ext = path.extname(originalName).toLowerCase() || (mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg');
    // Prevent path traversal by stripping directories
    const safeExt = ext.replace(/[^a-z0-9.]/gi, '');
    const filename = `img_${uuidv4()}${safeExt}`;
    const targetPath = path.join(this.uploadDir, filename);

    // Verify safe path
    if (!targetPath.startsWith(this.uploadDir)) {
      throw new Error('Invalid file path detected (Path Traversal Protection)');
    }

    await fs.promises.writeFile(targetPath, buffer);

    return {
      filename,
      storagePath: targetPath,
      url: `/uploads/${filename}`,
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(storagePath)) {
        await fs.promises.unlink(storagePath);
        return true;
      }
    } catch (err) {
      return false;
    }
    return false;
  }

  getFileUrl(filename: string): string {
    return `/uploads/${path.basename(filename)}`;
  }
}
