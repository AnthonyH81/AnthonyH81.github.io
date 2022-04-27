module.exports.signupdata = NewUserData;
//module.exports.logindata = sendLogin;

var express = require('express');
var app = express();
const bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended:false});
app.set('view engine', 'ejs');
//const session = require('express-session');
/* MongoDB example (film title search) */
const mymongo = require('./mymongo.js');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://AuthUser2:BadPassword@cluster0.1wleh.mongodb.net/SocialMediaDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const session = require('express-session');
const MongoStore = require('connect-mongo');
const sess_uri = "mongodb+srv://AuthUser2:BadPassword@cluster0.1wleh.mongodb.net/SocialMediaDatabase?retryWrites=true&w=majority";



app.use(session({ secret: 'masonjar',
                  store: MongoStore.create({ mongoUrl: sess_uri }),
                  resave: false,
                  saveUninitialized: false,
                  cookie: { maxAge: 24*60*60*1000 }}))


app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    next();
    });


app.get('/mongo/:title', mymongo.search);
app.use('/', require('./mymongo2.js'));


app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    next();
    });



function makeHTMLPage(s)
    {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Anthony's Website</title>
</head>
<body>
${s}
</body>
</html>
`;
    }

app.get('/', function (req, res) {
   res.send('Hello World, from express');
});




function choose(list)
    {
    var i = Math.floor(Math.random() * list.length);
    return list[i];
    }

app.get('/rps/:choice', function (req, res) {
    var human = req.params.choice;
    var robot = choose(['rock', 'paper', 'scissors']);
    var output = `<p>You chose ${human}</p><p>I chose ${robot}</p>`;
    if (human == robot)
        output += '<p>It\'s a tie</p>';
    else if ((human == 'rock') && (robot == 'scissors'))
        output += '<p>You win!</p>';
    else if ((human == 'paper') && (robot == 'rock'))
        output += '<p>You win!</p>';
    else if ((human == 'scissors') && (robot == 'paper'))
        output += '<p>You win!</p>';
    else
        output += '<p>I win!</p>';
    output += '<p><a href="/rps.html">Play again?</a></p>';
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage(output));
});





var blogposts = [ ];
var blogDates = [ ];
var blogTimes = [ ];

app.get('/blog', function (req,res) {
    var output = '<link href="BlogCSS.css" rel="stylesheet"><h1>Public Thoughts</h1>\n';
    for (i=blogposts.length - 1; i >= 0; i--)
        {
        output += `<div><h2>${blogposts[i].title}</h2><p1>posted by <a href="#${blogposts[i].author.replace(/\s+/g, '-')}" style= "color blue"> ${blogposts[i].author}</a> on ${blogDates[i]} at ${blogTimes[i]}</p1><p>Category: ${blogposts[i].type}</p><p>${blogposts[i].body}</p></div>\n`;
        }
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage(output));
});



var activeSocialUser;
var sendLogin;
var sendNewUser;

function NewUserData() {
  return sendNewUser;
}

app.post('/Signup', urlencodedParser, function (req, res) {
    var newUser = { 'Email': req.body.Email.toLowerCase(), 'Password': req.body.Password, 'ScreenName': req.body.ScreenName,
     'Description': req.body.Description, 'Posts': [], 'Following': [], 'RecentPosts': ""};
    //sendNewUser = newUser;
    //mymongo.socialInsert;

    client.connect(err => {
        if (err) { throw err; }
        const collection = client.db("SocialMediaDatabase").collection("SocialMedia");
        // console.log("Object: " + myapp.signupdata);
        // var obj = myapp.signupdata;
        collection.insertOne(newUser, function (err,result) {
            if (err) { throw err; }
            console.log("done");
            res.redirect('/Login');
            client.close();
            });
        });

});

app.post('/Login', urlencodedParser, function (req, res) {
    client.connect(function (err) {
            if (err) { throw err; }
            const collection = client.db("SocialMediaDatabase").collection("SocialMedia");
            let query = { 'Email': req.body.Email.toLowerCase() };
            collection.findOne(query, function (err,result) {
                if (err) { throw err;  }
                if ((result) && (req.body.Password == result.Password)) {
                    req.session.user = result;
                    res.redirect('/Social');
                    }
                else {
                    console.log(result);
                    res.redirect('/LoginError');
                    }
                client.close();
                });
            });
});


app.post('/LoginError', urlencodedParser, function (req, res) {
  client.connect(function (err) {
          if (err) { throw err; }
          const collection = client.db("SocialMediaDatabase").collection("SocialMedia");
          let query = { 'Email': req.body.Email.toLowerCase() };
          collection.findOne(query, function (err,result) {
              if (err) { throw err; }
              if ((result) && (req.body.Password == result.Password)) {
                  req.session.user = result;
                  res.redirect('/Social');
                  }
              else {
                  console.log(result);
                  res.redirect('/LoginError');
                  }
              client.close();
              });
          });
});

app.get('/Social', function (req, res) {
//var feedList = [];
var feedOutput = `<link href="BlogCSS.css" rel="stylesheet"><h1>${req.session.user.ScreenName}'s Feed'</h1>\n`;
  if(req.session.user) {
    let s = JSON.stringify(req.session, null, 4);
    let output = `<p>Welcome, ${req.session.user.ScreenName}.</p><pre>${s}</pre>`;
      output += `<a href="/Logout">Log Out</a>`;
      res.send(makeHTMLPage(output));

    //   client.connect(function (err) {
    //           if (err) { throw err; }
    //           const collection = client.db("SocialMediaDatabase").collection("SocialMedia");
    //           let query = { 'ScreenName': req.session.user.ScreenName};
    //           collection.findOne(query, function (err,result) {
    //               if (err) { throw err;  }
    //
    //               for(feedi = 0; feedi < result.Following.length; feedi++) {
    //
    //                 feedOutput += FindPost(result.Following[feedi]);
    //
    //               }
    //               client.close();
    //               });
    //           });
    // output += `<a href="/Logout">Log Out</a>`;
    // res.send(makeHTMLPage(feedOutput));
  } else {
    res.redirect('/Login');
  }
});

function FindPost(nameOfPoster) {
  var out = "";
  client.connect(function (err) {
          if (err) { throw err; }
          const collection = client.db("SocialMediaDatabase").collection("SocialMedia");
          let query = { 'ScreenName': ("" + nameOfPoster) };
          collection.findOne(query, function (err,result) {
              if (err) { throw err;  }
              out += `<div><h2> <a href='/${result.ScreenName}' style="color: black">${result.ScreenName}</a>
              <p>${result.RecentPosts}</p>`;
            //  client.close();
              });
          });
          return out;
}

app.get('/Logout', function (req, res) {
  req.session.destroy(function (err) {
      if (err) { throw err; }
      res.redirect('/Login');
      });
});



var identity = 0;
var globalList = [];
var colorsList =
["#13a4a3",
"#3d1d7c",
"#f32473",
"#199b11",
"#d0845c",
"#a48c79",
"#a01b26",
"#7d59b2",
"#c9a171",
"#15d9dc",
"#f8bf47",
"#3ecb7d",
"#e6d753",
"#ee8390",
"#b70df3",
"#8ec45b"];

app.post('/AddTask', urlencodedParser, function (req, res) {
    var newTask = { 'TaskName': req.body.TaskName,'Description' : req.body.Description, 'url': req.body.url, 'id': identity, "color": colorsList[identity%colorsList.length], 'isCompleted': false };
    toDoList.push(newTask);
    globalList.push(newTask);
    identity++;
    res.redirect('/ToDoPage');
});


var toDoList = [];
//var toDoPage = "";
app.get('/ToDoPage', function (req,res) {
    var toDoPage = '<link href="BlogCSS.css" rel="stylesheet"><h1>To Do List</h1> <br>\n';
    toDoPage += `<h1> <a href='/CompletedTasks' style="color: black">Completed Tasks</a> </h1><br>`;
    for (i=toDoList.length - 1; i >= 0; i--)
        {
        toDoPage += `<div><h2 style="background-color: ${toDoList[i].color}"> <a href='/Task/${toDoList[i].id}' style="color: white">${toDoList[i].TaskName}</a>
        [<a href='/RemoveTask/${toDoList[i].id}' style="color: black">✔</a>]</h2></div>\n`;
        //toDoList[i].id = toDoList.indexOf(toDoList[i]);
        }

    toDoPage += `<form action="/AddTask" method="POST">

    <label for="TaskName">Task Name:</label> <br>
    <input id = "TaskName" type="text" name="TaskName" placeholder="Walk The Dog">
    <br>

    <label for="Description">Description:</label><br>
    <textarea id = "Description" name="Description" placeholder="Remember to walk the dog at 6 AM tomorrow.">
    </textarea>
    <br>

    <label for="url">Optional URL:</label><br>
    <input id = "url" type="text" name="url">
    <br>
    <input type="submit" value="Post">
    </form>`
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage(toDoPage));
});

 var completedArray = [];
app.get('/CompletedTasks', function (req, res) {
  var completedString = '<link href="BlogCSS.css" rel="stylesheet"><h1>Completed Tasks</h1>\n';
  completedString += `<h1> <a href='/ToDoPage' style="color: black">To Do Page</a> </h1><br>`;
  for (i=completedArray.length - 1; i >= 0; i--) {
    completedString += `<div><h2 style="background-color: ${completedArray[i].color}"> <a href='/Task/${completedArray[i].id}' style="color: white">${completedArray[i].TaskName}</a></h2></div>\n`;
    //completedArray[i].id = completedArray.indexOf(completedArray[i]);
  }
  res.set('Cache-Control','no-store');
  res.send(makeHTMLPage(completedString));
});


app.get('/Task/:id', function (req, res) {
  var task = req.params.id;

  var taskString = '<link href="BlogCSS.css" rel="stylesheet"><h1>Viewing Task</h1>\n';
  taskString += `<h1> <a href='/ToDoPage' style="color: black">To Do Page</a></h1><br>`;
  var index = -1;
  for(i = 0; i< globalList.length; i++) {
    if(globalList[i].id == task) {
      index = i;
    }
  }

  taskString += `<div><h2>${globalList[index].TaskName}</h2><p>Description: <br>${globalList[index].Description}</p>`

  if(typeof globalList[index].url !== 'undefined') {
    taskString += `<p>URL: <a href='${globalList[index].url}'>${globalList[index].url}</a></p>`;
  }

  if(globalList[index].isCompleted == false) {
    taskString += `<p>Mark As Completed: [<a href='/RemoveTask/${globalList[index].id}' style="color: black">✔</a>]</p>`;
  } else {
    taskString += `<p>This Task Has Been Completed</p>`;
  }

  taskString += `</div>\n`;
  res.set('Cache-Control','no-store');
  res.send(makeHTMLPage(taskString));
});


app.get('/RemoveTask/:id', function (req, res) {
  var taskID = req.params.id;
  var newArr = [];
  for(var i = 0; i < toDoList.length; i++) {
    if(toDoList[i].id == taskID) {
      toDoList[i].isCompleted = true;
      completedArray.push(toDoList[i]);
    } else {
      newArr.push(toDoList[i]);
    }
  }

  toDoList = newArr;
  //var removeString = '<link href="BlogCSS.css" rel="stylesheet"><h1>Removing Task</h1>\n';


  res.set('Cache-Control','no-store');
  res.redirect('/ToDoPage');
});




app.post('/blogpost', urlencodedParser, function (req, res) {
    var cc = Date.parse(Date());
    var ff = new Date(cc);

    var hour = ff.getHours();
    var half = "AM";

    if(hour > 11) {
      half = "PM";
    } else {
      half = "AM";
    }

    hour = "" + (hour%12);

    if (hour == "0") {
      hour = "12";
    }

    if(hour.length == 1) {
      hour = "0" + hour;
    }

    blogDates.push("" + (ff.getMonth() + 1) + "/" + ff.getDate() + "/" + ff.getFullYear());
    blogTimes.push("" + hour + ":" + ff.getMinutes() + " " + half);

    var newpost = { 'title': req.body.title,'author' : req.body.author, 'type': req.body.messagetype, 'body': req.body.message };
    blogposts.push(newpost);
    res.redirect('/blog');
});




app.post('/submitform', urlencodedParser, function (req, res) {
   var answer = makeHTMLPage(`<p>Hello, ${req.body.username}</p><p>Your message was:</p><pre>${req.body.message}</pre>`);
   res.send(answer);
});


function homepage(req, res) {
    res.set('Cache-Control','no-store');
    res.send(makeHTMLPage('<p>Hello World, from express</p>'));
    }
app.get('/', homepage);


var server = app.listen(8081, function () {});
