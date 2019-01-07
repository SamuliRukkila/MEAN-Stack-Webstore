// KÄYTTÄJÄN SKEEMA JA MODEL

// Sähköposti on uniikki, jonka avulla käyttäjä voidaan yksilöidä. Sähköposti
// sekä postinumero tarkastetaan RegExpillä. Salasanaa ei tarkisteta
// palvelinpuolella, koska se tallennetaan kryptattuna tietokantaan.

// Tuodaan Mongoose -kirjasto
const mongoose = require('mongoose');
// Estetään Mongoosen Promisen deprecation error
mongoose.Promise = global.Promise;

const PurchaseHistory = require('./PurchaseHistory');

// Luodaan uusi skeema käyttäjästä
const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))/ },
  address: { type: String, required: true },
  postnumber: { type: Number, maxlength: 5,required: true, match: /[0-9]{5}$/ },
  city: { type: String, required: true },
  password: { type: String, required: true },
  send_email: { type: Boolean, required: true },
  isadmin: { type: Boolean, required: true },
  purchase_history: { type: [PurchaseHistory], required: false }
});

// Skeemasta luodaan model, joka eksportataan
module.exports =  mongoose.model('User', UserSchema);
