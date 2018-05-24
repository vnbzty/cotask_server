const cp = require('child_process')
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  var t1 = new Date().getTime();
  cp.exec('python schedule.py', (err, stdout, stderr) => {
    if (err)
      console.log('stderr',err);
    if (stdout)
      console.log('stdout',stdout);
    var t2 = new Date().getTime();
    res.send({ time: t2 - t1});
   })
});

module.exports = router;
