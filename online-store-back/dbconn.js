// Yhteydenotto MongoDB:n tietokantaan (MLAB)
const mongoose = require('mongoose');

// Yhteys MLABIIN (pilvessä sijaitseva MongoDB-tietokanta)
// Sijainti sekä käyttäjätiedot ovat piilossa .env-tiedostossa tietoturvasyistä.
const conn = mongoose.connect (
  process.env.DB_MLAB_URL, { useMongoClient: true }, err => {
      if (err) console.log('@@ SERVER @@: Error while connecting: ' + err);
      else console.log('@@ SERVER @@: Connected to database!');
});

// Eksportataan yhteys
module.exports = conn;
