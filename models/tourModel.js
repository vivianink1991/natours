const mongoose = require('mongoose')
const slugify = require('slugify')
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'A tour name must have less or equal then 40 characters'],
			minlength: [10, 'A tour name must have more or equal then 10 characters']
			// validate: [validator.isAlpha, 'Tour name must only contain characters']
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: easy, medium, difficult'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
			set: val => Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function(val) {
					// this only points to current doc on NEW document creation
					return val < this.price
				},
				message: 'Discount price ({VALUE}) should be below regular price'
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a description']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false // won't return in query
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			// GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number], // array of number, [longitude, latitude]
			address: String,
			description: String
		},
		locations: [
			// embedded documents
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String
			}
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User' // no need to import User
			}
		]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

// tourSchema.index({ price: 1 }) // 1 for ascending order, -1 for descending order
tourSchema.index({ price: 1, ratingsAverage: -1 }) // 1 for ascending order, -1 for descending order
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7
})

// Virtual Populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour', // the field in other model
	localField: '_id' // the field in current model that referenced by other field (equals to foreign field)
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create() (not .insert)
tourSchema.pre('save', function(next) {
	// add some new property, should be defined in schema first
	this.slug = slugify(this.name, { lower: true }) // 'this' points to the currently processed document
	next()
})

// Embed guide user into model
// tourSchema.pre('save', async function(next) {
// 	const guidesPromises = this.guides.map(async id => await User.findById(id))
// 	this.guides = await Promise.all(guidesPromises)
// 	next()
// })

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
	this.find({ secretTour: { $ne: true } }) // this points to current Query object

	this.start = Date.now()
	next()
})

tourSchema.pre(/^find/, function(next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt' // filter some fields
	})
	next()
})

tourSchema.post(/^find/, function(docs, next) {
	console.log(`Query took ${Date.now() - this.start} milliseconds!`)
	next()
})

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
// 	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }) // this points to the aggregation object

// 	console.log(this.pipeline())
// 	next()
// })

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
