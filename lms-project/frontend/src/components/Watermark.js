import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Watermark = () => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ top: '10%', left: '10%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 80) + 10 + '%';
      const left = Math.floor(Math.random() * 80) + 10 + '%';
      setPosition({ top, left });
    }, 10000); // Move every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <div className="watermark" style={{ top: position.top, left: position.left }}>
      {user.email} - {new Date().toLocaleDateString()}
    </div>
  );
};

export default Watermark;
