const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'Review can not be empty!']
		},
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		createdAt: {
			type: Date,
			default: Date.now()
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A review must belong to a tour']
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'A review must belong to a user']
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

reviewSchema.pre(/^find/, function(next) {
	// this.populate({
	// 	path: 'user',
	// 	select: 'name photo'
	// }).populate({
	// 	path: 'tour',
	// 	select: 'name'
	// })

	this.populate({
		path: 'user',
		select: 'name photo'
	})

	next()
})

// functions on model
reviewSchema.statics.calcAverageRatings = async function(tourId) {
	// this points to model
	const stats = await this.aggregate([
		{
			$match: { tour: tourId }
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' }
			}
		}
	])

	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating
		})
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5
		})
	}
}

reviewSchema.post('save', function() {
	// this points to current document
	// contructor points to model since model created after and can't be referenced now
	this.constructor.calcAverageRatings(this.tour)
})

// findByIdAndUpdate, findByIdAndDelete是findOneAndXXX的简便方式
reviewSchema.pre(/^findOneAnd/, async function(next) {
	// this points the query object
	this.r = await this.findOne() // return the document.不能放到post的原因是，post时query已经执行完毕，不能再await了。
	next()
})

reviewSchema.post(/^findOneAnd/, async function(next) {
	// await this.findOne() does not work here, query has already executed now.
	this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
