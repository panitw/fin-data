var fin = require('./index');


var df = new fin.DataFrame({
    'c1': [0, 1, 2, 3],
    'c2': [4, 5, 6, 7]
});

console.log(df.index());