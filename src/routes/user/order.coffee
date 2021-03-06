express = require 'express'
router = express.Router()

mongoose = require 'mongoose'

EventEmitter = require('events').EventEmitter
moment = require 'moment'
_ = require 'underscore'

gcm = require '../../lib/gcm'

viands = new EventEmitter()

Order = mongoose.model 'Order'
User = mongoose.model 'User'
Restaurant = mongoose.model 'Restaurant'

otp = require '../../lib/id2otp'

router.post '/', (req, res) ->

  restaurant = {}
  restaurant_found = false
  user_found = false
  done = 0
  console.log 'Done starting', done
  cur_user = {}
  gcm_id = ''

  req.body = JSON.parse(req.body.data)

  console.log 'Hi',req.body

  if req.body.token

    Restaurant.findOne
      _id: req.body.rest_id
      (error, rest) ->
        if error
          res.json
            err: true
            message: error

        else if rest

          if rest.close is true
            res.json {
              err: true
              message: 'Restaurant closed'
            }

            return

          gcm_id =  rest.gcm_id
          restaurant = rest
          console.log 'Restaurant has menu',restaurant.menu[0]
          restaurant_found = true

        else
          console.log '404, Restaurant not found'
          restaurant_found = false

        done++
        console.log 'Done after restaurant', done
        emitter_substitute()

    console.log 'Token order',req.body.token

    User.findOne
      token: req.body.token
      (error, user) ->
        cur_user = user
        if error
          res.json
            err: true
            message: error

        else if user
          user_found = true

        else 
          console.log 'user not found'

        done++
        console.log 'Done after user', done
        emitter_substitute()

    items_available = []
    items_ordered = []

    validateAndOrder = (restaurant, req) ->

      if cur_user.credits < 1 or (cur_user.credits - req.body.total_cost) < 0
        res.json {
          err: true
          message: 'Not enough credits'
        }

        return




      console.log restaurant.menu[0]
      for item in restaurant.menu
        if item.available then items_available.push item._id.toString()

      console.log 'request body',req.body.order.items

      for item in req.body.order.items
        item.complete = false
        items_ordered.push item.id

      console.log 'Orderd',typeof items_ordered[0]
      console.log 'Available',typeof items_available[0]

      console.log 'Difference is',_.difference(items_ordered, items_available)

      if _.difference(items_ordered, items_available).length is 0 and items_ordered
        console.log 'Ordering'

        console.log 'request body2',req.body.order.items

        console.log 'Id is .wjkvdgy', otp(123, true, 8)

        newOrder = new Order
          id: otp(123, true, 8)
          time: new moment().add(5,'hours').add(30,'minutes').format("dddd, MMMM Do YYYY, h:mm:ss a") 
          type: req.body.order.type
          user_id: cur_user.id
          time_deliver: req.body.order.time_deliver
          items: req.body.order.items
          restaurant_id: req.body.rest_id
          name: cur_user.name
          phone: cur_user.phone
          total_amount: req.body.total_cost
          complete: false
          delivered: false

        newOrder.save (error,order) ->
          
          console.log 'Error in saving',error

          if error
            res.json
              err: true
              message: 'Error'

          else
            cur_user.orders.push({
              id: order.id
            })
            console.log 'Order id bioh', order.id
            console.log 'cURRENT USER IS ', cur_user

            cur_user.credits -= req.body.total_cost

            cur_user.save (err, user) ->
              console.log 'Error while saving user',err
              console.log 'Done is ', done
              done = 0

              if cur_user.gcm_id
                gcm(1,'Credits Deducted', "Rs #{req.body.total_cost} has been Deducted", cur_user.gcm_id)

            if gcm_id
              gcm(3,'Incoming Order','Make way INCOMING',gcm_id)

            res.json
              err: false
              message: 'Order placed'
              order_id: order.id
              order_type: order.type
              name: cur_user.name
              phone: cur_user.phone

      else
        res.json
          err: true
          message: 'Items not available'

  else
    res.json
      err: true
      message: 'User not logged in'

  emitter_substitute = ->
    console.log 'Done os ',done
    if done is 2
      if restaurant_found and user_found
        #console.log 'Body of request in found',req.body
        validateAndOrder(restaurant, req)

      else
        console.log 'Values are', restaurant_found, user_found
        res.json
          err: true,
          message: 'No such user/ restaurant'


module.exports = router
