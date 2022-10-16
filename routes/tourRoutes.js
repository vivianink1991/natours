const express = require('express')
const tourController = require('../controllers/tourController')

const router = express.Router() // a middleware, can be mounted on app. Basically it's a sub application

router.param('id', tourController.checkID)

router
	.route('/')
	.get(tourController.getAllTours)
	.post(tourController.checkBody, tourController.createTour) // chainning multiple middlewares for a method

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(tourController.deleteTour)

module.exports = router
