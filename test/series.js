var assert = require('chai').assert;

var fin = require('../index');

describe('Series', function () {

	it('Constructor without data', function () {
		var series = new fin.Series();
		assert.equal(0, series.count());
	});

	it('Constructor with initial data', function () {
		var series = new fin.Series([1,2,3,4,5]);
		assert.equal(5, series.count());
		assert.equal(1, series.value(0));
		assert.equal(5, series.value(4));
		assert.equal(true, isNaN(series.value(5)));

		assert.deepEqual([0,1,2,3,4], series.index());
	});

	it('Constructor with initial data and indices', function () {
		var indices = ['A','B','C','D','E'];
		var series = new fin.Series([1,2,3,4,5], indices);

		assert.equal(5, series.count());
		assert.equal(1, series.value('A'));
		assert.equal(3, series.value('C'));
		assert.equal(true, isNaN(series.value('X')));

		assert.deepEqual(indices, series.index());
	});


	it('Constructor with initial data and indices list longer than data', function () {
		try {
			var series = new fin.Series([1,2,3], ['A','B','C','D','E']);
		}
		catch (ex) {
			assert.equal('object', typeof ex);
		}
	});

	it('Can handle label as date object', function () {
		var series = new fin.Series([1,2,3], [
			new Date('2016-01-01'),
			new Date('2016-01-02'),
			new Date('2016-01-03')
		]);

		assert.equal(1, series.value(new Date('2016-01-01')));
		assert.equal(2, series.value(new Date('2016-01-02')));
		assert.equal(3, series.value(new Date('2016-01-03')));
	});

	it('method setIndex()', function () {
		var series = new fin.Series([1,2,3], ['A','B','C']);
		series.setIndex(['D','E','F']);

		assert.equal(true, isNaN(series.value('A')));
		assert.equal(1, series.value('D'));
		assert.equal(2, series.value('E'));
		assert.equal(3, series.value('F'));
	});

	it('method setValue()', function () {
		var series = new fin.Series([1,2,3], ['A','B','C']);
		series.setValue('A', 4);
		series.setValue('D', 5);

		assert.equal(4, series.value('A'));
		assert.equal(5, series.value('D'));
		assert.equal(4, series.count());
		assert.deepEqual(['A','B','C','D'], series.index());
	});

	it('method add() with static value', function () {
		var series1 = new fin.Series([1,2,3]);
		var output = series1.add(10);

		assert.equal(11, output.value(0));
		assert.equal(12, output.value(1));
		assert.equal(13, output.value(2));
	});

	it('method add() with another series', function () {
		var series1 = new fin.Series([1,2,3]);
		var series2 = new fin.Series([10,20,30]);
		var output = series1.add(series2);

		assert.equal(11, output.value(0));
		assert.equal(22, output.value(1));
		assert.equal(33, output.value(2));
	});

	it('method add() with another series, not equal indices', function () {
		var series1 = new fin.Series([1,2,3], ['A','B','C']);
		var series2 = new fin.Series([10,20,30], ['A','B','D']);
		var output = series1.add(series2);

		assert.equal(11, output.value('A'));
		assert.equal(22, output.value('B'));
		assert.equal(3, output.value('C'));
		assert.equal(true, isNaN(output.value('D')));
	});

	it('method sub()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([5,20,40]);
		var output = series1.sub(series2);

		assert.equal(5, output.value(0));
		assert.equal(0, output.value(1));
		assert.equal(-10, output.value(2));
	});

	it('method mul()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([5,0,0.5]);
		var output = series1.mul(series2);

		assert.equal(50, output.value(0));
		assert.equal(0, output.value(1));
		assert.equal(15, output.value(2));
	});

	it('method div()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([5,0,0.5]);
		var output = series1.div(series2);

		assert.equal(2, output.value(0));
		assert.equal(true, isNaN(output.value(1)));
		assert.equal(60, output.value(2));
	});

	it('method eq()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([10,0,30]);
		var output = series1.eq(series2);

		assert.equal(true, output.value(0));
		assert.equal(false, isNaN(output.value(1)));
		assert.equal(true, output.value(2));
	});

	it('method lt()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([20,20,20]);
		var output = series1.lt(series2);

		assert.equal(true, output.value(0));
		assert.equal(false, output.value(1));
		assert.equal(false, output.value(2));
	});

	it('method lte()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([20,20,20]);
		var output = series1.lte(series2);

		assert.equal(true, output.value(0));
		assert.equal(true, output.value(1));
		assert.equal(false, output.value(2));
	});

	it('method gt()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([20,20,20]);
		var output = series1.gt(series2);

		assert.equal(false, output.value(0));
		assert.equal(false, output.value(1));
		assert.equal(true, output.value(2));
	});

	it('method gte()', function () {
		var series1 = new fin.Series([10,20,30]);
		var series2 = new fin.Series([20,20,20]);
		var output = series1.gte(series2);

		assert.equal(false, output.value(0));
		assert.equal(true, output.value(1));
		assert.equal(true, output.value(2));
	});

});