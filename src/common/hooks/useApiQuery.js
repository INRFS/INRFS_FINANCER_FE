import { useCallback, useEffect, useRef, useState } from 'react';

export function useApiQuery(loader, initialData = null) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loaderRef.current());
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, setData, loading, error, refetch: load };
}
