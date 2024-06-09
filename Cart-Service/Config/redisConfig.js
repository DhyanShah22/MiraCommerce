const redis = require('redis');

let client;

const connectRedis = async () => {
    client = redis.createClient();

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