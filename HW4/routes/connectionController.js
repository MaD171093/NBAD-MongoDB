var express = require('express');
var controller = express.Router();
var bodyParser = require('body-parser');
var reqID;
var connectionDB = require('../utility/connectionDB.js');
var userDB = require('../utility/userDB.js');
var view;// for displaying header according to the session
var user;//for displaying header according to the session

var urlencodedParser = bodyParser.urlencoded({ extended: false });

controller.post('/newConnection',urlencodedParser,function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}

  //   cid: '03_am_club',
  //   cn: 'Material logic Debates',
  //   ct: 'ACHIM MENGES CLUB',
  function ucfirst(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function idCreate(string){
    var num = Math.floor(Math.random() * 100) + 1; // returns a random integer from 1 to 100
	  var code = String(num)+"_";
    var words = string.toLowerCase().split(' ');
  	words.forEach(function(word){
    	code = code + word.charAt(0);
    });
    code = code + "_club";
    return code
  }

  var topic = req.body.topic;
  var name = req.body.name;
  var details = req.body.details;
  var location = req.body.location;
  var date = req.body.date;
  var time = req.body.time;

  var newConnectionObj= {
    connectionID: idCreate(topic),
    connectionName: ucfirst(name),
    connectionTopic: topic.toUpperCase() + " " + "CLUB",
    details: details,
    dateTime: [date,time],
    location: location,
    userID:req.session.theUser.userID
  }
  // console.log("newConnectionObj!!!!!!",newConnectionObj);
  connectionDB.addConnection(newConnectionObj).then(function(data){
    res.render('connections', {view:view, data: connectionDB.getConnections(), dataTopic: connectionDB.getTopicList(), user:user});
  })
  // res.render('connections', {view:view, data: connectionDB.getConnections(), dataTopic: connectionDB.getTopicList(), user:user});
});


controller.get('/connections',function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}
  res.render('connections', {view:view, data: connectionDB.getConnections(), dataTopic: connectionDB.getTopicList(), user:user});
});

//if the connectionID in the query string is vaild it displays the requested page.
//if no query string is passed i.e. if connectionID is undefined or when connectionID is invalid connections view is shown (list of all connections)
controller.get('/connection', function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}
  reqID = req.query.connectionID;
  if (reqID === undefined) {
    // console.log("query string is undefined");
    res.render('connections', {view:view, data: connectionDB.getConnections(), dataTopic: connectionDB.getTopicList(), user:user});
  }
  else if (connectionDB.validate(reqID) === true){
    // console.log("Valid!!!!");
    var hostID = connectionDB.getConnection(reqID)[0].userID;
    userDB.getUser(hostID)
    .then(function(userInfo){
      var name = userInfo[0].firstName +" "+userInfo[0].lastName;
      res.render('connection',{view:view, details:connectionDB.getConnection(reqID)[0], host:name, reqID:reqID, user:user});
    })

  }
  else {
    // console.log("query string is not valid");
    res.render('connections', {view:view, data: connectionDB.getConnections(), dataTopic: connectionDB.getTopicList(), user:user});
  }
});

// this is activated when user clicks on update button in savedConnections view
controller.post('/connection',function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}
  res.render('connection',{view:view, details:connectionDB.getConnection(reqID)[0], user:user});
});

module.exports = controller;
