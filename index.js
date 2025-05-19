const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  if (text === '') {
    response = `CON Hitamo Ibiryo Ukunda:
1. Akawunga
2. Inyama
3. Umuceri
4. Ifiriti`;
  } else if (text === '1') {
    response = 'END Wahisemo Akawunga. Murakoze!';
  } else if (text === '2') {
    response = 'END Wahisemo Inyama. Murakoze!';
  } else if (text === '3') {
    response = 'END Wahisemo Umuceri. Murakoze!';
  } else if (text === '4') {
    response = 'END Wahisemo Ifiriti. Murakoze!';
  } else {
    response = 'END Icyo wahisemo nticyumvikanye.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
