var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RestaurantSchema = new mongoose.Schema({
  name: String,
  location: String,
  rating: Number,
  cost: Number,
  num_review: Number,
  num_photos: Number,
  phone: Number,
  menu: [{
    item_id: Schema.Types.ObjectId,
    name: String,
    category: String,
    pic: String,
    description: String,
    ratings: Number
  }]
});

mongoose.model('Restaurant', RestaurantSchema);
