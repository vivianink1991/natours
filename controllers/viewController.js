const Tour = require('../models/tourModel')
const CatchAsync = require('../utils/catchAsync')

exports.getOverview = CatchAsync(async (req, res, next) => {
	// 1) Get tour data from collection
	const tours = await Tour.find()

	// 2) Build template

	// 3) Render template with data from 1)

	res.status(200).render('overview', {
		title: 'All Tours',
		tours
	})
})

exports.getTour = async (req, res) => {
	// 1) Get the data, for the requested tour (including reviews and guides)
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user'
	})
	// 2) Build template

	// 3) Render template using data from 1)
	res.status(200).render('tour', {
		title: 'The Forest Hiker Tour',
		tour
	})
}
