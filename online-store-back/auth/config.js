/**
 * Salainen salasana, jota Javascript Web Token käyttää hyödykseen avatessaan
 * valmiita tokeneita. Olion arvo (secret) on piilossa .env-tiedossa ylimääräisen
 * turvallisuuden takia.
 *
 * @type {Object} - Sisältää salaisen salasanan
 *
 */
module.exports = {
  'secret': process.env.SECRET_KEY
};
