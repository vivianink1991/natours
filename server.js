// server file: an application entry point
const dotenv = require('dotenv')

dotenv.config({
	path:
		process.env.NODE_ENV === 'development'
			? './development.env'
			: 'production.env',
})

const app = require('./app')

console.log(process.env)
const port = process.env.PORT
app.listen(port, () => {
	console.log(`App running on port ${port}...`)
})
