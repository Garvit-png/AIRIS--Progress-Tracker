const { Redis } = require('@upstash/redis');

// Initialize the Redis client seamlessly using environment variables.
// If UPSTASH credentials are not yet provided, we will fail silently and bypass the cache.
let redisClient = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redisClient = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Upstash Redis Initialization Complete.');
    } else {
        console.log('⚠️ Upstash Redis variables missing. Running without cache initially.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Upstash Redis:', error.message);
}

// Wrapper to easily get/set keys with error resilience
exports.cacheGet = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data; // Upstash auto-parses JSON!
    } catch (e) {
        // Silently fail, don't flood console with WRONGPASS errors.
        return null;
    }
};

exports.cacheSetEx = async (key, seconds, data) => {
    if (!redisClient) return;
    try {
        await redisClient.setex(key, seconds, data);
    } catch (e) {
        // Silently fail
    }
};
