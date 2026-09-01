export interface StorageProvider {
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<{ filename: string; storagePath: string; url: string }>;
  deleteFile(storagePath: string): Promise<boolean>;
  getFileUrl(storagePath: string): string;
}
