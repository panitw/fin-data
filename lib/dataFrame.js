var Series = require('./series');
var _ = require('lodash');

function DataFrame(opt_data, opt_columns) {
	var series;

	this._columns = {};
	this._columnList = [];

	if (Array.isArray(opt_data)) {
		for (var i=0; i<opt_data.length; i++) {
			var columnName = this._ensureColumnName(i, opt_columns);
			series = this._ensureSeries(opt_data[i]);
			this._columns[columnName] = series;
			this._columnList.push(columnName);
		}
	} else
	if (typeof opt_data === 'object') {
		for (var key in opt_data) {
			if (opt_data.hasOwnProperty(key)) {
				series = this._ensureSeries(opt_data[key]);
				this._columns[key] = series;
				this._columnList.push(key);
			}
		}
	}

	this.reindex();

}

/** @private */
DataFrame.prototype._columns = null;

/** @private */
DataFrame.prototype._columnList = null;

/** @private */
DataFrame.prototype._indexList = null;

/**
 * Add new column to this data frame and re-index after adding
 * @param {Array.<*>|Series} series Data of the column in the array format or Series object
 * @param {string=} opt_columnName Optional column name, running number will be used if not specified
 */
DataFrame.prototype.addColumn = function (series, opt_columnName) {
	//Make sure that the series is a proper series object
	series = this._ensureSeries(series);

	//If there's no name specified, generate column name using running number
	if (opt_columnName === undefined) {
		opt_columnName = this._columnList.length;
		while (this._columns[opt_columnName] !== undefined) {
			opt_columnName++;
		}
	} else {
		//If the name is specified and duplicate with any existing name, throw error
		if (this._columns[opt_columnName] !== undefined) {
			throw new Error('Duplicate column name "'+opt_columnName+'"');
		}
	}

	//Insert column
	this._columnList.push(opt_columnName);
	this._columns[opt_columnName] = series;

	this.reindex();
};

/**
 * Get data value at the specified column and index
 * @param {string} column Column name
 * @param {*} index Index object
 */
DataFrame.prototype.value = function (column, index) {
	if (this._columns[column]) {
		return this._columns[column].value(index);
	} else {
		return NaN;
	}
};

/**
 * Set value to the specified column at the specified index
 * @param {string} column Column name
 * @param {*} index Index object
 * @param {*} value Data value
 */
DataFrame.prototype.setValue = function (column, index, value) {
	if (!this._columns[column]) {
		var newColumn = new Series();
		this._columns[column] = newColumn;
		this._columnList.push(column);
	}
	this._columns[column].setValue(index, value);
};

/**
 * Get row object at index
 * @param {*} index Index label of the row
 */
DataFrame.prototype.row = function (index) {
	var columnName;
	var output = {};
	for (var i=0; i<this._columnList.length; i++) {
		columnName = this._columnList[i];
		output[columnName] = this._columns[columnName].value(index);
	}
	return output;
};

/**
 * Get list of all column names
 */
DataFrame.prototype.column = function () {
	return this._columnList.slice(0);
};

/**
 * Get list of all indices
 */
DataFrame.prototype.index = function () {
	return this._indexList.slice(0);
};

/**
 * Return total number of rows
 */
DataFrame.prototype.count = function () {
	return this._indexList.length;
};

/**
 * Re-generate the index list by remove duplicates and sort the indices ascending
 */
DataFrame.prototype.reindex = function () {
	var indicesList = [];
	var uniqueMap = {};
	var indices;
	for (var column in this._columns) {
		indices = this._columns[column].index();
		for (var i=0; i<indices.length; i++) {
			if (uniqueMap[indices[i]] === undefined) {
				indicesList.push(indices[i]);
				uniqueMap[indices[i]] = 0;
			}
		}
	}
	this._indexList = _.sortBy(indicesList);
};

/**
 * @private
 */
DataFrame.prototype._ensureSeries = function (series) {
	if (Array.isArray(series)) {
		return new Series(series);
	} else
	if (typeof series === 'object' && series.constructor.name === 'Series') {
		return series;
	}

	throw new Error('Invalid Series Data');
};

/**
 * @private
 */
DataFrame.prototype._ensureColumnName = function(index, opt_columns) {
	if (opt_columns !== undefined) {
		if (Array.isArray(opt_columns)) {
			if (index < opt_columns.length) {
				return opt_columns[index];
			} else {
				throw new Error('Column name list length does not equal to data length');
			}
		} else {
			throw new Error('Invalid column name list');
		}
	} else {
		return index;
	}
};

module.exports = DataFrame;