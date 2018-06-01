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

schedule_list = [2,1,3,0,4];
schedule_point = 0;
var list = [];
var locks = require('locks');
var waiting = locks.createMutex();
var running = locks.createMutex();

waiting.lock(function(){});

function find(){
  list.forEach(function(item, index, array){
    if (item.task_id == schedule_list[schedule_point]){
      run(item);
      return;
    }
  });
}
function check(){
  list.forEach(function(item, index, array){
    if (item.task_id == schedule_list[schedule_point]){
      console.log('waiting unlock');
      waiting.unlock();
      return;
    }
  });
}

function run(task){
    setTimeout(function(){
      task.socket.emit('finish task', {'task_id': task.task_id, 'start_time': task.start_time});
      console.log('send result');
      console.log('running unlock');
      running.unlock();
      schedule_point = schedule_point + 1;
      check();
    }, task.time);
}

function add_task(task){
  list.push(task);
  console.log('add task', task.task_id);
  if (task.task_id == schedule_list[schedule_point]){
    console.log('waiting unlock');
    waiting.unlock();
  }
  running.lock(function(){
    console.log('running lock');
    waiting.lock(function(){
      console.log('waiting lock');
      find();
    })
  });
}

io.on('connection',function(socket){
  console.log('connection');
  socket.on('disconnect', function(){
    console.log('disconnect');
  });
  socket.on('new task', function(task){
    console.log(task);
    task.socket = socket;
    add_task(task);
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
