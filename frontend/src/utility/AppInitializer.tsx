// AppInitializer.tsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext'; 

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' }) // send cookie automatically
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>; // Or a nice spinner

  return <>{children}</>;
};
