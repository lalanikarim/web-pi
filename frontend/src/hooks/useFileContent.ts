/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { mockFileContent as getMockContent } from '../services/mockData';

interface FileContentResult {
  content: string;
  fileName: string;
  loading: boolean;
  error: string | null;
}

export function useFileContent(_projectPath: string, filePath: string): FileContentResult {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!filePath) {
      setContent('');
      setFileName('');
      setError(null);
      setLoading(false);
      return;
    }

    setError(null);
    const parts = filePath.split('/');
    const name = parts[parts.length - 1] || '';
    setFileName(name);
    setLoading(true);

    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          const result = getMockContent(filePath);
          setContent(result);
        } catch {
          setError('Failed to load file');
        }
        setLoading(false);
      }
    }, 300);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
    };
  }, [filePath]);

  return { content, fileName, loading, error };
}
