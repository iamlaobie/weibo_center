var express = require('express');
var app = express.createServer();
app.use(express.bodyParser());


app.post('/weibo/report', function(req, res){
    console.log(req.body);
    res.send('OK');
});

app.listen(9090);
