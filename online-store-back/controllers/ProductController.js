// Alla olevat kirjastot sekä liitännäiset mahdollistavat kuvan vastaanottamisen
// sekä prosessoinnin oikeaan staattiseen hakemistoon
const multer = require('multer');
const upload = multer({ dest: 'public/images'});
const type = upload.single('image');
const fs = require('fs');

// Tuotteesta tehty model, jota käytetään MongoDB-kyselyissä
const Product = require('../models/Product');

// Globaali palvelinpuolen informointi
const serverInfo = msg => {
  console.log('@@ SERVER @@ [ProductCtrl => ' + msg);
}

/**
 * ProductController sisältää tuottteisiin liittyvät kyselyt
 * MongoDB-tietokantaan
 *
 * @param {object} req Käyttäjän tuoma informaatio HTTP-kyselyssä
 * @param {object} res Palvelinpuolen palauttama informaatio asiakaspuolelle
 *
 */
const ProductController = {


  /**
   * KAIKKIEN TUOTTEIDEN HAKU
   *
   * Funktio, joka hakee kaikki tietokannassa olevat tuotteet.
   *
   * @return {string/object} Virhetilanteissa palauttaa virheviestin.
   * Onnistuneissa tilanteissa palauttaa kyselyn tuottamat tuotteet.
   *
   */
  getAllProducts: (req, res) => {
    Product.find((err, products) => {
      if (err) {
        serverInfo('getAllProducts()]: Error: ' + err);
        return res.status(500).send('Virhe tuotteiden näyttämisessä.');
      }
      serverInfo('getAllProducts()]: Getting ' + products.length + ' products');
      return res.send(products);
    });
  },


  /**
   * YHDEN (1) TUOTTEEN HAKU URL-NIMEN AVULLA
   *
   * Funktio, joka hakee yhden tuotteen sen URL-nimen avulla (safename).
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa haetun tuotteen.
   *
   */
  getProduct: (req, res) => {
    serverInfo('getProduct()]: Getting one product by it\'s safeurl')
    let safename = req.params.safename;
    Product.findOne({ safename: safename }, (err, product) => {
      if (err) {
        serverInfo('getProduct()]: Error while getting product: ' + err);
        return res.status(500).send('Virhe tuotteen haussa');
      }
      if (!product) {
        serverInfo('getProduct()]: Did not found product: ' + safename);
        return res.status(404).send('Tuotetta ei löytynyt');
      }
      serverInfo('getProduct()]: Getting product info successful: ' + safename);
      return res.send(product);
    });
  },


  /**
   * TUOTTEIDEN HAKU TUOTELAJIN MUKAAN
   *
   * Funktio, joka hakee kaikki haluttuun tuotelajiin kuuluvat tuotteet.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa haetut tuotteet.
   *
   */
  getProductsByType: (req, res) => {
    serverInfo('getProductsByType()]: Getting products by type');
    let type = req.params.safetype;
    Product.find({ safetype: type }, (err, products) => {
      if (err) {
        serverInfo('getProductsByType()]: Error while getting products: ' + err);
        return res.status(500).send('Virhe tuotteiden haussa: ' + err);
      }
      // Tuotteita ei löydy ollenkaan
      if (products.length === 0) {
        serverInfo('getProductsByType()]: Did not found products: ' + type);
        return res.status(404).send('Tuotetta ei löytynyt: ' + type);
      }
      serverInfo('getProductsByType()]: Getting product info successful: ' + type);
      return res.send(products);
    });
  },


  /**
   * HAKEE KAIKKI OLEMASSA OLEVAT TUOTELAJIT
   *
   * Funktio, joka hakee kaikki olemassa olevat tuotelajit. Tietokanta-
   * hausta tuodaan vain type ja safetype, koska muut arvot ovat turhia tässä
   * tapauksessa. Koska kysely sisältää duplikaattiarvoja (ts. monta
   * samaa tuotelaji-arvoa), filtteröidään arvot kertaalleen läpi, jotta
   * palautettavat tuotelajit sisältävät vain uniikkeja arvoja.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa kaikki tuotelajit.
   *
   */
  getAllTypes: (req, res) => {
    serverInfo('getAllTypes()]: Getting all types');
    Product.find({}, { _id: 0, type: 1, safetype: 1 }, (err, types) => {
      if (err) {
        serverInfo('getAllTypes()]: Error while getting types: ' + err);
        return res.status(500).send('Tuotelajeja ei löytynyt: ' + err);
      }
      if (types.length === 0) {
        serverInfo('getAllTypes()]: Could not find types : ' + types);
        return res.status(404).send('Tuotelajeja ei löytynyt.');
      }
      // Filtteröidään duplikaatit pois
      types = types.filter((item, pos, array) => {
        return array.map(mapItem => mapItem['type']).indexOf(item['type']) === pos;
      })
      serverInfo('getAllTypes()]: Found ' + types.length + ' types');
      return res.send(types);
    });
  },


  /**
   * TUOTTEIDEN HAKU TEKSTIPÄTKÄN PERUSTEELLA
   *
   * Funktio, joka hakee tuotteen/tuotteita tekstipätkän mukaisesti.
   * Hakutilanteessa tätä kyselyä tullaan ajamaan jopa 300ms:n välein, joten
   * funktio on minimalistinen. Jos tuote löytää edes yhden tuotteen, jossa
   * kyseinen tekstinpätkä esiintyy (tuotteen nimen perusteella), palautetaan
   * se takaisin asiakaspuolelle.
   *
   * Mongoose-hakukysely on sama kuin esim. MySQL:ässä =>
   *  SELECT * FROM Products WHERE name LIKE "%tekstinpätkä%"
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa vastaavat tuotteet/tuotteen.
   *
   */
  searchProducts: (req, res) => {
    // Laitetaan muuttujaan hakusana, sekä i-parametri (case insentive)
    const nameRegex = new RegExp(req.params.term, 'i');
    Product.find({ name: nameRegex }, (err, products) => {
      if (err) {
        serverInfo('searchProducts()]: Error: ' + err);
        return res.status(500).send('Virhe tuotteita haussa');
      }
      return res.send(products);
    });
  },


  /**
   * UUDEN TUOTTEEN LUOMINEN (PL. KetusivuUVA)
   *
   * Funktio, joka luo uuden tuotteen MongoDB-tietokantaan. Formista tulleet
   * tiedot tulevat suoraan tietokannan arvoihin, jossa vain "img"-arvoon lisätään
   * .png -jatke, jotta asiakaspuoli saa kuvat näkyville.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa onnistuneesti luodun tuotteen.
   *
   */
  createProduct: (req, res) => {
    serverInfo('createProduct()]: Creating new product');
    Product.create({
      ean: req.body.ean,
      name: req.body.name,
      safename: req.body.safename,
      type: req.body.type,
      safetype: req.body.safetype,
      desc: req.body.desc,
      price: req.body.price,
      weight: req.body.weight,
      img: req.body.safename + '.png',
      bulletpoints: [
        req.body.bpoint0, req.body.bpoint1,
        req.body.bpoint2, req.body.bpoint3
      ]
    }, (err, product) => {
      if (err) {
        serverInfo('createProduct()]: Error: ' + err);
        // Duplicate key error (E11000)
        if (err.code === 11000) {
          return res.status(405).send('Tuotekoodi on jo käytössä');
        }
        // Muu virhe
        return res.status(500).send('Tuotetta ei voitu luoda')
      }
      serverInfo('createProduct()]: Product created successfully: ' + req.body.name);
      return res.send(product);
    });
  },

  /**
   * VANHAN TUOTTEEN PÄIVITTÄMINEN
   *
   * Funktio, joka päivittää vanhan tuotteen. Hakusyistä tuotteen EAN-koodia
   * ei voi päivittää asiakaspuolen kautta.
   *
   * Uniikkivirheiden (bugien?) takia attribuutit "name" ja "safename"
   * tarkistetaan erikseen muista attribuuteista - jos arvot ovat
   * samat kuin aikaisemmin ennen päivitystä, niitä ei "kokeilla" päivittää
   * ollenkaan. Muut attribuutit päivitetään normaaliin tapaan.
   *
   * @return {string} Virhetilanteissa funktio palauttaa asiakaspuolelle
   * virheviestin
   *
   */
  updateProduct: (req, res) => {
    serverInfo('updateProduct()]: Updating product');

    Product.findOne( { ean: req.body.ean }, (err, prod) => {
      if (err) {
        serverInfo('updateProduct()]: Error: ' + err);
        return res.status(500).send('Virhe tuotetta etsiessä');
      } else if (!prod) {
        serverInfo('updateProduct()]: Product not found with: ' + req.body.ean);
        return res.status(404).send('Tuotetta ei löytynyt: ' + req.body.ean);
      }
      if (prod.name !== req.body.name) {
        prod.name = req.body.name;
      }
      if (prod.safename !== req.body.safename) {
          prod.safename = req.body.safename;
      }
      prod.set({
        type: req.body.type,
        safetype: req.body.safetype,
        desc: req.body.desc,
        price: req.body.price,
        weight: req.body.weight,
        bulletpoints: [
          req.body.bpoint0, req.body.bpoint1,
          req.body.bpoint2, req.body.bpoint3
        ]
      });
      prod.save((err, updProd) => {
        if (err) {
          serverInfo('updateProduct()]: Error: ' + err);
          if (err.code === 11000) {
            return res.status(405).send(err);
          }
          // Muu virhe
          return res.status(500).send('Tuotetta ei voitu päivittää')
        }
        serverInfo('createProduct()]: Product updated: ' + req.body.name);
        res.send();
      });
    });
  },


  /**
   * KUVAN LISÄÄMINEN TUOTTEESEEN
   *
   * Funktio, joka lisää kuvan jo tehdylle tuotteelle. Tuotteiden kuvat eivät
   * kuitenkaan mene tietokantaan, vaan ne jäävät staattisesti palvelinpuolen
   * ~/public/images -hakemistoon, josta asiakaspuoli voi niitä helposti käyttää.
   *
   * @return {string/object}  Virhetilanteissa palauttaa virheviestin ja
   * onnistuneissa tilanteissa kuvan onnistumisfunktion.
   *
   */
  addImageToProduct: (req, res) => {
    const tmp_path = req.file.path;
    const target_path = 'public/images/' + req.file.originalname;
    const src = fs.createReadStream(tmp_path);
    const dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    fs.unlink(tmp_path, err => {
      if (err) serverInfo('addImageToProduct()]: Could not delete temp-img');
    })
    src.on('end', () => res.send(dest));
    serverInfo('addImageToProduct()]: Image added succesfully');
    src.on('error', err => res.status(500).send('Could not add image to product'));
  },


  /**
   * POISTAA TUOTTEEN SEKÄ KUVAN
   *
   * Funktio, joka poistaa tuotteeen tietokannasta pysyvästi, sekä poistaa sitä
   * koskevan kuvan.
   *
   * Aluksi poistetaan tietokannan tiedot, jos tämä onnistuu, poistetaan
   * palvelinpuolelta sitä vastaava kuva.
   *
   * @return {string/object} Virhetilanteissa palauttaa virhetilannetta
   * koskevan kuvan. Onnistuneessa tilanteessa palauttaa poistetun tuotteen.
   *
   */
  deleteProduct: (req, res) => {
    serverInfo('deleteProduct()]: Deleting product: ' + req.params.ean);
    Product.findOneAndRemove({ ean: req.params.ean}, (err, prod) => {
      console.log(prod);
      if (err) {
        serverInfo('deleteProduct()]: Error: ' + err);
        return res.status(500).send('Virhe tuotetta poistaessa: ' + err);
      }
      serverInfo('deleteProduct()]: Product info deleted. Deleting img now..');
      fs.unlink('public/images/' + req.params.img, err => {
        if (err) {
          serverInfo('deleteProduct()]: Error: ' + err);
          return res.status(500).send('Tuotteen info poistettiin, mutta kuvaa \
            ei voitu poistaa. Pyydä palvelinpuolen henkilökuntaa poistamaan se.');
        };
        serverInfo('deleteProduct()]: Img deleted: ' + req.params.img);
      });
      return res.send(prod);
    });
  }


}

// Lopuksi koko kontrollerista luodaan moduuli, jota product.routes -tiedosto
// tulee käyttämään.
module.exports = ProductController;
