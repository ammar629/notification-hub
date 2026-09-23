'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState<number | null>(null);

    const handleSignup = async () => {
        setError('');

        // Validation
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!password.trim()) {
            setError('Password is required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error('Signup failed');

            setUserId(1);
            localStorage.setItem('userId', '1');
            localStorage.setItem('email', email);

            const data = await res.json();

            alert(`${data.message}. You can now subscribe to topics and receive notifications.`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Notification Hub</h1>
                <p className={styles.subtitle}>Real-time messaging with Redis & SSE</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className={styles.error}>{error}</p>}

                <button
                    onClick={handleSignup}
                    disabled={loading || !email.trim() || !password.trim()}
                    className={styles.button}
                >
                    {loading ? 'Loading...' : 'Signup & Continue'}
                </button>
            </div>
        </div>
    );
}