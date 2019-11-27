var express = require('express');
var profileController = express.Router();
var bodyParser = require('body-parser');

var connectionDB = require('../utility/connectionDB.js');
var userDB = require('../utility/userDB.js');
var userConnectionDB = require('../utility/userConnectionDB.js');
var UserProfileModel = require('../models/userProfile.js');
var userConnection = require('../models/userConnection.js');

var reqID;
var rsvp;
var userCoded;
var userProfile// keeps a track of user interaction during an active session
var user;//for displaying header according to the session
var userConnectionList;// stores userConnection objects
var reqIdList;//keeps a track of connectionIDs requested
var view;// for displaying header according to the session

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// this is activated when user clicks on login/signup
profileController.get('/savedConnections', function(req,res){
  view = "user";
  reqID = req.query.connectionID;
  rsvp =  req.query.rsvp;
  deleteConnectionID = req.query.deleteConnectionID;
  if(req.session.theUser){

    if(reqID != null){//this is used to solve issues with requests anytime the session is active but there is no query string!

      //Data from user interaction
      connectionObject = connectionDB.getConnection(reqID)[0]
      if (reqIdList.includes(reqID) === false){
        reqIdList.push(reqID);
        userProfile.addConnection(connectionObject, rsvp);
      }
      else{
        userProfile.updateConnection(connectionObject, rsvp);
      }
    }

    if(deleteConnectionID != null){
      var indexReqId = reqIdList.indexOf(deleteConnectionID);
      reqIdList.splice(indexReqId,1);
      userProfile.removeConnection(deleteConnectionID);
    }

    req.session.userConnection = userProfile.getConnections();

    user = req.session.theUser;
    var userConnectionData = req.session.userConnection;


    res.render('savedConnections',{user:user, userConnectionData:userConnectionData, view:view});

  }
  else{

    userConnectionList = []; // stores user's connection objects
    reqIdList = [];//keeps a track of connectionIDs requested

    //Default data of users from users collection
    var userIndex = "u1"; //can be u1 or u2
    userDB.getUser(userIndex)
    .then(function(userInfo){
      req.session.theUser = userInfo[0];
      user = req.session.theUser;
    })
    .catch(function(err){
      console.error("err", err);
    });


    userConnectionDB.getUserProfile(userIndex)
    .then(function(userCoded){
      userCoded.forEach(function(data){
        reqIdList.push(data.connectionID);
        var userConn = connectionDB.getConnection(data.connectionID)[0];
        userConnectionList.push({connection: userConn, rsvp: data.rsvp});
      });

      userProfile = new UserProfileModel(req.session.theUser.userID, userConnectionList);
      req.session.userConnection = userProfile.getConnections();

      var userConnectionData = req.session.userConnection;

      res.render('savedConnections',{user:user, userConnectionData:userConnectionData, view:view});
    })
    .catch(function(err){
      console.error("err", err);
    });

  }

});


//this is for log out
profileController.get('/savedConnections/clearSession', function(req,res){
  req.session.destroy(function(err) {
    if (err) {
      console.log("error deleting session");
    }
    userConnectionDB.userConnectionList = [];
  });
  res.redirect('../index');
});

profileController.get('/newConnection',function(req,res){
  if (req.session.theUser){view ="user"; user = req.session.theUser;}
  else{view = "general";}
  res.render('newConnection',{view:view, user:user});
});

module.exports = profileController;
