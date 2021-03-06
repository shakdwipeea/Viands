var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RestaurantSchema = new mongoose.Schema({
  name: String,
  sno: Number,
  lat: String,
  lng: String,
  location: String,
  rating: Number,
  cost: Number,
  num_review: Number,
  num_photos: Number,
  phone: Number,
  gcm_id: [{type: String}],
  close: Boolean,
  category_list: [{type: String}],
  menu: [{
    item_id: Schema.Types.ObjectId,
    sno: Number,
    name: String,
    category: String,
    pic: String,
    category_name: String,
    description: String,
    ratings: Number,
    cost: Number,
    available: Boolean
  }],
  admin: {
    username: String,
    password: String,
    token: String
  }
});

mongoose.model('Restaurant', RestaurantSchema);
