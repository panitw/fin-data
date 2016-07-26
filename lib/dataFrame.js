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

DataFrame.prototype._columns = null;

DataFrame.prototype._columnList = null;

DataFrame.prototype._indexList = null;

DataFrame.prototype.value = function (column, index) {
	if (this._columns[column]) {
		return this._columns[column].value(index);
	} else {
		return NaN;
	}
};

DataFrame.prototype.row = function (index) {
	var columnName;
	var output = {};
	for (var i=0; i<this._columnList.length; i++) {
		columnName = this._columnList[i];
		output[columnName] = this._columns[columnName].value(index);
	}
	return output;
};

DataFrame.prototype.column = function () {
	return this._columnList.slice(0);
};

DataFrame.prototype.index = function () {
	return this._indexList.slice(0);
};

DataFrame.prototype.count = function () {
	return this._indexList.length;
};

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

DataFrame.prototype._ensureSeries = function (series) {
	if (Array.isArray(series)) {
		return new Series(series);
	} else
	if (typeof series === 'object' && series.constructor.name === 'Series') {
		return series;
	}

	throw new Error('Invalid Series Data');
};

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