import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";

const urlCache = new Map();

export function useStorageURL(storage, path) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState(null);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Si ya está en caché, úsalo
    if (urlCache.has(path)) {
      setUrl(urlCache.get(path));
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const storageRef = ref(storage, path);
    getDownloadURL(storageRef)
      .then((u) => {
        if (!active.current) return;
        urlCache.set(path, u);
        setUrl(u);
      })
      .catch((e) => {
        if (!active.current) return;
        setError(e);
        setUrl(null);
      })
      .finally(() => {
        if (!active.current) return;
        setLoading(false);
      });
  }, [storage, path]);

  return { url, loading, error, reload: () => urlCache.delete(path || "") };
}
