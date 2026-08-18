import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { computeFileSHA256, formatBytes } from '../lib/hash';
import { FileAttachment, UploadProgress } from '../types';
import { addSystemLog } from './chatService';

const CHUNK_SIZE = 250 * 1024; // 250 KB raw binary chunk size
const blobUrlCache = new Map<string, string>();
const pendingDownloads = new Map<string, Promise<string>>();

export async function getVideoDurationString(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      resolve('');
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const secs = video.duration;
      if (isNaN(secs) || secs <= 0) {
        resolve('00:00');
        return;
      }
      const mins = Math.floor(secs / 60);
      const remainder = Math.floor(secs % 60);
      resolve(`${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('00:00');
    };
    video.src = url;
  });
}

function fileSliceToBase64(slice: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(slice);
  });
}

/**
 * Uploads a file with progress tracking, cancellation support, SHA256 hashing, and duration extraction.
 * Handles large files (like videos) by chunking to bypass Firestore 1MB document limit.
 */
export function uploadFileWithProgress(
  file: File,
  userUid: string,
  onProgress: (progress: UploadProgress) => void
): { cancel: () => void; promise: Promise<FileAttachment> } {
  let isCancelled = false;

  const promise = new Promise<FileAttachment>(async (resolve, reject) => {
    try {
      await addSystemLog(`MEDIA UPLOAD STARTED: ${file.name} (${formatBytes(file.size)})`, 'INFO', userUid);

      if (isCancelled) {
        reject(new Error('UPLOAD_CANCELLED'));
        return;
      }

      onProgress({
        fileName: file.name,
        fileSize: file.size,
        progressPercent: 5,
        bytesTransferred: Math.round(file.size * 0.05),
        status: 'UPLOADING',
      });

      // Compute hash and duration concurrently
      const [hash, duration] = await Promise.all([
        computeFileSHA256(file),
        getVideoDurationString(file),
      ]);

      if (isCancelled) {
        reject(new Error('UPLOAD_CANCELLED'));
        return;
      }

      const isLargeFile = file.size >= 300 * 1024 || file.type.startsWith('video/');

      let attachment: FileAttachment;

      if (isLargeFile) {
        // Chunked upload to Firestore
        const fileId = `f_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
          if (isCancelled) {
            reject(new Error('UPLOAD_CANCELLED'));
            return;
          }

          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, (i + 1) * CHUNK_SIZE);
          const chunkBlob = file.slice(start, end);
          const chunkData = await fileSliceToBase64(chunkBlob);

          await addDoc(collection(db, 'file_chunks'), {
            fileId,
            index: i,
            totalChunks,
            chunkData,
            createdAt: Date.now(),
          });

          const percent = Math.round(((i + 1) / totalChunks) * 100);
          onProgress({
            fileName: file.name,
            fileSize: file.size,
            progressPercent: percent,
            bytesTransferred: end,
            status: 'UPLOADING',
          });
        }

        // Cache local object URL for instant playback on uploader client
        const localObjUrl = URL.createObjectURL(file);
        blobUrlCache.set(fileId, localObjUrl);

        attachment = {
          url: '',
          fileId,
          totalChunks,
          name: file.name,
          size: file.size,
          type: file.type || getFileTypeCategory(file.name),
          hash,
          duration,
          storagePath: `chunked://${fileId}`,
        };
      } else {
        // Small file direct data URL
        const dataUrl = await fileToDataUrl(file);
        onProgress({
          fileName: file.name,
          fileSize: file.size,
          progressPercent: 100,
          bytesTransferred: file.size,
          status: 'COMPLETE',
        });

        attachment = {
          url: dataUrl,
          name: file.name,
          size: file.size,
          type: file.type || getFileTypeCategory(file.name),
          hash,
          duration,
          storagePath: `direct://${file.name}`,
        };
      }

      await addSystemLog(`MEDIA UPLOAD COMPLETE: ${file.name}`, 'INFO', userUid);
      resolve(attachment);
    } catch (err) {
      if (isCancelled) {
        reject(new Error('UPLOAD_CANCELLED'));
      } else {
        await addSystemLog(`MEDIA UPLOAD FAILED: ${file.name}`, 'ERR', userUid);
        reject(err);
      }
    }
  });

  const cancel = () => {
    isCancelled = true;
  };

  return { cancel, promise };
}

export async function getOrLoadChunkedFileUrl(
  attachment: FileAttachment,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (attachment.url) {
    return attachment.url;
  }
  if (!attachment.fileId) {
    return '';
  }

  const fileId = attachment.fileId;

  if (blobUrlCache.has(fileId)) {
    return blobUrlCache.get(fileId)!;
  }

  if (pendingDownloads.has(fileId)) {
    return pendingDownloads.get(fileId)!;
  }

  const downloadPromise = (async () => {
    try {
      if (onProgress) onProgress(10);
      const q = query(collection(db, 'file_chunks'), where('fileId', '==', fileId));
      const snap = await getDocs(q);

      if (snap.empty) {
        throw new Error('No media chunks found in database');
      }

      if (onProgress) onProgress(40);

      const docs = snap.docs.map((d) => d.data() as { index: number; chunkData: string });
      docs.sort((a, b) => a.index - b.index);

      const blobParts: Blob[] = [];
      for (let i = 0; i < docs.length; i++) {
        const item = docs[i];
        const res = await fetch(item.chunkData);
        const chunkBlob = await res.blob();
        blobParts.push(chunkBlob);
        if (onProgress) {
          onProgress(40 + Math.round(((i + 1) / docs.length) * 55));
        }
      }

      const mimeType = attachment.type || getFileTypeCategory(attachment.name);
      const fullBlob = new Blob(blobParts, { type: mimeType });
      const blobUrl = URL.createObjectURL(fullBlob);

      blobUrlCache.set(fileId, blobUrl);
      if (onProgress) onProgress(100);
      return blobUrl;
    } finally {
      pendingDownloads.delete(fileId);
    }
  })();

  pendingDownloads.set(fileId, downloadPromise);
  return downloadPromise;
}

export async function fileToDataUrl(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return compressImageToDataUrl(file);
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1280;
      const MAX_HEIGHT = 1280;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

export function getFileTypeCategory(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video/mp4';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image/jpeg';
  if (ext === 'pdf') return 'application/pdf';
  if (['zip', 'tar', 'gz', '7z'].includes(ext)) return 'application/zip';
  if (['txt', 'log', 'md', 'json'].includes(ext)) return 'text/plain';
  if (['doc', 'docx'].includes(ext)) return 'application/msword';
  if (['xls', 'xlsx'].includes(ext)) return 'application/vnd.ms-excel';
  return 'application/octet-stream';
}

export async function deleteStorageFile(_storagePath?: string) {
  return;
}
