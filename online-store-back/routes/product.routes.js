// Tuotteisiin liittyvät HTTP-kutsut. Täältä voi jopa ei-kirjautunut käyttäjä
// nähdä erilaiia tuotteita. Tuotteiden muokkaus, poisto sekä päivitys
// -mahdollisuudet on siunattu vain admin-käyttäjille joilla on sen mukainen
// token.

// Moduuli, jonka avulla autentikoidaan ADMIN-token
const VerifyAdminToken = require('../auth/VerifyAdminToken');

// Tiedoston tallentamiseen tarkoitettu kirjasto, mahdollistaa kuvan
// vastaanottamisen staattisesti
const multer = require('multer');
const upload = multer({ dest: 'public/images' });
const type = upload.single('image');

// UserController-moduuli (MongoDB-kyselyt)
const Product = require('../controllers/ProductController');

// Kaikki reititysvaihdoehdot
module.exports = app => {

  // Kaikki tuotteet
  app.get('/product/allproducts', Product.getAllProducts);
  // Kaikki tuotteet tietyn tuotelajin mukaisesti
  app.get('/product/type/:safetype', Product.getProductsByType);
  // Tuotteen haku url-nimen avulla (safename)
  app.get('/product/name/:safename', Product.getProduct);
  // Kaikkien tuotelajien haku
  app.get('/product/getalltypes', Product.getAllTypes);
  // Tuotteen haku hakusanan avulla
  app.get('/product/searchproducts/:term', Product.searchProducts);

  // Kuvan lisääminen jo luodulle tuotteelle
  app.post('/product/addimage', type, Product.addImageToProduct);
  // Tuotteen luominen
  app.post('/product/createproduct', VerifyAdminToken, Product.createProduct);

  // Tuotteen päivittäminen
  app.put('/product/updateproduct', VerifyAdminToken, Product.updateProduct);

  // Tuotteen poistaminen
  app.delete('/product/deleteproduct/:ean/:img', VerifyAdminToken, Product.deleteProduct);

}
