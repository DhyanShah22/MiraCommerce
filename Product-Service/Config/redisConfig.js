const redis = require('redis');

require('dotenv').config()


let client;

const connectRedis = async () => {
    client = redis.createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });

    client.on('connect', () => {
        console.log('Connected to Redis...');
    });

    client.on('error', (err) => {
        console.error('Redis error:', err);
    });

    await client.connect();
};

const getRedisClient = () => {
    if (!client) {
        throw new Error('Redis client is not connected');
    }
    return client;
};

module.exports = { connectRedis, getRedisClient };