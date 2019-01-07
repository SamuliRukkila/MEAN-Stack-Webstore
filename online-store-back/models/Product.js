// TUOTTEIDEN SKEEMA & MODEL

// Mongoose-kirjasto
const mongoose = require('mongoose');
// Estetään Mongoosen Promisen Deprecation Error
mongoose.Promise = global.Promise;

// Luodaan uusi skeema
const productSchema = new mongoose.Schema({
  ean: { type: String, required: true, unique: true, maxlength: 13,
    minlength: 13, match: /([a-zA-Z0-9]+)/  },
  name: { type: String, required: true, unique: true },
  safename: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  safetype: { type: String, required: true },
  desc: { type: String, required: true, minlength: 100, maxlength: 400 },
  price: { type: Number, required: true },
  weight: { type: Number, required: true },
  img: { type: String, required: true },
  bulletpoints: { type: [String], required: true }
});

// Skeemasta luodaan model, joka eksportataan
module.exports =  mongoose.model('Product', productSchema);
