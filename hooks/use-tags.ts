import { useEffect, useState } from 'react';
import { useFileManager } from '@/context/file-manager-context';

export function useTags() {
  const { provider } = useFileManager();
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    provider
      .getTags()
      .then((items) => {
        if (isMounted) {
          setAvailableTags(items ?? []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvailableTags([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [provider]);

  return availableTags;
}
