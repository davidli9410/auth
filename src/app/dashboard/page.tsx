"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/');
      return;
    }

    // For now, just show the dashboard without fetching user data
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
        
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>You are logged in!</h2>
          <p className={styles.cardText}>This is the Dashboard page.</p>
        </div>
      </div>
    </div>
  );
}