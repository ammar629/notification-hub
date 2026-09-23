'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/Dashboard.module.css';
import { useRouter } from 'next/navigation';
import { useSSE } from "@/hooks/useSSE";

interface Topic {
    id: number;
    name: string;
}

interface SubscriptionResponse {
    id?: number;
    userId: number;
    topicId: number;
}

export default function Dashboard() {
    const router = useRouter();

    // FIX: Lazy state initialization with an SSR safety check.
    // This runs exactly once on mount, setting state instantly without an effect.
    const [userId, setUserId] = useState<number | null>(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('userId');
            if (!id) {
                router.push('/');
                return null;
            }
            return parseInt(id, 10);
        }
        return null;
    });

    const [topics, setTopics] = useState<Topic[]>([]);
    const [subscriptions, setSubscriptions] = useState<number[]>([]);
    const [messageContent, setMessageContent] = useState('');
    const [loading, setLoading] = useState(true);

    // Use the custom SSE hook to receive real-time messages
    const messages = useSSE(userId, subscriptions);


    // Data Fetching Effect
    useEffect(() => {
        if (!userId) return;

        const fetchTopics = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/topics`);
                const data = await res.json();
                setTopics(data);
            } catch (err) {
                console.error('Failed to fetch topics:', err);
            }
        };

        const fetchSubscriptions = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${userId}`);
                const data = await res.json();
                setSubscriptions(data.map((sub: SubscriptionResponse) => sub.topicId));
            } catch (err) {
                console.error('Failed to fetch subscriptions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
        fetchSubscriptions();
    }, [userId]);

    const handleSubscribe = async (topicId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, topicId }),
            });

            if (res.ok) {
                setSubscriptions((prev) => [...prev, topicId]);
                alert('Subscribed!');
            }
        } catch (err) {
            console.error('Failed to subscribe:', err);
        }
    };

    const handlePublish = async () => {
        if (!messageContent.trim() || !subscriptions[0]) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: subscriptions[0],
                    content: messageContent,
                    createdBy: userId,
                }),
            });

            if (res.ok) {
                setMessageContent('');
            }
        } catch (err) {
            console.error('Failed to publish:', err);
        }
    };

    // Edge case: If user isn't authenticated yet, don't flash dashboard structures
    if (!userId || loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <h2>Topics</h2>
                <div className={styles.topicsList}>
                    {topics.map((topic) => (
                        <div key={topic.id} className={styles.topicItem}>
                            <span>{topic.name}</span>
                            {subscriptions.includes(topic.id) ? (
                                <span className={styles.badge}>✓ Subscribed</span>
                            ) : (
                                <button onClick={() => handleSubscribe(topic.id)}>Subscribe</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.main}>
                <h1>Real-time Messages</h1>

                <div className={styles.messagesList}>
                    {messages.length === 0 ? (
                        <p className={styles.empty}>No messages yet. Subscribe to a topic!</p>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={styles.message}>
                                <p>{msg.content}</p>
                                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                            </div>
                        ))
                    )}
                </div>

                {subscriptions.length > 0 && (
                    <div className={styles.publishForm}>
                        <textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={handlePublish}>Publish</button>
                    </div>
                )}
            </div>
        </div>
    );
}
