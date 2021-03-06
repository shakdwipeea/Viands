(function() {
  var Restaurant, User, express, gcm, mongoose, router;

  express = require('express');

  router = express.Router();

  gcm = require('../../lib/gcm');

  mongoose = require('mongoose');

  Restaurant = mongoose.model('Restaurant');

  User = mongoose.model('User');

  router.post('/', function(req, res) {
    if (req.body.token && req.body.menu) {
      req.body.menu = JSON.parse(req.body.menu);
      return Restaurant.findOne({
        'admin.token': req.body.token
      }, function(err, rest) {
        if (err) {
          console.log('Error occured in finding restaurant', err);
          return res.json({
            err: true,
            message: 'Error occured'
          });
        } else if (rest) {
          rest.menu = req.body.menu;
          return rest.save(function(err) {
            if (err) {
              console.log('Error occured in saving Restaurant');
              return res.json({
                err: true,
                message: 'Error'
              });
            } else {
              User.find({}, function(err, user) {
                var i, len, regIds, usr;
                if (err) {
                  return console.log('Error', err);
                } else {
                  regIds = [];
                  for (i = 0, len = user.length; i < len; i++) {
                    usr = user[i];
                    regIds.push(usr.gcm_id);
                  }
                  return gcm(3, 'Menu Changed', 'Hey food court menu has Changed.', regIds);
                }
              });
              return res.json({
                err: false,
                message: 'Menu updated'
              });
            }
          });
        } else {
          return res.json({
            err: false,
            message: 'No such restaurant'
          });
        }
      });
    } else {
      return res.json({
        err: true,
        message: 'Missing Parameters'
      });
    }
  });

  module.exports = router;

}).call(this);
