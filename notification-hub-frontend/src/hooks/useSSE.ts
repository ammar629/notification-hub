import { useEffect, useState } from "react";


interface Message {
    topicId: number;
    content: string;
    createdBy: number;
    timestamp: string;
    username: string;
}

export function useSSE(userId: number | null, subscriptions: number[]) {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        // Only connect if subscribed
        if (!userId || subscriptions.length === 0) return;

        const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${userId}`);

        eventSource.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                setMessages((prev) => [message, ...prev]);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error('Failed to parse message:', err.message);
                }
            }
        };

        eventSource.onerror = () => {
            console.error("SSE Connection Error");
            eventSource.close();
        };

        // Cleanup on unmount or when userId/subscriptions change
        return () => eventSource.close();
    }, [userId, subscriptions]);

    return messages;
}