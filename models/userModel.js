const crypto = require('crypto')
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
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
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
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false
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

userSchema.pre('save', function(next) {
	if (!this.isModified('password') || this.isNew) return next()

	this.passwordChangedAt = Date.now() - 1000 // 有时jwt颁发的时间要早于此处执行时间，因此稍微减掉一点，保证jwt颁发晚于password change

	next()
})

userSchema.pre(/^find/, function(next) {
	// this points to current query
	this.find({ active: { $ne: false } })
	next()
})

// instance method, can be accessed by all documents
userSchema.methods.correctPassword = async function(
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.passwordChangedAfter = function(JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		)
		return JWTTimestamp < changedTimestamp
	}
	// false means not changed
	return false
}

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex') // original token

	// encrypt the token
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex')

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000

	return resetToken
}

const User = mongoose.model('user', userSchema)

module.exports = User
