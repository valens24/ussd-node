const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const { text } = req.body;

  let response = '';

  const input = text.split('*');

  switch (input[0]) {
    case '':
      response = `CON Hitamo Ibiryo Ukunda:
1. Akawunga
2. Inyama
3. Umuceri
4. Ifiriti`;
      break;

    case '1':
      response = `CON Hitamo ubwoko bw'Akawunga:
1. Akawunga ya sosoma
2. Akawunga iseye neza
3. Akawunga ifite ibinyamisogwe`;
      break;

    case '1*1':
      response = 'END Wahisemo Akawunga ya sosoma. Murakoze!';
      break;
    case '1*2':
      response = 'END Wahisemo Akawunga iseye neza. Murakoze!';
      break;
    case '1*3':
      response = 'END Wahisemo Akawunga ifite ibinyamisogwe. Murakoze!';
      break;

    case '2':
      response = `CON Hitamo ubwoko bw'inyama:
1. Inyama z'inkoko
2. Inyama z'inka
3. Inyama z'ihene`;
      break;

    case '2*1':
      response = "END Wahisemo Inyama z'inkoko. Murakoze!";
      break;
    case '2*2':
      response = "END Wahisemo Inyama z'inka. Murakoze!";
      break;
    case '2*3':
      response = "END Wahisemo Inyama z'ihene. Murakoze!";
      break;

    case '3':
      response = `CON Hitamo uko ushaka Umuceri:
1. Umuceri w'umweru
2. Umuceri wa pilawu
3. Umuceri n'ibishyimbo`;
      break;

    case '3*1':
      response = "END Wahisemo Umuceri w'umweru. Murakoze!";
      break;
    case '3*2':
      response = "END Wahisemo Umuceri wa pilawu. Murakoze!";
      break;
    case '3*3':
      response = "END Wahisemo Umuceri n'ibishyimbo. Murakoze!";
      break;

    case '4':
      response = `CON Hitamo ubwoko bwa Ifiriti:
1. Ifiriti ziseye
2. Ifiriti za pomme
3. Ifiriti zivanze n'inyama`;
      break;

    case '4*1':
      response = 'END Wahisemo Ifiriti ziseye. Murakoze!';
      break;
    case '4*2':
      response = 'END Wahisemo Ifiriti za pomme. Murakoze!';
      break;
    case '4*3':
      response = "END Wahisemo Ifiriti zivanze n'inyama. Murakoze!";
      break;

    default:
      response = 'END Icyo wahisemo nticyumvikanye.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
