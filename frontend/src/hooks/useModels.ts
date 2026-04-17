import { useState, useEffect } from 'react';
import type { Model } from '../types';
import { listModels } from '../services/api';

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchModels = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await listModels();
        if (!cancelled) {
          const mapped: Model[] = resp.map((m) => ({
            id: m.id,
            name: m.name,
            provider: m.provider,
            contextWindow: m.contextWindow || 0,
            maxTokens: m.maxTokens || 0,
          }));
          setModels(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load models');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchModels();
    return () => {
      cancelled = true;
    };
  }, []);

  return { models, loading, error };
}
