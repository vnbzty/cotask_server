var express = require('express');
var router = express.Router();

const cp = require('child_process');

router.get('/', function(req, res, next) {

  res.send("get request");
});

var postRequest = require('./postRequest');

router.post('/', postRequest);

module.exports = router;
