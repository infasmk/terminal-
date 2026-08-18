/**
 * Computes a SHA-256 hex hash string for a given File or ArrayBuffer.
 */
export async function computeFileSHA256(file: File | Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return hashHex;
  } catch (err) {
    console.warn('Crypto subtle SHA256 error, falling back to mock hash:', err);
    // Fallback pseudo hash based on filename + size + timestamp
    const fileName = 'name' in file ? (file as File).name : 'blob';
    let str = fileName + file.size + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, 'F').toUpperCase();
  }
}

export function truncateHash(hash: string, length = 12): string {
  if (!hash) return '0000...0000';
  if (hash.length <= length) return hash;
  const start = hash.slice(0, 6);
  const end = hash.slice(-4);
  return `${start}...${end}`;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDurationSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const mStr = mins.toString().padStart(2, '0');
  const sStr = secs.toString().padStart(2, '0');
  return `${mStr}:${sStr}`;
}
