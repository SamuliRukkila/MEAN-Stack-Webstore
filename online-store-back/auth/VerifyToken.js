// Kirjastot Javascript Web Tokenille
const jwt = require('jsonwebtoken');
// Sisältää salasanan tokenin avaamiseen
const config = require('./config');

/**
 * Funktio, joka tarkastaa asiakaspuolelta tulleen tokenin. Käyttäjän HTTP-
 * pyyntö siirtyy seuraavaan kohtaan, jos token on validi. Muussa tapauksessa
 * HTTP-pyyntö evätään ja palautetaan HTTP-virhe.
 *
 * @param  {[object]} req Käyttäjän mukana lähetyt tiedot
 * @param  {[object]} res Palvelinpuolen vastaus asiakaspuolelle
 * @param  {Function} next Funktio, joka siirtää käyttäjän seuraavaan väliohjelmistoon
 *  eli middlewareen, jos autentikaatio tokenin avulla onnistuu
 *
 * @return {res.status} Palauttaa virheviestin, jos esim. tokenia ei ole annettu
 *
 */
verifyToken = (req, res, next) => {
  console.log('@@ SERVER @@ [VerifyToken]: Verifying token.');
  // Token joko request.bodysta tai headerseista
  const token = req.body.token || req.headers['token'];
  // Tyhjä token
  if (!token) {
    console.log('@@ SERVER @@ [VerifyToken]: Could not find token.');
    return res.status(403).send('Käyttäjää ei voitu autentikoida.');
  }

  // Tokenin tarkastus
  jwt.verify(token, config.secret, (err, decoded) => {
    // Virhe tarkastusvaiheessa
    if (err) return res.status(500).send(
      'Virhe autentikaatiossa. Kokeile uudestaan.'
    );
    console.log('@@ SERVER @@ [VerifyToken]: Token verified successfully.');
    // Jos token-autentikaatio onnistuu jatketaan seuraavaan middlewareen
    next();
  })
}

// VerifyToken -funktiosta moduuli toisille tiedostoille
module.exports = verifyToken;
