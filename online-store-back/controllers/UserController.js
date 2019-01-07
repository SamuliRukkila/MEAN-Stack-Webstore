// Salasanan kryptaus
const bcrypt = require('bcryptjs')

// JSON Web Token sekä salasana
const jwt = require('jsonwebtoken');
const config = require('../auth/config');

// Käyttäjästä tehty model, jota käytetään MongoDB-kyselyissä
const User = require('../models/User');

// Globaali palvelinpuolen informointi
const serverInfo = msg => {
  console.log('@@ SERVER @@ [UserCtrl => ' + msg);
}


/**
 * UserController sisältää käyttäjiin liittyviä kyselyitä MongoDB-tietokantaan
 *
 * @param {object} req Käyttäjän tuoma informaatio HTTP-kyselyssä
 * @param {object} res Palvelinpuolen palauttama informaatio asiakaspuolelle
 *
 */
const UserController = {


  /**
   * KIRJAUTUNEEN KÄYTTÄJÄN TIETOJEN HAKU
   *
   * Funktio, joka käyttää käyttäjän tiedot sähköpostin avulla. Tietoturva-
   * syistä salasana jätetään hausta pois.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa käyttäjän.
   */
  getUser: (req, res) => {
    serverInfo('getUser()]: Getting user info');
    // Käyttäjän haku sähköpostin avulla, salasana jätetään pois hausta
    User.findOne( { email: req.headers.email }, { password: 0 }, (err, user) => {
      if (err) {
        serverInfo('getUser()]: Error while getting student: ' + err);
        return res.status(500).send('Virhe käyttäjää etsiessä');
      }
      if (!user) {
        serverInfo('getUser()]: Did not found student with: ' + req.headers.email);
        return res.status(404).send('Käyttäjää ei löytynyt');
      }
      serverInfo('getUser()]: Getting user info successful: ' + req.headers.email);
      return res.send(user);
    });
  },

  /**
   * KAIKKIEN KÄYTTÄJIEN HAKU
   *
   * Funktio, joka palauttaa kaikki tietokannassa olevat käyttäjät. Tietoturva-
   * syistä salasana jätetään hausta pois.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa kaikki käyttäjät
   *
   */
  getAllUsers: (req, res) => {
    serverInfo('getAllUsers()]: Getting all users');
    User.find({}, { password: 0 }, (err, users) => {
      if (err) {
        serverInfo('getAllUsers()]: Error: ' + err);
        return res.status(500).send('Virhe kaikkien käyttäjien tuonnissa')
      }
      if (!users) {
        serverInfo('getAllUsers()]: Did not found any students');
        return res.status(404).send('Yhtään käyttäjää ei löytynyt');
      }
      serverInfo('getAllUsers()]: Got ' + users.length + ' users');
      return res.send(users)
    });
  },


  /**
   * KÄYTTÄJÄN PÄIVITTÄMINEN
   *
   * Funktio, joka päivittää kirjautuneen käyttäjän tiedon/tietoja.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa päivitetyn käyttäjän.
   *
   */
  updateUser: (req, res) => {
    serverInfo('updateUser()]: Updating existing user.');
    User.findByIdAndUpdate(req.params.id, {
        firstname: req.body.firstname,
        surname: req.body.surname,
        address: req.body.address,
        postnumber: req.body.postnumber,
        city: req.body.city,
        send_email: req.body.send_email
      }, { new: true })
      .then(user => {
        serverInfo('updateUser()]: Update successful: ' + req.body.firstname);
        if (!user) return res.status(404).send('Käyttäjää ei löytynyt.');
        return res.send(user);
      }).catch(err => {
        serverInfo('updateUser()]: Error while updating: ' + err);
        return res.status(500).send('Virhe käyttäjän päivityksessä.');
      });
  },


  /**
   * KÄYTTÄJÄN SALASANAN PÄIVITYS
   *
   * Funktio, joka päivittää käyttäjän salasanan. Aluksi etsitään käyttäjä
   * ID:n perusteella. Jos käyttäjä löytyy vertaillaan annettua salasanaa
   * sekä tietokannassa olevaa kryptattua salasanaa keskenään. Jos salasana
   * on oikein, päivitetään käyttäjän antama uusi salasana käyttäjän tietokannassa
   * olevaan salasanaan (kryptattuna).
   *
   * @return {string}  Virhetilanteissa sekä onnistuneissa tilanteissa
   * palauttaa viestin.
   *
   */
  updatePassword: (req, res) => {

    serverInfo('updatepwd()]: Updating user\'s password');
    User.findById(req.params.id, (err, user) => {
      if (err) {
        serverInfo('updatepwd()]: Error while searching user: ' + err);
        return res.status(500).send('Virhe käyttäjää etsiessä');
      }
      if (!user) {
        serverInfo('updatepwd()]: Did not found user: ' + req.params.id);
        return res.status(404).send('Käyttäjää ei löytynyt');
      }
      if(!bcrypt.compareSync(req.body.oldPwd, user.password)) {
        serverInfo('updatepwd()]: Wrong password.');
        return res.status(401).send('Väärä salasana');
      }
      user.set({
        password: bcrypt.hashSync(req.body.newPwd, 8)
      });
      user.save((err, newuser) => {
        if (err || !newuser) {
          serverInfo('updatepwd()]: Could not update user password: ' + err);
          return res.status(500).send('Uusi salasana ei kelvannut');
        }
        serverInfo('updatepwd()]: User password changed successfully.');
        return res.send();
      });
    });
  },


  /**
   * KÄYTTÄJÄN POISTAMINEN
   *
   * Funktio, joka poistaa käyttäjän tietokannasta kokonaan. Käyttäjä etsitään
   * aluksi ID:n avulla. Jos käyttäjä löytyy, verrataan annettua salasanaa
   * tietokannassa olevan salasanan kanssa. Jos tämä kaikki onnistuu, käyttäjä
   * poistetaan tietokannasta.
   *
   * @return {string}  Virhetilanteissa sekä onnistuneissa tilanteissa
   * palauttaa viestin.
   *
   */
  deleteUser: (req, res) => {

    serverInfo('deleteUser()]: Deleting user.');
    User.findById(req.params.id, (err, user) => {
      if (err) {
        serverInfo('deleteUser()]: Error while deleting user: ' + err);
        return res.status(500).send('Virhe käyttäjää etsiessä');
      }
      // Käyttäjää ei löydy
      if (!user) {
        serverInfo('deleteUser()]: Did not found user: ' + req.params.id);
        return res.status(404).send('Käyttäjää ei löytynyt');
      }
      // Väärä salasana
      if (!bcrypt.compareSync(req.headers['password'], user.password)) {
        serverInfo('deleteUser()]: Wrong password.');
        return res.status(401).send('Väärä(t) salasana(t)');
      }
      // Poistetaan käyttäjä
      user.remove(err => {
        // Virhe käyttäjän poistossa
        if (err) {
          serverInfo('deleteUser()]: Could not remove user: ' + err);
          return res.status(500).send('Virhe käyttäjän poistossa');
        }
        serverInfo('deleteUser()]: User removed successfully.');
        return res.send('Käyttäjäsi on poistettu');
      })
    })
  },


  /**
   * UUSI TUOTETILAUS KÄYTTÄJÄLLE
   *
   * Funktio, joka luo uuden tuotetilauksen käyttäjän tietokanta-osioon.
   * Kaikki tiedot tulevat asiakaspuolelta, ja ne laitetaan käyttäjän omaan
   * taulukkoon, jossa on kaikki ostoshistoriat.
   *
   * @return {string}  Virhetilanteissa sekä onnistuneissa tilanteissa
   * palauttaa viestin.
   *
   */
  addNewPurchase: (req, res) => {
    serverInfo('addNewPurchase()]: Adding new purchase');
    // Pusketaan käyttäjän product_history -tietokantataulukkoon uusi alkio
    User.findOneAndUpdate({ email: req.params.email} , { $push: { purchase_history: {
      date: new Date(),
      products: req.body.products,
      payment_type: req.body.payment,
      price: req.body.price
    }}}, { new: true }).then(user => {
      if (!user) {
        serverInfo('addNewPurchase()]: Student not found with ' + req.params.email);
        return res.status(404).send(
          'Käyttäjää ei löytynyt'
      )}
      serverInfo('addNewPurchase()]: New purchase added for: ' + req.params.email);
      res.send(user);
    }).catch(err => {
      serverInfo('addNewPurchase()]: Error while adding new \
        purchase: ' + err);
      return res.status(500).send(
        'Palvelinvirhe. Kokeile uudestan'
      );
    });
  }

}


module.exports = UserController;
