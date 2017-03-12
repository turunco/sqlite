const DB_OK = 0;
const DB_ERROR_COLUMN = -1;
const DB_ERROR_VALUE = -2;
const DB_ERROR_TYPE = -3;
const DB_ERROR_ORDER = -4;

class DB {
    constructor(path = ':memory:') {
        this.path = path;

        let sql = require('sqlite3').verbose();
        this.db = new sql.Database(path);

        this.table_name = 'tablename';
    }

    /**
     * Open/Create Database
     * @param {string} table_name : table name
     * @param {string[]} columns : columns
     *
     * @returns DB_OK : success
     *  DB_ERROR_COLUMN : columns is 0
     *
     * @example
     * let columns = [
     *  'id INTEGER PRIMARY KEY',
     *  'name TEXT',
     *  'price INTEGER'
     * ];
     * conn.open('item', columns);
     */
    open(table_name = 'tablename', columns = []) {
        let columns_length = columns.length;
        if (0 === columns_length) {
            return DB_ERROR_COLUMN;
        }

        this.table_name = table_name;

        // CREATE TABLE : SQL Command
        // IF NOT EXISTS : Option
        //
        // Data format
        // 	NULL : null
        // 	INTEGER : signed integer 1, 2, 3, 4, 6, 8 byte
        //	REAL : float 8 byte
        // 	TEXT : UTF-8, UTF-16-BE or UTF-16-LE
        // 	BLOB : Binary Large OBject
        let cmd = 'CREATE TABLE IF NOT EXISTS ' + this.table_name + '(';
        columns.forEach((column, index) => {
            cmd += column;
            if (index < (columns_length - 1)) {
                cmd += ', ';
            }
        });
        cmd += ')';
        console.log(cmd);

        this.db.serialize(() => {
            this.db.run(cmd);
        });

        return DB_OK;
    }

    /**
     * Close Database
     */
    close() {
        if (this.db !== null) {
            this.db.close();
            this.db = null;
        }

        return DB_OK;
    }

    /**
     * Get row count
     * @param {DB::CountCallback} callback : return count
     *
     * @returns DB_OK : success
     *
     * @example
     * conn.count((count) => {
     *     console.log('[count]', count);
     * })
     */
    count(callback) {
        let cmd = 'SELECT count(*) FROM ' + this.table_name;
        let count = 0;
        this.db.serialize(() => {
            this.db.get(cmd, (err, res) => {
                count = res['count(*)'];
                callback(count);
            });
        });

        return DB_OK;
    }

    /**
     * Insert entry
     * @param {string[]} columns : colum names
     * @param {string[]} values : values
     *
     * @returns DB_OK : success
     * DB_ERROR_COLUMN : column error
     * DB_ERROR_VALUE : value error
     *
     * @example
     * let insert_columns = ['name', 'price'];
     * let insert_datas = [
     *     ['pen', 100],
     *     ['eraser', 50],
     *     ['measure', 400],
     *     ['pen4', 800]
     * ];
     * conn.insert(insert_columns, insert_datas);
     */
    insert(columns = [], values = []) {
        let columns_length = columns.length;
        if (0 === columns_length) {
            return DB_ERROR_COLUMN;
        }
        if (0 === values.length) {
            return DB_ERROR_VALUE;
        }
        let values_length = values[0].length;

        let cmd = 'INSERT INTO ' + this.table_name + '(';
        columns.forEach((column, index) => {
            cmd += column;
            if (index < (columns_length - 1)) {
                cmd += ', ';
            }
        });
        cmd += ') VALUES(';
        for (var i = 0; i < values_length; i++) {
            cmd += '?';
            if (i < (values_length - 1)) {
                cmd += ', ';
            }
        }
        cmd += ')';

        console.log(cmd);
        this.db.serialize(() => {
            let stmt = this.db.prepare(cmd);
            values.forEach((value) => {
                console.log(value);
                stmt.run(value);
            });
            stmt.finalize();
        });

        return DB_OK;
    }

    /**
     * Update entry
     * @param {string} column
     * @param {string|value} value
     * @param {string} condition
     *
     * @returns DB_OK : success
     * DB_ERROR_TYPE : type error
     *
     * @example
     * conn.update('name', 'hogeeeee', 'id=1');
     */
    update(column, value, condition) {
        if (typeof(column) !== 'string' || typeof(condition) !== 'string') {
            return DB_ERROR_TYPE;
        }

        let cmd = 'UPDATE ' + this.table_name + ' SET ' + column + '=';
        if (typeof(value) === 'string') {
            cmd += '\'' + value + '\'';
        } else {
            cmd += value;
        }
        cmd += ' WHERE ' + condition;
        console.log(cmd);
        this.db.serialize(() => {
            this.db.run(cmd);
        });

        return DB_OK;
    }

    /**
     * Update entry
     * @param {string} condition
     *
     * @returns DB_OK : success
     * DB_ERROR_TYPE : type error
     *
     * @example
     * conn.delete('id=3');
     */
    delete(condition) {
        if (typeof(condition) !== 'string') {
            return DB_ERROR_TYPE;
        }

        let cmd = 'DELETE FROM ' + this.table_name + ' WHERE ' + condition;
        console.log(cmd);
        this.db.serialize(() => {
            this.db.run(cmd);
        });

        return DB_OK;
    }

    /**
     * Search entries
     *
     * @param {string[]} columns
     * @param {OrdersOjbect[]} orders
     * @param {string} condition
     * @param {SearchCallback} callback
     *
     * @example
     * conn.search(['*'], [{ column: 'price', order: 'asc' }], null, (err, rows) => {
     *     console.log('[err]', err);
     *     console.log('[rows]', rows);
     * });
     */
    search(columns, orders, condition, callback) {
        if (Object.prototype.toString.call(columns) !== '[object Array]') {
            return DB_ERROR_COLUMN;
        }
        if (Object.prototype.toString.call(orders) !== '[object Array]') {
            return DB_ERROR_ORDER;
        }
        let columns_length = columns.length;
        if (0 === columns_length) {
            return DB_ERROR_COLUMN;
        }

        let cmd = 'SELECT ';
        columns.forEach((column, index) => {
            cmd += columns;
            if (index < (columns_length - 1)) {
                cmd += ', ';
            }
        });
        cmd += ' FROM ' + this.table_name;

        let orders_length = orders.length;
        if (0 < orders_length) {
            cmd += ' ORDER BY ';
            orders.forEach((order, index) => {
                cmd += order.column + ' ' + order.order;
                if (index < (orders_length - 1)) {
                    cmd += ', ';
                }
            });
        }

        if (typeof(condition) === 'string') {
            cmd += ' WHERE ' + condition;
        }

        console.log(cmd);
        this.db.serialize(() => {
            this.db.all(cmd, callback);
        });

        return DB_OK;
    }

    /**
     * print all entries
     */
    printAll() {
        this.search(['*'], [], null, (err, rows) => {
            console.log('[all]', rows);
        });
    }
}


module.exports.DB = DB;