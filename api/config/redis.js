import "dotenv/config";
import { createClient } from "redis";

const redisUrl =
  process.env.REDIS_URL ||
  (process.env.REDIS_HOST
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
    : "redis://localhost:6379");

const redis = createClient({
  url: redisUrl,
});

redis.on("error", (error) => console.error("Redis Client Error:", error.message || error));
redis.on("connect", () => console.log("Redis Client Connected"));
redis.on("ready", () => console.log("Redis Client Ready"));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
};

export const deleteKeysByPattern = async (pattern) => {
  if (!redis.isOpen) return;
  try {
    const keys = await redis.keys(pattern);
    if (!keys || !keys.length) return;
    await redis.del(keys);
  } catch (err) {
    console.error("Error deleting redis keys by pattern:", err.message || err);
  }
};
// Alias to maintain compatibility with the original typo
export const connectRredis = connectRedis;

export default redis;
