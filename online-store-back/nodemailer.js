// Moduuli joka luo sähköpostin ja lähettää sen käyttäjälle
// Moduulissa luodaan muokattu HTML-templaatti, johon tuodaan mukana
// kaikki tuotteet.

const nodemailer = require('nodemailer');

function NodeMailer (email, products, payment_type, full_price) {

  // Tehdään suomalainen päivämäärä sähköpostiin
  const d = new Date();
  date = d.getDate() + "." + (d.getMonth() + 1) + '.' + d.getFullYear();

  // Alkuviesti
  let response = `<h1>Hei, kiitos tilauksestasi.</h1>
                  <p>Tuotteesi lähetään muutaman päivän kuluessa. Saat silloin
                  uuden sähköpostiviestin, mistä voit seurata tilausta.</p>
                  <h3>Hinta: ${full_price} €</h3>
                  <h3>Maksutapa: ${payment_type}</h3>
                  <h3>Päivämäärä: ${date}</h3>
                  <table style='border: 1px solid black; text-align-center;'>
                  <tr><b><th>NIMI</th><th>TYYPPI</th>
                  <th>HINTA</th><th>MÄÄRÄ</th></b></tr>`;

  // Lisätään jokainen tuote sähköpostiviestiin for-loopissa
  for (let i = 0; i < products.length; i++) {
    response += `<tr>
                  <td>${products[i].name}</td>
                  <td>${products[i].type}</td>
                  <td>${products[i].price} €</td>
                  <td>${products[i].amount} kpl</td>
                 </tr>`;
  }

  // Suljetaan tuotetaulukko
  response += '</table>';

  // Suhautus-sähköpostin tiedot
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PWD,
    }
  });

  // Sähköpostitietojen tiedot
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: 'Tilauksesi verkkokaupassa Suhautus Oy',
    html: response
  }

  // Lähetetään sähköposti käyttäjälle
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log('@@ SERVER @@: Email sent: ' + info.response);
  });
}

module.exports = NodeMailer;
