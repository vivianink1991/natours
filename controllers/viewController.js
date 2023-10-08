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

exports.getTour = (req, res) => {
	res.status(200).render('tour', {
		title: 'The Forest Hiker Tour'
	})
}
