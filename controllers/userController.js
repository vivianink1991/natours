const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const AppError = require('../utils/appError')
const factory = require('./factoryController')

const filterObj = (obj, ...allowedFields) => {
	const newObj = {}
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el]
	})

	return newObj
}

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id
	next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
	// If POSTed data includes password, throw error
	console.log('req', req.body)
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword.',
				400
			)
		)

	// Update the current user data
	const filterdBody = filterObj(req.body, 'name', 'email')
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
		new: true,
		runValidators: true
	})

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	})
})

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false })

	res.status(204).json({
		status: 'success',
		data: null
	})
})

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
// Do NOT update password with this
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
