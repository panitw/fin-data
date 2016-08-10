var moment = require('moment');

var days = moment('2016-12-31').diff('2015-01-01', 'days');

console.log(days + ' days');
console.log(Math.round(days / 365) + ' years');