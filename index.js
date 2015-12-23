
var deps = {
    express : require('express'),
    mysql   : require('mysql')
};

var app = deps.express();

var pool = deps.mysql.createPool({
    connectionLimit : 10,
    host            : '127.0.0.1',
    user            : 'username',
    password        : 'password'
});

var dbQuery = function(sql, callback) {
    pool.getConnection(function(err, connection) {
        var released = false;
        var completeHandler = function() {
            if (!released) {
                released = true;
                connection.release();
            }
        };
        if (err) {
            return callback.apply(undefined, [err, undefined, completeHandler]);
        }
        connection.query(sql,function(err, rows) {
            callback.apply(undefined, [err, rows, completeHandler]);
        });
        // release connection automatically after 2 second
        setTimeout(completeHandler, 2000);
    });
};

var resEcho = function(obj) {
    var data;
    try {
        data = JSON.stringify(data);
        this.setHeader('Content-Type', 'application/json');
    } catch (e) {
        data = obj;
    }
    this.end(data);
};

app.use(function(req, res, next) {
    req.mysql = dbQuery.bind(this);
    res.echo = resEcho.bind(res);
    next();
});

app.get('/', function (req, res) {
    req.mysql('select * from trends', function(err, rows, complete) {
        res.echo(rows);
        complete();
    });
});

app.get('/users', function(req, res) {
    req.mysql('select * from users', function(err, rows, complete) {
        res.echo(rows);
        complete();
    });
});

var server = app.listen(process.env.PORT || 3000, function callback() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('app listening at http://%s:%s', host, port);
});

