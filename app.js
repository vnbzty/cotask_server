var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var users = require('./routes/users');


var app = express();
const server = app.listen(8001)
const io = require('socket.io')(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/api/users', users);

app.get('/', function(req, res, next) {
  res.send("get request");
});

var schedule_list = []
var schedule_point = 0
var list = []
var visit = []

var locks = require('locks');
var waiting = locks.createMutex();
var running = locks.createMutex();
const spawn = require("child_process").spawn;
const server_number = 0
var fs = require('fs')

running.lock(function(){})

function find(){
  for (var i = 0, len = list.length; i < len; i++) {
    item = list[i]
    console.log(item.mobile_number)
    console.log(visit[i])
    console.log(schedule_point)
    console.log(schedule_list[schedule_point])
    if (schedule_point < schedule_list.length && visit[i] == 0 && item.mobile_number == schedule_list[schedule_point]){
      visit[i] = 1
      schedule_point = schedule_point + 1;
      run(item);
      return;
    }
  }
  running.unlock()
}

function run(task){
  task.socket.emit('face detect', {'event': 'schedule', 'timestamp':process.uptime()*1000, 'server_number':server_number, 'mobile_number': task.mobile_number});
  var t1 = process.uptime() * 1000
  var pythonProcess = spawn('python',["wait.py", task.image_name]);
  pythonProcess.stdout.on('data', (data) => {
    console.log(data.toString());
    task.socket.emit('face detect', {'event': 'finish', 'timestamp':0, 'server_number':server_number, 'mobile_number': task.mobile_number});
    var t2 = process.uptime() * 1000
    console.log(t2 - t1)
    console.log('send result');
    console.log('running unlock')
    running.unlock();
    if (running.tryLock()){
      console.log('running lock 2')
      find()
    }
  });
}

function add_task(task){
  list.push(task)
  visit.push(0)
  console.log('add task', task.image_name);
  if (schedule_point < schedule_list.length && task.mobile_number == schedule_list[schedule_point]){
    if (running.tryLock()){
      console.log('running lock 1')
      find()
    }
  }
}


io.on('connection',function(socket){
  console.log('connection');
  socket.on('disconnect', function(){
    console.log('disconnect');
  });

  socket.on('upload', function(image){
    image.socket = socket
    socket.emit('face detect', {'event': 'upload', 'timestamp':process.uptime()*1000,'server_number':server_number, 'mobile_number': image.mobile_number});
    add_task(image)
  });

  socket.on('schedule', function(data){
    console.log(data)
    socket.emit('schedule', {'timestamp':process.uptime()*1000, 'server_number':server_number, 'mobile_number': data.mobile_number});
  });

  socket.on('offload', function(data){
    if (running.tryLock()){
      running.unlock()
    }
    else{
      running.unlock()
    }
    schedule_point = 0;
    list = []
    visit = []
    var obj = JSON.parse(fs.readFileSync(data.file_name, 'utf8'));
    schedule_list = obj['schedule'][server_number]
    console.log(schedule_list)
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
