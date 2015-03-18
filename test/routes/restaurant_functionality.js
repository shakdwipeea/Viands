(function() {
  var Orders, User, chai, expect, mongoose, request, tokenize;

  chai = require('chai');

  expect = chai.expect;

  request = require('request');

  require('../../app');

  mongoose = require('mongoose');

  User = mongoose.model('User');

  Orders = mongoose.model('Order');

  tokenize = require('../../lib/tokenize');

  describe('Restaurant functionality', function() {
    var token_restaurant, username_restaurant;
    token_restaurant = '';
    username_restaurant = 'akash';
    beforeEach(function(done) {
      return request.post('http://localhost:3000/login_restaurant', {
        form: {
          username: username_restaurant,
          password: 'akash'
        }
      }, function(status, response, body) {
        body = JSON.parse(body);
        token_restaurant = body.Restaurant.admin.token;
        return done();
      });
    });
    describe('Addition of credits', function() {
      var password_user, phone, phone_user, user;
      phone = '';
      user = {};
      phone_user = 8277564501;
      password_user = tokenize('akash');
      beforeEach(function(done) {
        return request.post('http://localhost:3000/login', {
          form: {
            phone: phone_user,
            password: 'akash'
          }
        }, function(status, response, body) {
          body = JSON.parse(body);
          user = body.user;
          return done();
        });
      });
      return it('should add credits to the user ', function(done) {
        return request.post('http://localhost:3000/add_credits', {
          form: {
            username: username_restaurant,
            token: token_restaurant,
            tar_phone: phone_user,
            amount: 100
          }
        }, function(status, response, body) {
          body = JSON.parse(body);
          console.log(body);
          expect(body.err).not.to.be.equal(true);
          return User.findOne({
            phone: phone_user,
            password: password_user
          }, function(err, usr) {
            console.log('error', err);
            expect(err).not.to.be.equal(true);
            expect(usr.credits).to.be.equal(user.credits + 100);
            return done();
          });
        });
      });
    });
    return describe('Should list all the orders', function() {
      return it('should display the orders', function(done) {
        var count, go, orders_api, orders_db;
        count = 0;
        orders_db = [];
        orders_api = [];
        go = function(done) {
          if (count === 2) {
            expect(orders.db_length).to.not.be.equal(0);
            expect(orders_db.length).to.be.equal(orders_api.length);
            return done();
          }
        };
        request.post('http://localhost:3000/get_order', {
          form: {
            token: token_restaurant
          }
        }, function(status, response, body) {
          body = JSON.parse(body);
          console.log(body);
          expect(body.err).to.not.be.equal(true);
          if (body.orders) {
            orders_api = body.orders;
          }
          count++;
          return go(done);
        });
        return Order.find({}, function(err, orders) {
          console.log('Orders from db are', orders);
          expect(err).not.to.be.equal(true);
          orders_db = orders;
          count++;
          return go(done);
        });
      });
    });
  });

}).call(this);