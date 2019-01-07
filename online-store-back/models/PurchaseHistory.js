// KÄYTTÄJÄN TILAUSHISTORIAN SKEEMA & MODEL

// Mongoose-kirjasto
const mongoose = require('mongoose');
// Estetään Mongoosen Promisen Deprecation Error
mongoose.Promise = global.Promise;

// Luodaan uusi skeema tuotehistoriasta
const PurchaseHistory = new mongoose.Schema({
  products: { type: [{
    ean: { type: String, maxlength: 13 },
    name: { type: String, required: true },
    type: { type: String, required: true },
    safetype: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
    img: { type: String, required: true },
    amount: { type: Number, required: true }
  }], require: true },
  payment_type: { type: String, required: true },
  price: { type: Number, required: true },
  date: Date
})

// Tästä skeemasta ei luoda vielä modelia vaan se viedään käyttäjän skeemaan
// sitä ennen.
module.exports = PurchaseHistory;
