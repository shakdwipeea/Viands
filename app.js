var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')
var mongoose = require('mongoose');
var multer = require('multer');

try {
    mongoose.connect('mongodb://localhost/viands');
} catch (err) {
    throw new Error("Could not connect to database");
}


require('./models/OrderSchema');
require('./models/RestaurantSchema');
require('./models/UserSchema');
require('./models/CreditSchema');
require('./models/NotificationSchema');
require('./models/BannerSchema');
require('./models/OfferSchema');

var routes = require('./routes/index');
var users = require('./routes/users');

var restaurants = require('./routes/restaurants');

var signUp = require('./routes/user/signup');
var verify = require('./routes/user/verify');
var login = require('./routes/user/login');
var order = require('./routes/user/order');
var resend_otp = require('./routes/user/resend_otp');
var get_user_orders = require('./routes/user/get_order_history')
var get_credits = require('./routes/user/get_credits');
var register_gcm = require('./routes/user/register_gcm');
var notifications= require('./routes/user/notifications');
var get_account_history = require('./routes/user/account_history');

var new_restaurant = require('./routes/restaurant/new_restaurant');
var login_restaurant = require('./routes/restaurant/login_restaurant');
var add_credits = require('./routes/restaurant/add_credits');
var get_orders = require('./routes/restaurant/get_order');
var order_complete = require('./routes/restaurant/order_complete');
var add_notification = require('./routes/restaurant/add_notification');
var change_menu = require('./routes/restaurant/change_menu');
var order_delivered = require('./routes/restaurant/order_delivered');
var close_restaurant = require('./routes/restaurant/close_restaurant');
var account_info = require('./routes/restaurant/account');

var clear = require('./routes/restaurant/clear_users');

var app = express();


app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multer({ dest: __dirname + '/uploads/'}))

//Will be added in the next update to block orders coming from previous versions
/*app.use(function (req, res, next) {
    if(req.path === '/order'){
        if(req.body.version >= 2) {
            next();
        } else {
            res.json({
                err: true,
                message: 'Update the app.'
            })
        }
    } else {
        next();
    }
})*/

/**
*
* V2 Api
*
**/

app.use('/v2/restaurants', require('./routes/v2/restaurant'));
app.use('/v2/menu', require('./routes/v2/restaurantMenu'));




/**
*
* v1 Api
*
**/




app.use('/', routes);
app.use('/offers', require('./routes/user/offers'));
app.use('/users', users);

app.use('/restaurants', restaurants);

app.use('/signUp', signUp);
app.use('/verify', verify);
app.use('/login', login);
app.use('/order', order);
app.use('/resend_otp', resend_otp);
app.use('/user_orders', get_user_orders);
app.use('/get_credits', get_credits);
app.use('/notifications', notifications);

/**
 * new additions
 */
app.use('/forgot', require('./routes/user/forgot_password'));
app.use('/reset', require('./routes/user/reset'));
app.use('/edit_profile', require('./routes/user/edit_profile'));
app.use('/cancel_order_user', require('./routes/user/cancel_order_user'));

/**
*
* restaurant api additions
*
**/

app.use('/cancel_order', require('./routes/restaurant/cancel_order'));



app.use('/account_history', get_account_history);

app.use('/register_gcm', register_gcm);

app.use('/new_restaurant', new_restaurant);
app.use('/login_restaurant', login_restaurant);
app.use('/add_credits', add_credits);
app.use('/get_order', get_orders);
app.use('/order_complete', order_complete);
app.use('/add_notification', add_notification);
app.use('/change_menu', change_menu);
app.use('/order_delivered', order_delivered);
app.use('/close_restaurant', close_restaurant);

app.use('/account_info', account_info);

app.use('/clear', clear);

/**
*
* Admin managemnet
*
**/

app.use('/admin', require('./routes/admin/addRestaurant'));

app.use('/admin_login', require('./routes/admin/login.js'));
app.use('/admin/offers', require('./routes/admin/offers.js'))


app.use('/loaderio-dd4293340c21327d3e3e64a3cb850d21.txt', function (req, res) {
    res.sendFile(__dirname + '/loaderio-dd4293340c21327d3e3e64a3cb850d21.txt');
})

// catch 404 and forward to error handler
app.use(function(req, res) {
    // var err = new Error('Not Found');
    // err.status = 404;
    // next(err);
    res.json({
      err: true,
      message: 'No such route'
    });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
