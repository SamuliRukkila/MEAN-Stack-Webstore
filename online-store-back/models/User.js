// KÄYTTÄJÄN SKEEMA JA MODEL

/* Sähköposti on uniikki, jonka avulla käyttäjä voidaan yksilöidä. Monet skeeman
attribuutit on suojeltu RegExp-tekniikalla, jotta arvot ovat juuri sitä mitä
halutaan. Salasanaa ei tarkisteta palvelinpuolella, koska se tallennetaan
kryptattuna tietokantaan. */

// Tuodaan Mongoose -kirjasto
const mongoose = require('mongoose');
// Estetään Mongoosen Promisen deprecation error
mongoose.Promise = global.Promise;

const PurchaseHistory = require('./PurchaseHistory');

// Luodaan uusi skeema käyttäjästä
const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true, match: /[-a-öA-Ö]+/, minlength: 2, maxlength: 40 },
  surname: { type: String, required: true, match: /[-a-öA-Ö]+/, minlength: 2, maxlength: 40},
  email: { type: String, required: true, unique: true, match: /^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))/ },
  address: { type: String, required: true, match: /[-a-öA-Ö0-9 ]+/, minlength: 4, maxlength: 50 },
  postnumber: { type: Number, required: true, match: /[0-9]{5}$/, minlength: 5, maxlength: 5 },
  city: { type: String, required: true, match: /[-a-öA-Ö]+/, minlength: 3, maxlength: 40 },
  password: { type: String, required: true },
  send_email: { type: Boolean, required: true },
  isadmin: { type: Boolean, required: true },
  purchase_history: { type: [PurchaseHistory], required: false }
});

// Skeemasta luodaan model, joka eksportataan
module.exports =  mongoose.model('User', UserSchema);
