import {
  deleteStoredFile,
  getStoredFileMeta,
  putStoredFile,
  readStoredFile,
} from "./disk";

/** Appwrite Storage-shaped API backed by local disk. */
export class DiskStorage {
  async createFile(params: {
    bucketId: string;
    fileId: string;
    file: File;
    permissions?: string[];
  }) {
    void params.permissions;
    void params.fileId;
    const ownerId = "system";
    const { fileId } = await putStoredFile({
      bucketId: params.bucketId,
      ownerId,
      file: params.file,
    });
    return { $id: fileId };
  }

  async getFile(params: { bucketId: string; fileId: string }) {
    const meta = await getStoredFileMeta(params.fileId);
    return {
      $id: params.fileId,
      mimeType: meta?.mimeType ?? "application/octet-stream",
      name: meta?.originalName ?? "file",
    };
  }

  async getFileView(params: { bucketId: string; fileId: string }) {
    const result = await readStoredFile(params.bucketId, params.fileId);
    if (!result) {
      throw new Error("File not found");
    }
    const chunks: Buffer[] = [];
    for await (const chunk of result.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async deleteFile(params: { bucketId: string; fileId: string }) {
    await deleteStoredFile(params.bucketId, params.fileId);
  }
}
