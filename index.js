const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const { text } = req.body;
  const input = text.split('*');
  let response = '';

  if (text === '') {
    response = `CON Hitamo Ibiryo Ukunda:
1. Akawunga
2. Inyama
3. Umuceri
4. Ifiriti`;
  } else if (input[0] === '1') {
    if (input.length === 1) {
      response = `CON Hitamo ubwoko bw'Akawunga:
1. Akawunga ya sosoma
2. Akawunga iseye neza
3. Akawunga ifite ibinyamisogwe`;
    } else if (input[1] === '1') {
      response = 'END Murakoze guhitamo Akawunga ya sosoma.';
    } else if (input[1] === '2') {
      response = 'END Murakoze guhitamo Akawunga iseye neza.';
    } else if (input[1] === '3') {
      response = 'END Murakoze guhitamo Akawunga ifite ibinyamisogwe.';
    }
  } else if (input[0] === '2') {
    if (input.length === 1) {
      response = `CON Hitamo ubwoko bw'Inyama:
1. Inyama z'inkoko
2. Inyama z'inka
3. Inyama z'ihene`;
    } else if (input[1] === '1') {
      response = "END Murakoze guhitamo Inyama z'inkoko.";
    } else if (input[1] === '2') {
      response = "END Murakoze guhitamo Inyama z'inka.";
    } else if (input[1] === '3') {
      response = "END Murakoze guhitamo Inyama z'ihene.";
    }
  } else if (input[0] === '3') {
    if (input.length === 1) {
      response = `CON Hitamo uko ushaka Umuceri:
1. Umuceri w'umweru
2. Umuceri wa pilawu
3. Umuceri n'ibishyimbo`;
    } else if (input[1] === '1') {
      response = "END Murakoze guhitamo Umuceri w'umweru.";
    } else if (input[1] === '2') {
      response = "END Murakoze guhitamo Umuceri wa pilawu.";
    } else if (input[1] === '3') {
      response = "END Murakoze guhitamo Umuceri n'ibishyimbo.";
    }
  } else if (input[0] === '4') {
    if (input.length === 1) {
      response = `CON Hitamo ubwoko bwa Ifiriti:
1. Ifiriti ziseye
2. Ifiriti za pomme
3. Ifiriti zivanze n'inyama`;
    } else if (input[1] === '1') {
      response = 'END Murakoze guhitamo Ifiriti ziseye.';
    } else if (input[1] === '2') {
      response = 'END Murakoze guhitamo Ifiriti za pomme.';
    } else if (input[1] === '3') {
      response = "END Murakoze guhitamo Ifiriti zivanze n'inyama.";
    }
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
