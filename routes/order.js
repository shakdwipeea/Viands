(function() {
  var EventEmitter, Order, Restaurant, User, _, express, moment, mongoose, router, viands;

  express = require('express');

  router = express.Router();

  mongoose = require('mongoose');

  EventEmitter = require('events').EventEmitter;

  moment = require('moment');

  _ = require('underscore');

  viands = new EventEmitter();

  Order = mongoose.model('Order');

  User = mongoose.model('User');

  Restaurant = mongoose.model('Restaurant');

  router.post('/', function(req, res) {
    var done, items_available, items_ordered, restaurant, restaurant_found, user_found, validateAndOrder;
    restaurant = {};
    restaurant_found = false;
    user_found = false;
    done = 0;
    req.body = JSON.parse(req.body.data);
    console.log(req.body);
    if (req.body.token) {
      return Restaurant.findOne({
        _id: req.body.rest_id
      }, function(error, rest) {
        if (error) {
          res.json({
            err: true,
            message: error
          });
        } else if (restaurant) {
          restaurant = rest;
          console.log('Restaurant has menu', restaurant.menu[0]);
          restaurant_found = true;
        } else {
          console.log('404, Restaurant not found');
          restaurant_found = false;
        }
        done++;
        return viands.emit('found');
      }, console.log('Token order', req.body.token), User.findOne({
        token: req.body.token
      }, function(error, user) {
        if (error) {
          res.json({
            err: true,
            message: error
          });
        } else if (user) {
          user_found = true;
        } else {
          console.log('user not found');
        }
        done++;
        return viands.emit('found');
      }), items_available = [], items_ordered = [], validateAndOrder = function(restaurant, req) {
        var i, item, j, len, len1, newOrder, ref, ref1;
        console.log(restaurant.menu[0]);
        ref = restaurant.menu;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          if (item.available) {
            items_available.push(item._id.toString());
          }
        }
        console.log('request body', req.body.order.items);
        ref1 = req.body.order.items;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          item = ref1[j];
          item.complete = false;
          items_ordered.push(item.id);
        }
        console.log('Orderd', typeof items_ordered[0]);
        console.log('Available', typeof items_available[0]);
        console.log('Difference is', _.difference(items_ordered, items_available));
        if (_.difference(items_ordered, items_available).length === 0 && items_ordered) {
          console.log('Ordering');
          newOrder = new Order({
            time: new moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
            type: req.body.order.type,
            time_deliver: req.body.order.time_deliver,
            items: req.body.order.items,
            restaurant_id: req.body.rest_id
          });
          return newOrder.save(function(error, order) {
            console.log(order);
            if (error) {
              return res.json({
                err: error,
                message: err
              });
            } else {
              return res.json({
                err: false,
                message: 'Order placed',
                order_id: order._id,
                order_type: order.type
              });
            }
          });
        } else {
          return res.json({
            err: true,
            message: 'Items not available'
          });
        }
      }, viands.on('found', function() {
        console.log('Done os ', done);
        if (done === 2) {
          if (restaurant_found && user_found) {
            console.log(req.body);
            return validateAndOrder(restaurant, req);
          } else {
            console.log('Values are', restaurant_found, user_found);
            return res.json({
              err: true,
              message: 'No such user/ restaurant'
            });
          }
        }
      }));
    } else {
      return res.json({
        err: true,
        message: 'User not logged in'
      });
    }
  });

  module.exports = router;

}).call(this);