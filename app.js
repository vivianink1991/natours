const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
// const { xss } = require('express-xss-sanitizer')
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) GLOBAL MIDDLEWARES

// Serve static file
app.use(express.static(path.join(__dirname, 'public')))

// Secure HTTP Headers
app.use(helmet())

// Development Logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// Limit requests from same IP
const limiter = rateLimit({
	max: 100,
	window: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter) // affect routes starts with /api

// Body parser, reading data from body into req.body
// middleware, 解析JSON格式的请求body体，在route handler中可通过req.body访问请求body体。
// 没有该中间件则req.body=undefined
app.use(express.json({ limit: '10kb' }))

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Serving static files
// Prevent HTTP Parameter Pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price'
		]
	})
)

// Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	next()
})

// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
