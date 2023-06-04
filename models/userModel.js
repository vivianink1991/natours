const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
		minlength: 8,
		select: false // can't be reached by find method or this.XXX in instance method
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		minlength: 8,
		validate: {
			// This only works when CREATE and SAVE
			validator: function(el) {
				return el === this.password
			},
			message: 'Passwords are not the same'
		}
	}
})

userSchema.pre('save', async function(next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next()

	// Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12)

	// Delete passwordConfirm field
	this.passwordConfirm = undefined
	next()
})

// instance method, can be accessed by all documents
userSchema.methods.correctPassword = async function(
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('user', userSchema)

module.exports = User
