var Series = require('./series');
var _ = require('lodash');

var drawdown = require('./dataFrame/drawdown');

/**
* DataFrame is a collection of data Series that the indices of all the series
* are aligned. The value series that doesn't have the index is represented as NaN 
* @constructor
* @param {Array.<*>=} opt_data Optional initial array of data
* @param {Array.<string>=} opt_columns Optional array of column names
*/
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

/** @private */
DataFrame.prototype._indexMap = null;

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
 * Get data value at the specified column and index. Index oject is optional.
 * If no index object specified, this method returns array of all values of the column
 * @param {string} column Column name
 * @param {*=} opt_index Optional index object
 * @return {*|Array.<*>} Returns array of values if index is not specified, return value at the index if index is specified 
 */
DataFrame.prototype.value = function (column, opt_index) {
	if (this._columns[column]) {
		if (opt_index !== undefined) {
			return this._columns[column].value(opt_index);
		} else {
			var output = [];
			var i, value;
			for (i=0; i<this._indexList.length; i++) {
				value = this._columns[column].value(this._indexList[i]);
				output.push(value);
			}
			return output;
		}
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
	if (this._indexMap[index] === undefined) {
		this._indexMap[index] = true;
		this._indexList.push(index);
	}
};

/** 
 * Set value to the specified column at the specified index location
 * @param {string} column Column name
 * @param {number} loc Index location
 * @param {*} value Data value
 */
DataFrame.prototype.setValueAtLoc = function (column, loc, value) {
	var indexAtLoc = this._indexList[loc];
	if (indexAtLoc !== undefined) {
		this.setValue(column, indexAtLoc, value);
	}
}

/**
 * Get row object at index
 * @param {*} index Index label of the row
 * @return {object} Returns object that represents a row. If there's no such index, return null
 */
DataFrame.prototype.row = function (index) {
	var columnName;
	var output = {};
	var value;
	var allNaN = true;
	for (var i=0; i<this._columnList.length; i++) {
		columnName = this._columnList[i];
		value = this._columns[columnName].value(index);
		output[columnName] = value;
		if (!isNaN(value)) {
			allNaN = false;
		}
	}
	if (!allNaN) {
		return output;
	} else {
		return null;
	}
};

/**
 * Set value of the row at the specified index
 * @param <*> index Index
 * @param <Object> rowData Object that represents the value of the row
 * @example
 * dataFrame.setRow(new Date('2016-01-01'), {
 *   col1: 10,
 *   col2: 20,
 *   col3: 30
 * });
 */
DataFrame.prototype.setRow = function (index, rowData) {
	for (var prop in rowData) {
		if (rowData.hasOwnProperty(prop)) {
			this.setValue(prop, index, rowData[prop]);
		}
	}
};

/**
 * Get list of all column names
 * @return {Array.<string>} Array of column names
 */
DataFrame.prototype.column = function () {
	return this._columnList.slice(0);
};

/**
 * Get list of all indices
 * @return {Array.<*>} Array of indices
 */
DataFrame.prototype.index = function () {
	return this._indexList.slice(0);
};

/**
 * Return the index value at the specified index location
 * @param <number> loc Location of the index
 * @returns {*} index
 */
DataFrame.prototype.indexAtLoc = function (loc) {
	return this._indexList[loc];
}

/**
 * Return total number of rows
 * @return <number> Number of rows
 */
DataFrame.prototype.count = function () {
	return this._indexList.length;
};

/**
 * Create a new DataFrame that contains the rows filtered by
 * filterFunc
 * @param {Function(*)} filterFunc Filter function. The function takes row as a parameter
 * to perform filtering logic. The function should return a boolean 'true' if the row should be included.
 * @return {DataFrame} Return new DataFrame object
 * @example
 * var filteredData = dataFrame.filter(function (row) {
 *   return (row.buy_signal === true)
 * });
 */
DataFrame.prototype.filter = function (filterFunc) {
	var out = new DataFrame();
	var index, row, included;
	for (var i=0; i<this._indexList.length; i++) {
		index = this._indexList[i];
		row = this.row(index);
		included = filterFunc(row, index);
		if (included) {
			out.setRow(index, row);
		}
	}
	return out;
};

/**
 * Sort indices of this data frame object by the specified column and direction
 * @param {string} column Column name
 * @param {string=} opt_dir Direction of sorting, possible values are 'a' or 'd' for ascending and decending. Default value is 'a'
 */
DataFrame.prototype.sort = function (column, opt_dir) {
	if (!opt_dir) {
		opt_dir = 'a';
	}
	var valA, valB, result;
	this._indexList.sort(function (a, b) {
		valA = this.value(column, a);
		valB = this.value(column, b);
		if (_.gt(valA, valB)) {
			result = 1; 
		} else
		if (_.lt(valA, valB)) {
			result = -1; 
		} else {
			result = 0;
		}
		if (opt_dir === 'd') {
			result *= -1;
		}
		return result;
	}.bind(this));
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
				uniqueMap[indices[i]] = true;
			}
		}
	}
	this._indexList = _.sortBy(indicesList);
	this._indexMap = uniqueMap;
};

/**
* Create an array representation of this data frame
* @return {Array.<Object>}
*/
DataFrame.prototype.toArray = function () {
	var output = [];
	var count = this.count();
	var index = null;
	for (var i=0; i<count; i++) {
		index = this.indexAtLoc(i); 
		output.push(this.row(index));
	}
	return output;
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

//Extension
drawdown.extends(DataFrame);

module.exports = DataFrame;