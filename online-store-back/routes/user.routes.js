// Käyttäjiin liittyvät routet. Täältä voi päästä käsiksi käyttäjiin kohdistuvissa
// HTTP-kyselyissä, joten kaikkiin kyselyihin tarvitsee tokenin. Kaikkien käyttäjien
// hakuun tarvitset AdminTokenin, koska kyseessä on arkaluontoista tietoa.

// Moduuli, jonka avulla autentikoidaan token
const VerifyToken = require('../auth/VerifyToken');
// Moduuli, jonka avulla autentikoidaan admin-token
const VerifyAdminToken = require('../auth/VerifyAdminToken');

// UserController-moduuli (MongoDB-kyselyt)
const User = require('../controllers/UserController');

// Kaikki reititysvaihdoehdot
module.exports = app => {

  // Kaikkien käyttäjien haku
  app.get('/user/allusers', VerifyAdminToken, User.getAllUsers);
  // Käyttäjän tietojen haku
  app.get('/user/userinfo', VerifyToken, User.getUser);

  // Käyttäjän tietojen päivittäminen
  app.put('/user/upduser/:id', VerifyToken, User.updateUser);
  // Käyttäjän salasanan päivittäminen
  app.put('/user/updpwd/:id', VerifyToken, User.updatePassword);
  // Uuden tilaushistorian lisääminen käyttäjälle
  app.put('/user/addNewPurchase/:email', VerifyToken, User.addNewPurchase);

  // Käyttäjän poisto
  app.delete('/user/deluser/:id', VerifyToken, User.deleteUser);

}
