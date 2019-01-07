// Autentikaatioon liittyvät HTTP-kutsut. Näiden kutsujen avulla voit kirjautua
// sisään saaden samalla tokenin, tai rekisteröityä sisään. Jos omistat
// admin-käyttäjän saat sisäänkirjautuessa tokenin mukaan isadmin - arvon,
// jonka avulla voit tehdä admin-kutsuja

// AuthController-moduuli (MongoDB-kyselyt)
const Auth = require('../controllers/AuthController')

// Kaikki reititysvaihdoehdot
module.exports = app => {

  // Rekisteröinti
  app.post('/auth/register', Auth.register);
  // Kirjautuminen
  app.post('/auth/login', Auth.login);

}
