const { getRedisClient } = require('../Config/redisConfig')

const getCache = async(key) => {
    const client = getRedisClient()
    try {
        const data = await client.get(key)
        return data
    } catch(err) {
        console.log('Redis GET Error: ',err)
        throw err
    }
}

const setCache = async(key, value, expiration = 3600) => {
    const client = getRedisClient()
    try {
        await client.setEx(key, expiration, JSON.stringify(value))
    } catch (err) {
        console.log('Redis SET Error: ',err);
        throw err
    }
}

module.exports = {
    getCache,
    setCache
}