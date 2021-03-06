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

	it('Support setting new value to exiting column', function () {
		var df = new fin.DataFrame([
			[0, 1, 2, 3],
			[4, 5, 6, 7]
		], ['c1', 'c2']);

		assert.equal(0, df.value('c1', 0));
		df.setValue('c1', 0, 100);
		assert.equal(100, df.value('c1', 0));
	});

	it('Support setting new value to new column', function () {
		var df = new fin.DataFrame([
			[0, 1, 2, 3],
			[4, 5, 6, 7]
		], ['c1', 'c2']);

		assert.equal(true, isNaN(df.value('c3', 0)));
		df.setValue('c3', 0, 100);
		assert.equal(100, df.value('c3', 0));
		assert.equal(true, isNaN(df.value('c3', 1)));
		assert.equal(true, isNaN(df.value('c3', 2)));
		assert.equal(true, isNaN(df.value('c3', 3)));
		assert.deepEqual([100, NaN, NaN, NaN], df.value('c3'));
		assert.equal(3, df.column().length);
	});

	it('Support setting new value at the specified location', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2, 3], ['A', 'B', 'C', 'D']),
			new fin.Series([4, 5, 6, 7], ['A', 'B', 'E', 'F'])
		], ['c1', 'c2']);

		df.setValueAtLoc('c1', 1, 100);
		assert.equal(100, df.value('c1', 'B'));		
	});

	it('Support setting new value at the new index', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2, 3], ['A', 'B', 'C', 'D']),
			new fin.Series([4, 5, 6, 7], ['A', 'B', 'E', 'F'])
		], ['c1', 'c2']);

		df.setValue('c1', 'G', 100);
		assert.equal(100, df.value('c1', 'G'));
		assert.deepEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'], df.index());
	});

	it('Returns null when getting row of an invalid index', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2, 3], ['A', 'B', 'C', 'D']),
			new fin.Series([4, 5, 6, 7], ['A', 'B', 'E', 'F'])
		], ['c1', 'c2']);

		assert.equal(null, df.row('G'));
	});

	it('Support getting index value at location', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2, 3], ['A', 'B', 'C', 'D']),
			new fin.Series([4, 5, 6, 7], ['A', 'B', 'E', 'F'])
		], ['c1', 'c2']);

		assert.equal('A', df.indexAtLoc(0));
		assert.equal('E', df.indexAtLoc(4));
		assert.equal('F', df.indexAtLoc(5));
	});

	it('Support getting location of the specified index', function () {
		var df = new fin.DataFrame([
			new fin.Series([0, 1, 2], [new Date('2000-01-01'), new Date('2000-01-02'), new Date('2000-01-03')]),
			new fin.Series([4, 5, 6], [new Date('2000-01-01'), new Date('2000-01-02'), new Date('2000-01-03')])
		], ['c1', 'c2']);

		assert.equal(0, df.locOfIndex(new Date('2000-01-01')));
		assert.equal(2, df.locOfIndex(new Date('2000-01-03')));
		assert.equal(-1, df.locOfIndex(new Date('2000-01-05')));
	});

	it('Support setting data by row', function () {
		var df = new fin.DataFrame();
		df.setRow(new Date('2016-01-01'), {c1: 1, c2: 5});
		df.setRow(new Date('2016-01-02'), {c1: 2, c2: 6});
		df.setRow(new Date('2016-01-03'), {c1: 3, c3: 7});
		df.setRow(new Date('2016-01-04'), {c1: 4, c2: 8});

		assert.deepEqual([1, 2, 3, 4], df.value('c1'));
		assert.deepEqual([5, 6, NaN, 8], df.value('c2'));
		assert.deepEqual([NaN, NaN, 7, NaN], df.value('c3'));

		df.setRow(new Date('2016-01-01'), {c1: 10, c2: 20, c3: 30});
		assert.deepEqual([10, 2, 3, 4], df.value('c1'));
	});

	it('Support filtering', function () {
		var df = new fin.DataFrame({
			'c1': [0, 1, 2, 3],
			'c2': [4, 5, 6, 7]
		});
		var filtered = df.filter(function (row) {
			return ((row.c2 % 2) === 0)
		});
		assert.equal(2, filtered.count());
		assert.equal(0, filtered.value('c1', 0));
		assert.equal(4, filtered.value('c2', 0));
		assert.equal(2, filtered.value('c1', 2));
		assert.equal(6, filtered.value('c2', 2));
	});

	it('Support filtering by index', function () {
		var df = new fin.DataFrame({
			'c1': [0, 1, 2, 3],
			'c2': [4, 5, 6, 7]
		});
		var filtered = df.filter(function (row, index) {
			return (index < 2);
		});
		assert.equal(2, filtered.count());
		assert.equal(0, filtered.value('c1', 0));
		assert.equal(4, filtered.value('c2', 0));
		assert.equal(1, filtered.value('c1', 1));
		assert.equal(5, filtered.value('c2', 1));
	});	

	it('Support sorting', function () {
		var df = new fin.DataFrame({
			'c1': [8, 1, 7, 9],
			'c2': [4, 2, 6, 7]
		});

		df.sort('c1');
		assert.deepEqual([1, 2, 0, 3], df.index());
		assert.deepEqual([1, 7, 8, 9], df.value('c1'));
		df.sort('c1', 'd');
		assert.deepEqual([9, 8, 7, 1], df.value('c1'));
		df.sort('c1', 'a');
		assert.deepEqual([1, 7, 8, 9], df.value('c1'));
	});

	it('Support array generation', function () {
		var df = new fin.DataFrame({
			'c1': [0, 1, 2, 3],
			'c2': [4, 5, 6, 7]
		});
		var array = df.toArray();
		assert.deepEqual([
			{__index: 0, c1: 0, c2: 4},
			{__index: 1, c1: 1, c2: 5},
			{__index: 2, c1: 2, c2: 6},
			{__index: 3, c1: 3, c2: 7}
		], array);
	});

	it('Drawdown', function () {
		var df = new fin.DataFrame({
			'c1': [1, 2, 4, 2, 1, 2, 3, 4]
		});

		df.drawdown('c1', 'ct_dd');
		assert.deepEqual([0, 0, 0, -0.5, -0.75, -0.5, -0.25, 0], df.value('ct_dd'));
		assert.equal(-0.75, df.maximumDrawdown('c1'));
		assert.deepEqual({startIndex: 2, endIndex: 7}, df.drawdownDuration('c1'));
	});

});