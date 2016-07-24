var binary = require('./series/binary');

/**
* Series is a list of data values that each value can be accessed
* by index (which could be numeric running number or object type)
* @constructor
* @param {Array.<*>=} opt_data Optional initial array of data
* @param {Array.<*>=} opt_indices Optional initial array of indices
*/
function Series(opt_data, opt_indices) {
	this._dataMap = {};
	this._indexList = [];

	if (opt_data !== undefined) {
		
		//If indices are specified, the length of data array must be
		//equal to the length of the indices array
		if (opt_indices !== undefined) {
			if (opt_data.length !== opt_indices.length) {
				throw new Error('Length of data and indices must be equal');
			}
		}

		for (var i=0; i<opt_data.length; i++) {
			var index = i;
			if (opt_indices && i < opt_data.length) {
				index = opt_indices[i];
			}
			this._indexList[i] = index;
			this._dataMap[index] = opt_data[i];
		}
	}
}

/**
* @private
*/
Series.prototype._indexList = null;

/**
* @private
*/
Series.prototype._dataMap = null;

Series.prototype.clone = function () {
	var index;
	var newSeries = new Series();
	for (var i=0;i<this._indexList.length;i++) {
		index = this._indexList[i];
		newSeries.setValue(index, this._dataMap[index]);
	}
	return newSeries;
};

/**
* Return the number of values in this series
* @return {Number}
*/
Series.prototype.count = function() {
	return this._indexList.length;
};

/**
* Return all indices of this series
* @return {Array.<*>}
*/
Series.prototype.index = function () {
	return this._indexList.slice(0);
};

/**
* Return all values of this series
* @param {*=} opt_index Optional index for the value, if no index provider, all the values will be returned 
* @return {Array.<*>}
*/
Series.prototype.value = function (opt_index) {
	if (opt_index !== undefined) {
		if (this._dataMap[opt_index] !== undefined) {
			return this._dataMap[opt_index];
		} else {
			return NaN;
		}
	} else {
		var output = [];
		for (var i=0;i<this._indexList.length;i++) {
			output.push(this._dataMap[this._indexList[i]]);
		}
		return output;		
	}
};

/**
* Replace the current indies with the new list
* @param {Array.<*>}
*/
Series.prototype.setIndex = function (indexArray) {
	var i, oldIndex, tempValue;
	if (Array.isArray(indexArray)) {
		for (i = 0; i<indexArray.length; i++) {
			oldIndex = this._indexList[i];
			tempValue = this._dataMap[oldIndex];
			this._indexList[i] = indexArray[i];
			this._dataMap[indexArray[i]] = tempValue;
			delete this._dataMap[oldIndex];
		}
	}
};

/**
* Set value at the specified index
*/
Series.prototype.setValue = function (index, value) {
	if (this._dataMap[index] === undefined) {
		this._indexList.push(value);
	}
	this._dataMap[index] = value;
};

/**
* Process operator using the specified processor function
* @param {Series|*} operand Operand can be a scalar value or another series
* @param {Function(*,*)} processor Processor function. The function takes 2 parameter and return the processed value
* @example
* series.processOperator(10, function (a, b) {
*     return a + b;
* });
*/
Series.prototype.processOperator = function (operand, processor) {
	var result, value, indices, i;
	var output = this.clone();
	if (typeof operand === 'object' && operand.constructor.name === 'Series') {
		indices = operand.index();
		for (i=0; i<indices.length; i++) {
			value = this.value(indices[i]);
			result = processor(value, operand.value(indices[i]));
			output.setValue(indices[i], result);
		}
	} else
	if (typeof operand === 'number') {
		indices = this.index();
		for (i=0; i<indices.length; i++) {
			value = this.value(indices[i]);
			result = processor(value, operand);
			output.setValue(indices[i], result);
		}
	}
	return output;	
};

binary.extends(Series);

module.exports = Series;