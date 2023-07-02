const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.deleteOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id)

		if (!doc) {
			return next(new AppError('No document found with that ID', 404))
		}

		res.status(204).json({
			status: 'success',
			data: null
		})
	})

exports.updateOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true, // return the new document rather than the origin
			runValidators: true
		})

		if (!doc) {
			return next(new AppError('No document found with that ID', 404))
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc
			}
		})
	})

exports.createOne = Model =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body)

		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		})
	})

exports.getOne = (Model, populateOption) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id)
		if (populateOption) query = query.populate(populateOption)
		const doc = await query

		if (!doc) {
			return next(new AppError('No document found with that ID', 404))
		}

		res.status(200).json({
			status: 'success',
			data: {
				doc
			}
		})
	})

exports.getAll = Model =>
	catchAsync(async (req, res, next) => {
		// To allow nested GET reviews on tour(hack)
		let filter = {}
		if (req.params.tourId) filter = { tour: req.params.tourId }

		const features = new APIFeatures(Model.find(filter), req.query) // create a Query instance by call myModel.find()
			.filter()
			.sort()
			.limitFields()
			.paginate()

		// EXCUTE QUERY
		// const docs = await features.query.explain()
		const docs = await features.query

		// SEND RESPONSE
		res.status(200).json({
			status: 'success',
			results: docs.length,
			data: {
				docs
			}
		})
	})
