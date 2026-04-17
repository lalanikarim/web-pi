import { useState, useEffect } from 'react';
import type { Model } from '../types';
import { MOCK_MODELS } from '../services/mockData';

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        setModels(MOCK_MODELS);
        setLoading(false);
      } catch (e) {
        setError('Failed to load models');
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);

    return () => clearTimeout(timer);
  }, []);

  return { models, loading, error };
}
