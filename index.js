const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ussd_app'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.post('/', (req, res) => {
  console.log('Received request body:', req.body);

  const { text = '', phoneNumber = '' } = req.body;

  // Defensive: if phoneNumber or text missing, end session
  if (!phoneNumber) {
    res.set('Content-Type', 'text/plain');
    return res.send('END Missing phone number.');
  }

  const input = text.split('*');
  let response = '';

  if (text === '') {
    response = `CON Please choose language:\n1. Kinyarwanda\n2. English`;
  } else if (input[0] === '1') {
    response = handleMenu(input, 'rw', phoneNumber);
  } else if (input[0] === '2') {
    response = handleMenu(input, 'en', phoneNumber);
  } else {
    response = 'END Invalid input.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

function handleMenu(input, lang, phoneNumber) {
  const level = input.length;
  const translations = getTranslations(lang);

  if (level === 1) return `CON ${translations.menu}`;

  if (input[1] === '1') {
    if (level === 2) return `CON ${translations.akawunga}`;
    if (level === 3) return endAndSave(input, lang, phoneNumber, 'Akawunga');
  }
  if (input[1] === '2') {
    if (level === 2) return `CON ${translations.inyama}`;
    if (level === 3) return endAndSave(input, lang, phoneNumber, 'Inyama');
  }
  if (input[1] === '3') {
    if (level === 2) return `CON ${translations.umuceri}`;
    if (level === 3) return endAndSave(input, lang, phoneNumber, 'Umuceri');
  }
  if (input[1] === '4') {
    if (level === 2) return `CON ${translations.ifiriti}`;
    if (level === 3) return endAndSave(input, lang, phoneNumber, 'Ifiriti');
  }

  return 'END Invalid input.';
}

function endAndSave(input, lang, phoneNumber, category) {
  const choicePath = input.join('*');

  console.log('Saving to DB:', { phoneNumber, choicePath, lang, category });

  db.query(
    'INSERT INTO ussd_responses (phone_number, choice_path, language, category) VALUES (?, ?, ?, ?)',
    [phoneNumber, choicePath, lang, category],
    (err, results) => {
      if (err) {
        console.error('DB insert error:', err);
      } else {
        console.log('Data inserted successfully:', results);
      }
    }
  );

  const msg = lang === 'rw' ? 'Murakoze guhitamo neza.' : 'Thank you for your selection.';
  return `END ${msg}`;
}

function getTranslations(lang) {
  if (lang === 'rw') {
    return {
      menu: "Hitamo Ibiryo Ukunda:\n1. Akawunga\n2. Inyama\n3. Umuceri\n4. Ifiriti",
      akawunga: "Hitamo ubwoko bw'Akawunga:\n1. Akawunga ya sosoma\n2. Akawunga iseye neza\n3. Akawunga ifite ibinyamisogwe",
      inyama: "Hitamo ubwoko bw'Inyama:\n1. Inyama z'inkoko\n2. Inyama z'inka\n3. Inyama z'ihene",
      umuceri: "Hitamo uko ushaka Umuceri:\n1. Umuceri w'umweru\n2. Umuceri wa pilawu\n3. Umuceri n'ibishyimbo",
      ifiriti: "Hitamo ubwoko bwa Ifiriti:\n1. Ifiriti ziseye\n2. Ifiriti za pomme\n3. Ifiriti zivanze n'inyama"
    };
  } else {
    return {
      menu: "Choose your favorite food:\n1. Ugali\n2. Meat\n3. Rice\n4. Fries",
      akawunga: "Choose type of Ugali:\n1. Soft Ugali\n2. Fine Ugali\n3. Ugali with legumes",
      inyama: "Choose type of Meat:\n1. Chicken\n2. Beef\n3. Goat",
      umuceri: "Choose type of Rice:\n1. White Rice\n2. Pilau\n3. Rice with Beans",
      ifiriti: "Choose type of Fries:\n1. Sliced Fries\n2. Potato Fries\n3. Fries with Meat"
    };
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
