var Series = require('./series');
var _ = require('lodash');

function DataFrame(opt_data, opt_columns) {

	this._columns = {};
	this._columnList = [];

	if (Array.isArray(opt_data)) {
		for (var i=0; i<opt_data.length; i++) {
			var series = this._ensureSeries(opt_data[i]);
			var columnName = this._ensureColumnName(i, opt_columns);
			this._columns[columnName] = series;
			this._columnList.push(columnName);
		}
	} else
	if (typeof opt_data === 'object') {
		for (var key in opt_data) {
			if (opt_data.hasOwnProperty(key)) {
				var series = this._ensureSeries(opt_data[key]);
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

DataFrame.prototype.getColumns = function (columnList) {

};

DataFrame.prototype.head = function (count) {

};

DataFrame.prototype.tail = function (count) {

};

DataFrame.prototype.range = function (leftBorder, rightBorder) {

};

DataFrame.prototype.index = function () {
	return this._indexList.slice(0);
}

DataFrame.prototype.reindex = function () {
	var indicesList = [];
	for (var column in this._columns) {
		indicesList.push(this._columns[column].index());
	}
	var merged = _.union(indicesList);
	this._indexList = _.sortBy(merged);
}

DataFrame.prototype._ensureSeries = function (series) {
	if (Array.isArray(series)) {
		return new Series(series);
	} else
	if (typeof series === 'object' && series.constructor.name === 'Series') {
		return series;
	}

	throw new Error("Invalid Series Data");
};

DataFrame.prototype._ensureColumnName = function(index, opt_columns) {
	if (opt_columns !== undefined) {
		if (Array.isArray(opt_columns)) {
			if (index < opt_columns.length) {
				return opt_columns[index];
			} else {
				throw new Error("Column name list length does not equal to data length");
			}
		} else {
			throw new Error("Invalid column name list");
		}
	} else {
		return index;
	}
};

DataFrame.prototype._indexSorter = function(a, b) {
	if (typeof a === 'number' && typeof b === 'number') {

	} else
	if (typeof a === 'string' && typeof b === 'string') {

	} else
	if (typeof a === 'number' && typeof b === 'number') {

	}
};

module.exports = DataFrame;