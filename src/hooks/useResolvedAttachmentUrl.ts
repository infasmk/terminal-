import { useState, useEffect } from 'react';
import { FileAttachment } from '../types';
import { getOrLoadChunkedFileUrl } from '../services/storageService';

export function useResolvedAttachmentUrl(attachment?: FileAttachment) {
  const [resolvedUrl, setResolvedUrl] = useState<string>(attachment?.url || '');
  const [loadingPercent, setLoadingPercent] = useState<number>(attachment?.url ? 100 : 0);
  const [isLoading, setIsLoading] = useState<boolean>(!attachment?.url && Boolean(attachment?.fileId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attachment) {
      setResolvedUrl('');
      setIsLoading(false);
      return;
    }

    if (attachment.url) {
      setResolvedUrl(attachment.url);
      setIsLoading(false);
      return;
    }

    if (attachment.fileId) {
      setIsLoading(true);
      setLoadingPercent(10);
      let isSubscribed = true;

      getOrLoadChunkedFileUrl(attachment, (percent) => {
        if (isSubscribed) {
          setLoadingPercent(percent);
        }
      })
        .then((url) => {
          if (isSubscribed) {
            setResolvedUrl(url);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isSubscribed) {
            console.error('Failed to load chunked attachment:', err);
            setError('FAILED TO ASSEMBLE MEDIA');
            setIsLoading(false);
          }
        });

      return () => {
        isSubscribed = false;
      };
    }
  }, [attachment?.fileId, attachment?.url, attachment?.name]);

  return { resolvedUrl, isLoading, loadingPercent, error };
}
