var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var es = require('./services/elasticsearch');

var app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(require('./middleware/auth'));
app.use(require('./controllers'));
app.use(express.static('public'));
app.all('/*', function(req, res) {
	res.sendfile('public/index.html');
});

console.log("Setting up elasticsearch indices");
es.indices.setup(function(err, res) {
	if (err) console.error("Error while setting up indices", err.stack);
	else console.log("Successfully set up indices");
});

var port = process.env.PORT || 1234;
app.listen(port);

console.log('Jeremy listens on port ' + port);