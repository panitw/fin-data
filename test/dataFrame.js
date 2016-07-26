var assert = require('chai').assert;

var fin = require('../index');

describe('DataFrame', function () {

	it('Constructor: object map', function () {
		var df = new fin.DataFrame({
			'c1': [0, 1, 2, 3],
			'c2': [4, 5, 6, 7]
		});

		assert.deepEqual([0, 1, 2, 3], df.index());
		assert.deepEqual(['c1', 'c2'], df.column());
		assert.deepEqual(4, df.count());
		
		assert.equal(0, df.value('c1', 0));
		assert.equal(4, df.value('c2', 0));

		assert.deepEqual({c1: 0, c2: 4}, df.row(0));
	});

	it('Constructor: array of array', function () {
		var df = new fin.DataFrame([
			[0, 1, 2, 3],
			[4, 5, 6, 7]
		], ['c1', 'c2']);

		assert.deepEqual([0, 1, 2, 3], df.index());
		assert.deepEqual(['c1', 'c2'], df.column());
		assert.deepEqual(4, df.count());
	});

	it('Constructor: array of series', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2, 3]),
			new fin.Series([4, 5, 6, 7])
		], ['c1', 'c2']);

		assert.deepEqual([0, 1, 2, 3], df.index());
		assert.deepEqual(['c1', 'c2'], df.column());
		assert.deepEqual(4, df.count());
	});

	it('Constructor: array of series with different indices', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2, 3], ['A', 'B', 'C', 'D']),
			new fin.Series([4, 5, 6, 7], ['A', 'B', 'E', 'F'])
		], ['c1', 'c2']);

		assert.deepEqual(['c1', 'c2'], df.column());
		assert.deepEqual(['A', 'B', 'C', 'D', 'E', 'F'], df.index());
		assert.deepEqual(6, df.count());

		assert.equal(0, df.value('c1', 'A'));
		assert.equal(4, df.value('c2', 'A'));
		assert.equal(true, isNaN(df.value('c2', 'D')));

		assert.deepEqual({c1: 0, c2: 4}, df.row('A'));
		assert.deepEqual({c1: NaN, c2: 6}, df.row('E'));
		
	});

	it('Support date alignment of multiple series', function () {
		var df = new fin.DataFrame([
			new fin.Series([1, 2, 3, 4, 5], [
				new Date('2016-01-01'),
				new Date('2016-01-02'),
				new Date('2016-01-03'),
				new Date('2016-01-04'),
				new Date('2016-01-05')
			]),
			new fin.Series([6, 7, 8, 9, 10], [
				new Date('2016-01-01'),
				new Date('2016-01-02'),
				new Date('2016-01-03'),
				new Date('2016-01-05'),
				new Date('2016-01-06')
			])
		], ['c1', 'c2']);
	
		assert.equal(6, df.count());

		var indices = df.index();
		assert.equal(1, df.value('c1', indices[0]));
		assert.equal(5, df.value('c1', indices[4]));
		assert.equal(true, isNaN(df.value('c1', indices[5])));
		assert.equal(6, df.value('c2', indices[0]));
		assert.equal(true, isNaN(df.value('c2', indices[3])));
		assert.equal(9, df.value('c2', indices[4]));
		assert.equal(10, df.value('c2', indices[5]));
	});

});