class APIFeatures {
	constructor(query, queryString) {
		this.query = query
		this.queryString = queryString
	}

	filter() {
		console.log('query', this.queryString)
		const queryObj = { ...this.queryString }
		const excludedFields = ['page', 'sort', 'limit', 'fields']
		excludedFields.forEach(el => delete queryObj[el])

		// 1) Advanced filtering
		let queryStr = JSON.stringify(queryObj)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // Stardard use: /api/v1/tours/?duration[gte]=5&difficulty=easy

		// BUILD QUERY
		this.query = this.query.find(JSON.parse(queryStr))

		return this
	}

	sort() {
		if (this.queryString.sort) {
			// eg. ascend: ?sort=price; descend: ?sort=-price
			const sortBy = this.queryString.sort.split(',').join(' ')
			this.query = this.query.sort(sortBy)
		} else {
			this.query = this.query.sort('-createdAt')
		}

		return this
	}

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ')
			this.query = this.query.select(fields)
		} else {
			this.query = this.query.select('-__v') // - means exclude
		}

		return this
	}

	paginate() {
		const page = this.queryString.page * 1 || 1
		const limit = this.queryString.limit * 1 || 100
		const skip = limit * (page - 1)
		this.query = this.query.skip(skip).limit(limit)

		return this
	}
}

module.exports = APIFeatures
