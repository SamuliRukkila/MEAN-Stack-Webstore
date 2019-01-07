// AUTH-ROUTET

// Hoitaa autentikaatioon liittyvän reitityksen

// Moduuli, jonka avulla autentikoidaan token
const VerifyToken = require('../auth/VerifyToken');

// AuthController-moduuli (MongoDB-kyselyt)
const Auth = require('../controllers/AuthController')

// Kaikki reititysvaihdoehdot
module.exports = app => {

  // Rekisteröinti
  app.post('/register', Auth.register);
  // Kirjautuminen
  app.post('/login', Auth.login);

}
