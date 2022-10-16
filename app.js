// things releated to express application

const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}
// middleware, 解析JSON格式的请求body体，在route handler中可通过req.body访问请求body体。
// 没有该中间件则req .body=undefined
app.use(express.json())

// Serve static file
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
	console.log('Hello from the middleware 😀')
	next()
})

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString()
	next()
})

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app
