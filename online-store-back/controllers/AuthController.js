// Salasanan kryptaus
const bcrypt = require('bcryptjs');

// JSON Web Token sekä salasana
const jwt = require('jsonwebtoken');
const config = require('../auth/config');

// Käyttäjästä tehty model, jota käytetään MongoDB-kyselyissä
const User = require('../models/User');

// Globaali palvelinpuolen informointi
const serverInfo = msg => {
  console.log('@@ SERVER @@ [AuthCtrl => ' + msg);
}


/**
 * AuthController sisältää autentikaatioon liittyvät kyselyt
 * MongoDB-tietokantaan.
 *
 * @param {object} req Käyttäjän tuoma informaatio HTTP-kyselyssä
 * @param {object} res Palvelinpuolen palauttama informaatio asiakaspuolelle
 *
 */
const AuthController = {


  /**
   * REKISTERÖITYMINEN
   *
   * Funktio, joka tekee uuden käyttäjän (rekisteröinnin) tietokantaan.
   * Käyttäjän antama salasana kryptataan.
   *
   * @return {string} Funktio palauttaa onnistuineissa kyselyissä sekä
   * virhetilanteissa viestin suoraan käyttäjälle. Virheet dokumentoidaan
   * paremmin palvelinpuolen komentokehotteeseen.
   *
   */
  register: (req, res) => {

    serverInfo('register()]: Registering new user.');

    // Salasana kryptataan tallennuksen yhteydessä
    User.create({
      firstname: req.body.firstname,
      surname: req.body.surname,
      email: req.body.email,
      address: req.body.address,
      postnumber: req.body.postnumber,
      city: req.body.city,
      password: bcrypt.hashSync(req.body.password, 8),
      send_email: req.body.send_email,
      isadmin: false
    }, (err, user) => {

      // Virheet
      if (err) {
        serverInfo('register()]: Error: ' + err);
        // Duplicate key error (E11000)
        if (err.code === 11000) {
          return res.status(405).send('Sähköposti on jo käytössä');
        }
        // Muu virhe
        return res.status(500).send(
          'Rekisteröityminen epäonnistui. Kokeile uudestaan'
        );
      }
      serverInfo('register()]: User registered successfully: ' + req.body.email);
      // Kysely onnistui
      return res.send();
    });
  },


  /**
   * SISÄÄNKIRJAUTUMINEN
   *
   * Funktio joka autentikoi käyttäjän sekä onnistuneessa tilaantessa kirjaa
   * hänet sisään. Käyttäjä etsitään aluksi hänen antaman sähköpostin mukaan.
   * Jos käyttäjä löydetään, verrataan hänen antamaa salasanaa tietokannassa
   * olevaan kryptattuun salasanaan. Jos salasana on oikea, käyttäjälle luodaan
   * token, joka palautetaan käyttäjälle
   *
   * @return {string/object} Virhetilanteissa käyttäjälle palautetaan pelkkä
   * virheviesti. Tarkempi virheviesti tulee palvelinpuolen komentokehotteeseen.
   * Jos sisäänkirjautuminen onnistuu, käyttäjälle palautetaan allekirjoitettu
   * token.
   *
   */
  login: (req, res) => {

    serverInfo('login()]: Logging in: ' + req.body.email);

    // Yhden käyttäjän haku sähköpostin mukaan
    User.findOne({ email: req.body.email }, (err, user) => {
      // Verkkovirhe || Käyttäjää ei löytynyt
      if (err) {
        serverInfo('login()]: Error: ' + err);
        return res.status(500).send('Virhe kirjautuessa');
      }
      if (!user) {
        serverInfo('login()]: User not found: ' + req.body.email);
        return res.status(404).send('Käyttäjää ei löytynyt');
      }
      // Väärä salasana
      if (!req.body.password || !bcrypt.compareSync(req.body.password, user.password)) {
        serverInfo('login()]: Wrong password: ' + req.body.email);
        return res.status(401).send('Väärä salasana');
      }
      let token = {};
      if (user.isadmin) {
        token = jwt.sign({
          email: req.body.email,
          firstname: user.firstname,
          isadmin: true
          }, config.secret, { expiresIn: 7200 // 2h
        });
      } else {
        token = jwt.sign({
          email: req.body.email,
          firstname: user.firstname,
          isadmin: false
          }, config.secret, { expiresIn: 7200 // 2h
        });
      }
      // .. ja lähetetään se.
      return res.send({ token: token });
    });
  }

}

// AuthControllerista luodaan moduuli, jota muut tiedostot (auth.routes) voi
// käyttää
module.exports = AuthController;
