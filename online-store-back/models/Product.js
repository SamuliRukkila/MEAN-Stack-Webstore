// TUOTTEIDEN SKEEMA & MODEL

/* Suurin osa skeeman attribuuteista on suojeltu RegExp-tekniikalla, jossa
varmistetaan, että arvot ovat todellakin sitä mitä halutaan. Tämä sama
validointi tehdään myös asiakaspuolella, mutta palvelinpuolella tämä
"varmistetaan" toiseen kertaan. */

// Mongoose-kirjasto
const mongoose = require('mongoose');
// Estetään Mongoosen Promisen Deprecation Error
mongoose.Promise = global.Promise;

// Luodaan uusi skeema
const productSchema = new mongoose.Schema({
  ean: { type: String, required: true, unique: true, maxlength: 13,
    minlength: 13, match: /[A-Z0-9]+/ },
  name: { type: String, required: true, unique: true, maxlength: 40,
    minlength: 10, match: /[-a-öA-Ö0-9 ]+/ },
  safename: { type: String, required: true, unique: true,
    match: /[-a-zA-Z0-9]+/ },
  type: { type: String, required: true, match: /[a-öA-Ö]+/ },
  safetype: { type: String, required: true, match: /[a-zA-Z]+/ },
  desc: { type: String, required: true, minlength: 100, maxlength: 400 },
  price: { type: Number, required: true },
  weight: { type: Number, required: true },
  img: { type: String, required: true },
  bulletpoints: { type: [String], required: true, minlength: 10, maxlength: 60 }
});

// Skeemasta luodaan model, joka eksportataan
module.exports =  mongoose.model('Product', productSchema);
