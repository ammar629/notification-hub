import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10)
});


redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (error) => console.error("Redis error: ", error));

export default redis;