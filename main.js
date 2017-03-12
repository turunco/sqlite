// sqlite

var DB = require('./db.js').DB;
let conn = new DB(':memory:');
let columns = [
    'id INTEGER PRIMARY KEY',
    'name TEXT',
    'price INTEGER'
];
conn.open('item', columns);

let insert_columns = ['name', 'price'];
let insert_datas = [
    ['pen', 100],
    ['eraser', 50],
    ['measure', 400],
    ['pen4', 800]
];
conn.insert(insert_columns, insert_datas);
conn.update('name', 'hogeeeee', 'id=1');
conn.delete('id=3');

conn.search(['*'], [{ column: 'price', order: 'asc' }], null, (err, rows) => {
    console.log('[err]', err);
    console.log('[rows]', rows);
});
conn.count((count) => {
    console.log('[count]', count);
})
conn.printAll();
conn.close();