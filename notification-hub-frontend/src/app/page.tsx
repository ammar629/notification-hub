'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Login() {
    // Router
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError("");

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
            const endpoint = isLogin ? "login" : "signup";
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            // Something went wrong during API call
            if (!res.ok) {
                throw new Error(data.error);
            }

            // API call successful
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("email", email);

            router.push("/dashboard");

        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Notification Hub</h1>
                <p className={styles.subtitle}>Real-time messaging with Redis & SSE</p>

                <div className={styles.toggle}>
                    <button className={!isLogin ? styles.active : ""}
                        onClick={() => setIsLogin(false)}
                    >
                        Signup
                    </button>
                    <button className={isLogin ? styles.active : ""}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                </div>

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
                    onClick={handleSubmit}
                    disabled={loading || !email.trim() || !password.trim()}
                    className={styles.button}
                >
                    {loading ? 'Loading...' : isLogin ? 'Login' : "Signup"}
                </button>
            </div>
        </div>
    );
}