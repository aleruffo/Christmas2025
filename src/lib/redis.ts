import Redis from "ioredis";

const getRedisClient = () => {
    if (!process.env.REDIS_URL) {
        throw new Error("REDIS_URL is not defined");
    }
    return new Redis(process.env.REDIS_URL);
};

// Singleton instance for serverless environment to avoid too many connections
// In Next.js dev mode, global instance prevents connection leaks
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || getRedisClient();

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}
