// MongoDB collections
var Connections = new Meteor.Collection('Cons');
var Messages = new Meteor.Collection('Messages');


// if we're on the server, run this code...
if (Meteor.isServer) {

  // code to run on server at startup
  Meteor.startup(function () {
  
    // bug in new version of Meteor. Must have this line.
    var Fiber = Npm.require('fibers');
    
    // check every 1.6 seconds if any users have closed
    // their browser. If so, remove that user from
    // the Connections collection, and also add a status
    // message to the Messages collection.
    setInterval(function() {
    
      // all server side write ops must run within a 
      // fiber function
      Fiber(function() { 
        var newDate = new Date();
        var cons = Connections.find();
        var newTime = newDate.getTime() - 1600;
        
        cons.forEach(function(con) {
        
          if ((new Date(con.D)).getTime() < newTime){
            // remove connection from database
            Connections.remove({_id:con._id});
            
            // add status message
            Messages.insert({
              M: '',
              U: con.U,
              D: newDate,
              S: 1 // '__ has left the room.'
            });
          }          
        }); 
                
      }).run(); 
    }, 1500);    
  });
}


// ...otherwise, if we're on the client, run this code
if (Meteor.isClient) {

  var randName, myName, myId;
  var startTime = new Date();

  // code to run on client at startup
  Meteor.startup(function () {

    // every 10 seconds, update time in top right
    setInterval(function() {
      $('#thetime').html(getTheDate());
    }, 10000);

    // create a random name for initial login
    randName = 'Anon_'+Math.floor(Math.random()*16777215).toString(16);
    myName = randName;
    
    // add new connection
    myId = Connections.insert({
      U: randName,
      D: startTime
    });
    
    // fill 'Username' input with the random username
    $('#uname').val(myName);
    
    // add status message
    Messages.insert({
      M: '',
      U: myName,
      D: startTime,
      S: 2 // '__ has joined the room.'
    });    
    
    // every 1.5 seconds, update 'D' attribute to current time
    // in order to prevent the server from booting the connection
    setInterval(function() {
      Connections.update({_id: myId},{D: new Date(), U: myName});
    },1500);
    
  });

  // array of connections
  Template.Connections.AllCons = function(){
    return Connections.find({}, {sort: {'U': 1}});
  };

  // array of chat messages with date >= now
  Template.Messages.AllMessages = function(){
    return Messages.find({D: {$gte: startTime}}, {sort: {'D': -1}});
  };
  
  // event listeners for elements within the 'Clickables' template
  Template.Clickables.events = {
  
    // clicking the 'Post' button
    'click #clickme': function() {
      var m = $('#newmessage').val();
      
      if (m != '') {
        $('#newmessage').val('');

        // add new message
        Messages.insert({
          M: m,
          U: myName,
          D: new Date()
        });
      }
    },
    
    // pressing enter key while in message box (submit message)
    'keypress #newmessage': function(e) {

      if (e.keyCode==13) { // 13 is the code for enter key
        var m = $('#newmessage').val();
        if (m != '') {

          $('#newmessage').val('');
          
          // add new message
          Messages.insert({
            M: m,
            U: myName,
            D: new Date()
          });
        }
      }
    },
    
    // click outside of the 'Username' input (change username)
    'blur #uname': function(e) {
    
      var temp = $('#uname').val()+'';
      temp = temp.replace(/\s\s+/g, ''); // take out spaces
      
      var oldName = myName;
      
      // if not same as before...
      if (temp != myName) {
        if (temp == '') {
          //myName = randName;
          $('#uname').val(randName);
          
          // if it's still the randomly assigned name, stop
          if (temp == randName) {
            myName = randName;
            return false;
          }
          
          temp = randName;
        }
        
        myName = temp;
        
        // add status message
        Messages.insert({
          M: '',
          U: oldName,
          O: myName,
          D: new Date(),
          S: 3 // '__ is now known as __.'
        });
        
        // update connection
        Connections.update({_id: myId},{D: new Date(), U: myName});            
      }    
    },
    
    // pressing enter key while in username box (change username)
    'keypress #uname': function(e) {

      if (e.keyCode==13) {
        $('#uname').blur(); // just run code in blur listener
      }
    }
  };
  
  // handlebars helper to return time, formatted
  Handlebars.registerHelper('getTime', function(a) {
    return getTheDate(a);
  });
  
  // handlebars helper to return the current time, formatted
  Handlebars.registerHelper('getCurTime', function(a) {
    return getTheDate();
  });

  // handlebars helper to determine if a string is a valid URL
  Handlebars.registerHelper('isUrl', function(a) {
  
    // could probably be done better with regex...
    if (a.indexOf('http://') != -1 || a.indexOf('https://') != -1) {
      return true;
    }
    return false;
  });

  // handlebars helper to determine if a string is a valid URL
  Handlebars.registerHelper('splitMessage', function(a) {
    return a.replace(/\n\n+/g, ' ').split(' ');
  });

  // handlebars helper to count the number of active connections
  Handlebars.registerHelper('numCons', function(a) {
    var temp = Connections.find().count();
    if (temp == 1) {
      return '1 person connected';
    }   
    return temp+' people connected';
  });

  // handlebars helper to determine if a message is a status message
  Handlebars.registerHelper('isStatus', function(a) {
    if (a.S) {
      return true;
    }
    return false;
  });

  // handlebars helper to return text from a status code (1, 2, or 3)
  Handlebars.registerHelper('getStatus', function(a) {
    if (a.S==1) {
      return 'has left the room.';
    } else if (a.S==2) {
      return 'has joined the room.';
    }   
    return 'is now known as '+a.O+'.'; // 3
  });

  // handlebars helper to determine if a username is the current user's
  Handlebars.registerHelper('isMe', function(a) {
    if (a==myName) {
      return true;
    }
    return false;    
  });
}


// array used in getTheDate()
var dayarray=new Array ('Sunday','Monday','Tuesday','Wednesday',
               'Thursday','Friday','Saturday')

// array used in getTheDate()
var montharray=new Array('January','February','March','April','May','June',
               'July','August','September','October','November','December')

// function that gets date/time in the format Monday 1/31 12:30pm
// pass a specific date or, by default, return current time
var getTheDate = function (a){
  var mydate=new Date()
  if (a)
  mydate=new Date(a)
	var year=mydate.getYear()
	if (year < 1000)
	year+=1900
	var day=mydate.getDay()
	var month=mydate.getMonth()
	var daym=mydate.getDate()
	if (daym<10)
	daym='0'+daym
	var hours=mydate.getHours()
	var minutes=mydate.getMinutes()
	var seconds=mydate.getSeconds()
	var dn=''
  var ampm = 'am'
	if (hours>=12)
	dn=''
	if (hours>12){
	hours=hours-12
	ampm = 'pm';
	}
	if (hours==0)
	hours=12
	if (minutes<=9)
	minutes='0'+minutes
	if (seconds<=9)
	seconds='0'+seconds
	var cdate = dayarray[day]+' '+(month+1)+'/'+daym+' '+hours+':'+minutes+ampm+'';
	return cdate;
}
