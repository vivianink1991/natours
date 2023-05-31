const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
// const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// middleware, 解析JSON格式的请求body体，在route handler中可通过req.body访问请求body体。
// 没有该中间件则req.body=undefined
app.use(express.json())

// Serve static file
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	next()
})

// 3) ROUTES
// app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app