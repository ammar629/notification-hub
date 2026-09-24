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
    const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

    // Use the custom SSE hook to receive real-time messages
    const messages = useSSE(userId, subscriptions);


    const TOPIC_COLORS = [
        '#667eea', // primary
        '#764ba2', // secondary
        '#f093fb', // pink
        '#4facfe', // blue
        '#00f2fe', // cyan
        '#43e97b', // green
        '#fa709a', // red
        '#fee140', // yellow
    ];

    const getTopicColor = (topicId: number) => {
        return TOPIC_COLORS[topicId % TOPIC_COLORS.length];
    };

    const getTopicName = (topicId: number) => {
        return topics.find((t) => t.id === topicId)?.name || `Topic ${topicId}`;
    };


    // Set Default Topic when subscriptions load
    useEffect(() => {
        if (subscriptions.length > 0 && !selectedTopic) {
            const setCurrTopic = async () => {
                setSelectedTopic(subscriptions[0]);
            }

            setCurrTopic();

        }
    }, [subscriptions, selectedTopic]);


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
        if (!messageContent.trim() || !subscriptions[0] || !selectedTopic) {
            return;
        }
        const username = localStorage.getItem("email");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: selectedTopic,
                    content: messageContent,
                    createdBy: userId,
                    username: username
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
                            <div
                                key={idx}
                                className={styles.message}
                                style={{ borderLeftColor: getTopicColor(msg.topicId) }}
                            >
                                <p>{msg.content}</p>
                                <small>
                                    <span
                                        className={styles.topicBadge}
                                        style={{ backgroundColor: getTopicColor(msg.topicId) }}
                                    >
                                        {getTopicName(msg.topicId)}
                                    </span>
                                    • {msg.username || `User ${msg.createdBy}`} • {new Date(msg.timestamp).toLocaleTimeString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
                {subscriptions.length > 0 && (
                    <div className={styles.publishForm}>
                        <select
                            value={selectedTopic || ''}
                            onChange={(e) => setSelectedTopic(parseInt(e.target.value))}
                            className={styles.topicSelect}>
                            {subscriptions.map((topicId) => (
                                <option key={topicId} value={topicId}>
                                    {getTopicName(topicId)}
                                </option>
                            ))}
                        </select>
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
