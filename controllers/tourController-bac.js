const Tour = require('../models/tourModel')

// const tours = JSON.parse(
// 	fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )

// exports.checkID = (req, res, next, val) => {
// 	console.log(`Tour id is: ${val}`)
// 	if (val * 1 > tours.length) {
// 		return res.status(404).json({
// 			status: 'fail',
// 			message: 'Invalid ID',
// 		})
// 	}
// 	next()
// }

// exports.checkBody = (req, res, next) => {
// 	const { name, price } = req.body
// 	if (!name || price === undefined) {
// 		return res.status(400).json({
// 			status: 'fail',
// 			message: 'Missing name or price',
// 			data: null,
// 		})
// 	}
// 	next()
// }

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = 5
	req.query.sort = '-ratingsAverage,price'
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
	next()
}

exports.getTours = async (req, res) => {
	try {
		const queryObj = { ...req.query }
		const excludedFields = ['page', 'sort', 'limit', 'fields']
		excludedFields.forEach(el => delete queryObj[el])
		console.log('req', req.query)
		// 1) Advanced filtering
		let queryStr = JSON.stringify(queryObj)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // Stardard use: /api/v1/tours/?duration[gte]=5&difficulty=easy

		// BUILD QUERY
		let query = Tour.find(JSON.parse(queryStr)) // return a Query object, can be chained by methods.

		// 2) Sort
		if (req.query.sort) {
			// eg. ascend: ?sort=price; descend: ?sort=-price
			const sortBy = req.query.sort.split(',').join(' ')
			query = query.sort(sortBy)
			// query = query.sort(req.query.sort)
		} else {
			query = query.sort('-createdAt')
		}

		// 3) Field Limiting
		if (req.query.fields) {
			const fields = req.query.fields.split(',').join(' ')
			console.log('fields', fields)
			query = query.select(fields)
		} else {
			query = query.select('-__v') // - means exclude
		}

		// 4) Pagination
		const page = req.query.page * 1 || 1
		const limit = req.query.limit * 1 || 100
		const skip = limit * (page - 1)
		query = query.skip(skip).limit(limit)

		if (req.query.page) {
			const numTours = await Tour.countDocuments()
			if (skip >= numTours) throw new Error('This page does not exist')
		}

		// EXCUTE QUERY
		const tours = await query

		// mongoDB query
		// const tours = await Tour.find(JSON.parse(queryStr))

		// mongoose method
		// const tours = await Tour.find()
		// 	.where('duration')
		// 	.equals(5)
		// 	.where('difficulty')
		// 	.equals('easy')

		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				tours
			}
		})
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err
		})
	}
}

exports.getTour = async (req, res) => {
	try {
		const tour = await Tour.findById(req.params.id) // equals Tour.findOne({ _id: req.params.id })
		res.status(200).json({
			status: 'success',
			data: {
				tour
			}
		})
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err
		})
	}
}

exports.createTour = async (req, res) => {
	try {
		// const newTour = new Tour({})
		// newTour.save()
		const newTour = await Tour.create(req.body)

		res.status(201).json({
			// created 201
			status: 'success',
			data: {
				tour: newTour
			}
		})
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err
		})
	}
}

exports.updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true, // return the new document rather than the origin
			runValidators: true
		})
		res.status(200).json({
			status: 'success',
			data: {
				tour
			}
		})
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err
		})
	}
}

exports.deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id)
		// 204 no content
		res.status(204).json({
			status: 'success',
			data: null
		})
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err
		})
	}
}
