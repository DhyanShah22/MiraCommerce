const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')

const { collectMetrics, metricsEndpoint } = require('./Middleware/metrics');

require('dotenv').config()
const userRoutes = require('./Routes/userRoutes')
const logger = require('./Logger/logger')
const app = express()
app.use(express.json())

app.use(collectMetrics); 
app.use(helmet())
app.use(morgan('dev'))

app.use((req, res, next) => {
    console.log(req.path, req.method)
    logger.info(req.path, req.method)
    next()
})

app.get('/metrics', metricsEndpoint);

app.use('/api/user', userRoutes)
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen((process.env.PORT), () => {
            //console.log('Connected to DB and listening to port', process.env.PORT)
            logger.info('Connected to DB and listening to port: 9000')
        })
    })
    .catch((error) => {
        console.log(error)
    })