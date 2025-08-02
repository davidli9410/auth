"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from './page.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken) {
          setCheckingAuth(false);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          router.push('/dashboard');
        } else {
          // Token might be expired, clear it
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        // User is not authenticated, stay on login page
        localStorage.removeItem('accessToken');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });

      const data = await response.json();

      if(data.success) {
        localStorage.setItem('accessToken', data.data.access_token);
        router.push('/dashboard');
      } else {
        setError(data.error?.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, email, password})
      });

      const data = await response.json();

      if(data.success) {
        setError('');
        setIsRegistering(false);
        setUsername('');
        setEmail('');
        setPassword('');
        alert('Registration successful! You can now log in.');
      } else {
        setError(data.error?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) clearError();
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className={styles.card}>
        <div className={styles.index}>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.index}>
        <h1>
          Auth
        </h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleInputChange(setUsername)}
                className={styles.input}
                required
              />
            </div>
          )}
          <div >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleInputChange(setEmail)}
              className={styles.input}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handleInputChange(setPassword)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div>
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              clearError();
            }}
          >
            {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );

}


