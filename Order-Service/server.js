const express = require('express')
const mongoose = require('mongoose')

const morgan = require('morgan')
const helmet = require('helmet')

const { collectMetrics, metricsEndpoint } = require('./Middleware/metrics');
const orderRoutes = require('./Routes/orderRoutes')
require('dotenv').config()
const logger = require('./Logger/logger')
const app = express()
app.use(express.json())

app.use(collectMetrics); 
app.use(helmet())
app.use(morgan('dev'))

const {
    connectRedis
} = require('./Config/redisConfig')
app.use((req, res, next) => {
    //console.log(req.path, req.method)
    logger.info(req.path, req.method)
    next()
})

app.use('/api/order', orderRoutes)
app.get('/metrics', metricsEndpoint);
connectRedis()

mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen((process.env.PORT), () => {
            console.log('Connected to DB and listening to port', process.env.PORT)
            logger.info('Connected to DB and listening to port: 4000')
        })
    })
    .catch((error) => {
        console.log(error)
    })