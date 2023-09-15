const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')

const reviewRouter = require('../routes/reviewRoutes')

const router = express.Router() // a middleware, can be mounted on app. Basically it's a sub application

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter) // routes starts with /api/v1/tours/tourId/reviews will redirect to review router

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)
router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restricTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan
	)

router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restricTo('admin', 'lead-guide'),
		tourController.createTour
	)

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restricTo('admin', 'lead-guide'),
		tourController.updateTour
	)
	.delete(
		authController.protect,
		authController.restricTo('admin', 'lead-guide'),
		tourController.deleteTour
	)

module.exports = router
