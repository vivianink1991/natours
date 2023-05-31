const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please tell us your name!']
	},
	email: {
		type: String,
		required: [true, 'Please provide your email!'],
		unique: true,
		lowercase: true, // not a validator, automatically transform email to lowercase
		validate: [validator.isEmail, 'Please input a valid email!']
	},
	photo: String,
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		minlength: 8
	}
})

const User = mongoose.model('user', userSchema)

module.exports = User
