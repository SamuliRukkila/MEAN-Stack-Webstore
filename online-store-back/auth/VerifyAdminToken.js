// Kirjastot Javascript Web Tokenille
const jwt = require('jsonwebtoken');
// Sisältää salasanan tokenin avaamiseen
const config = require('./config');

/**
 * Funktio, joka tarkastaa asiakaspuolelta tulleen Adminin tokenin. Adminin HTTP-
 * pyyntö siirtyy seuraavaan kohtaan, jos token on validi. Muussa tapauksessa
 * HTTP-pyyntö evätään ja palautetaan HTTP-virhe.
 *
 * @param  {[object]} req Adminin mukana lähetyt tiedot
 * @param  {[object]} res Palvelinpuolen vastaus asiakaspuolelle
 * @param  {Function} next Funktio, joka siirtää adminin seuraavaan väliohjelmistoon
 *  eli middlewareen, jos autentikaatio tokenin avulla onnistuu
 *
 * @return {res.status} Palauttaa virheviestin, jos esim. tokenia ei ole annettu
 *
 */
verifyAdminToken = (req, res, next) => {
  console.log('@@ SERVER @@ [VerifyAdminToken]: Verifying token.');
  // Token joko request.bodysta tai headerseista
  const token = req.body.token || req.headers['token'];
  // Tyhjä token
  if (!token) {
    console.log('@@ SERVER @@ [VerifyAdminToken]: Could not find token.');
    return res.status(403).send('Adminia ei voitu autentikoida.');
  }

  // Tokenin tarkastus
  jwt.verify(token, config.secret, (err, decoded) => {
    console.log(decoded);
    // Virhe tarkastusvaiheessa
    if (err) {
      res.status(500).send('Virhe autentikaatiossa. Kokeile uudestaan.');
    }
    // Katsotaan että adminin tokenissa on isadmin === true, jotta voidaan
    // autentikoida admin.
    if (!decoded.isadmin) {
      return res.status(403).send('Ei Admin-oikeuksia.');
    }
    console.log('@@ SERVER @@ [VerifyAdminToken]: Token verified successfully.');
    // Jos token-autentikaatio onnistuu jatketaan seuraavaan middlewareen
    next();
  })
}

// VerifyAdminToken -funktiosta moduuli toisille tiedostoille
module.exports = verifyAdminToken;
