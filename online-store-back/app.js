// NodeJS-kirjasto, joka mahdollistaa ympäristömuuttujien helpon säilytyksen
require('dotenv').config();
// Express -kirjasto lokaaliin muuttujaan
const express = require('express');
// Parsii tulevan JSON-tiedon Expressille luettavaksi
const bodyParser = require('body-parser');
// Cors mahdollistaa datan kulun eri osoitteista sijaitsevien sovellusten kesken.
const cors = require('cors');
// Timestampit
require('log-timestamp');
// Yhteys MongoDB:n
require('./dbconn');


// Tehdään Express-kirjastosta paikallinen muuttuja
const app = express();
// Cors käyttöön / Cross-domain
app.use(cors());


// Hakemisto missä kuvat ovat staattisesti tallennettuina
// Kuvat EIVÄT ole siis tietokannassa
const images = require('path').join(__dirname, 'public');
app.use(express.static(images));

// Parsi pyynnöt joiden content-type on: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Parsi pyynnöt joiden content-type on: JSON(application/json)
app.use(bodyParser.json())

// Perus route. Jos menet URL:n juureen
app.get('/', (req, res) => {
    res.json({'message': 'Nothing to see here.'});
});


// Tuodaan Student-, Auth- ja Product -routet
require('./routes/user.routes.js')(app);
require('./routes/auth.routes.js')(app);
require('./routes/product.routes.js')(app);

// Portti joko ympäristömuuttujan mukaan - toisessa tapauksessa portti 3000.
const port = process.env.PORT || 3000;

// Kuunnellaan pyyntöjä portista 3000
app.listen(port, () => {
    console.log('@@ SERVER @@: Server is listening on port ' + port);
});
