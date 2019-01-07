// KÄYTTÄJÄN (USER) -ROUTET

// Hoitaa käyttäjiin liittyvät reititykset

// Moduuli, jonka avulla autentikoidaan token
const VerifyToken = require('../auth/VerifyToken');

// UserController-moduuli (MongoDB-kyselyt)
const User = require('../controllers/UserController');

// Kaikki reititysvaihdoehdot
module.exports = app => {

  // Käyttäjän tietojen haku
  app.get('/user/userinfo', VerifyToken, User.getUser);
  // Kaikkien käyttäjien haku
  app.get('/user/allusers', VerifyToken, User.getAllUsers);
  // Käyttäjän tietojen päivittäminen
  app.put('/user/upduser/:id', VerifyToken, User.updateUser);
  // Käyttäjän salasanan päivittäminen
  app.put('/user/updpwd/:id', VerifyToken, User.updatePassword);
  // Uuden tilaushistorian lisääminen käyttäjälle
  app.put('/user/addNewPurchase/:email', VerifyToken, User.addNewPurchase);
  // Käyttäjän poisto
  app.delete('/user/deluser/:id', VerifyToken, User.deleteUser);

}
