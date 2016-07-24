var assert = require('chai').assert;

var fin = require('../index');

describe('DataFrame', function () {

	it('Constructor: object map', function () {
		var df = new fin.DataFrame({
			'c1': [0, 1, 2, 3],
			'c2': [4, 5, 6, 7]
		});

		assert.deepEqual([0,1,2,3,4,5,6,7], df.index());

	});

});