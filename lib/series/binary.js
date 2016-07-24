function SeriesBinaryExtender (Series) {

	/**
	* Add a numeric value to each element of the series or
	* add another series value to this series
	* @param {Number|Series|Object} operand Static value or another series to be added
	*/
	Series.prototype.add = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a + b;
		});
	};

	Series.prototype.sub = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a - b;
		});
	};

	Series.prototype.mul = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a * b;
		});
	};

	Series.prototype.div = function (operand) {
		return this.processOperator(operand, function (a, b) {
			if (b === 0) {
				return NaN;
			}
			return a / b;
		});
	};

	Series.prototype.eq = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a === b;
		});
	}

	Series.prototype.lt = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a < b;
		});		
	}

	Series.prototype.lte = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a <= b;
		});		
	}

	Series.prototype.gt = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a > b;
		});		
	}

	Series.prototype.gte = function (operand) {
		return this.processOperator(operand, function (a, b) {
			return a >= b;
		});		
	}
};

module.exports = {
	extends : SeriesBinaryExtender
};