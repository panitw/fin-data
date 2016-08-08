var Series = require('../series');

function DrawdownExtender(DataFrame) {

    function calculateDrawdown(data) {
        var result = [0];
        var value
        var max = data[0];
        for (var i=1; i<data.length; i++) {
            value = data[i];
            if (!isNaN(value)) {
                max = Math.max(max, value);
                result[i] = (value / max) - 1;
            } else {
                result[i] = NaN;
            }
        }
        return result;
    }

    /**
     * This function create a new series for drawdown
     * @param {string} ofColumn Name of the column to be calculated
     * @param {string} newColumnName A new column name of the new series
     */
    DataFrame.prototype.drawdown = function (ofColumn, newColumnName) {
        var values = this.value(ofColumn);
        var indices = this.index();
        var drawdown = calculateDrawdown(values);
        this.addColumn(new Series(drawdown, indices), newColumnName);
    };

    /**
     * Calculate maximum drawdown of the values at the specified column
     * @param {string} ofColumn Name of the column to be calculated
     * @return {number} Maximum Drawdown
     */
    DataFrame.prototype.maximumDrawdown = function (ofColumn) {
        var values = this.value(ofColumn);
        var drawdown = calculateDrawdown(values);
        var min = Number.MAX_VALUE;
        for (var i=0; i<drawdown.length; i++) {
            min = Math.min(min, drawdown[i]);
        }
        return min;
    };

};

module.exports = {
	extends : DrawdownExtender
};