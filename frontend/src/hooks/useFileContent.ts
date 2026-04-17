/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { readFile } from '../services/api';

interface FileContentResult {
  content: string;
  fileName: string;
  loading: boolean;
  error: string | null;
}

export function useFileContent(projectPath: string, filePath: string): FileContentResult {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!filePath || !projectPath) {
      setContent('');
      setFileName('');
      setError(null);
      setLoading(false);
      return;
    }

    setError(null);
    // Extract file name from path
    const parts = filePath.split('/');
    const name = parts[parts.length - 1] || '';
    setFileName(name);
    setLoading(true);

    readFile(projectPath, filePath)
      .then((text) => {
        if (isMountedRef.current) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (isMountedRef.current) {
          setError(e instanceof Error ? e.message : 'Failed to load file');
          setContent('');
          setLoading(false);
        }
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [projectPath, filePath]);

  return { content, fileName, loading, error };
}
