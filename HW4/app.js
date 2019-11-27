var express = require('express');
var router = require('./routes/router.js');
var connectionRouter = require('./routes/connectionController.js');
var profileRouter = require('./routes/profileController.js');
var session = require('express-session');//so that req.session is available for all the routers

var app = express();

var PORT = 8080;

app.set('view engine', 'ejs');

app.use('/assets/stylesheets',express.static(__dirname + '/assets/stylesheets'));
app.use('/assets/images', express.static(__dirname + '/assets/images'));

app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));

app.use('/',router);
app.use('/',connectionRouter);
app.use('/',profileRouter)
app.use('/index',router);
app.use('/contact',router);
app.use('/connections',connectionRouter);
app.use('/connection',connectionRouter);
app.use('/about',router);
app.use('/newConnection',router);

app.listen(PORT, function(){
  // console.log("Listening on port", PORT);
});
