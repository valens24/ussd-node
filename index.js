const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ussd_app'
});

db.connect(err => {
  if (err) console.error('DB connection failed:', err);
  else console.log('Connected to MySQL');
});

app.post('/', async (req, res) => {
  const { sessionId, phoneNumber, text = '' } = req.body;
  let session_id = sessionId || uuidv4();

  console.log('Request:', { sessionId, phoneNumber, text });

  try {
    // Check if session exists
    let session = await queryPromise('SELECT * FROM Sessions WHERE sessionID = ?', [session_id]);

    if (session.length === 0) {
      // Create new session
      await queryPromise('INSERT INTO Sessions (sessionID, phoneNumber) VALUES (?, ?)', [session_id, phoneNumber]);
      session = [{ language: null }];
    } else {
      session = session[0];
    }

    let response = '';
    const userInput = text.split('*');

    if (!session.language) {
      // Language not selected yet
      if (text === '') {
        response = `CON Welcome / Karibu\nSelect Language:\n1. English\n2. Kinyarwanda`;
      } else if (userInput[0] === '1') {
        // Save language
        await queryPromise('UPDATE Sessions SET language = ? WHERE sessionID = ?', ['en', session_id]);
        response = `CON Main Menu:\n1. Food Menu\n2. Other Options\n0. Exit`;
      } else if (userInput[0] === '2') {
        await queryPromise('UPDATE Sessions SET language = ? WHERE sessionID = ?', ['rw', session_id]);
        response = `CON Menu Nkuru:\n1. Ibiryo\n2. Ibindi\n0. Gusoza`;
      } else {
        response = 'END Invalid input.';
      }
    } else {
      // Language selected, show menus
      response = handleMenus(userInput, session.language, phoneNumber, session_id);
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
  } catch (err) {
    console.error('Error:', err);
    res.set('Content-Type', 'text/plain');
    res.send('END An error occurred, please try again.');
  }
});

function handleMenus(input, lang, phoneNumber, session_id) {
  const level = input.length;

  const menus = {
    en: {
      main: `Main Menu:\n1. Food Menu\n2. Other Options\n0. Exit`,
      foodMenu: `Food Menu:\n1. Ugali\n2. Meat\n3. Rice\n0. Back`,
      otherOptions: `Other Options:\n1. About Us\n0. Back`,
      ugaliTypes: `Choose type of Ugali:\n1. Soft Ugali\n2. Fine Ugali\n3. Ugali with legumes\n0. Back`,
      meatTypes: `Choose type of Meat:\n1. Chicken\n2. Beef\n3. Goat\n0. Back`,
      riceTypes: `Choose type of Rice:\n1. White Rice\n2. Pilau\n3. Rice with Beans\n0. Back`,
      about: `We are a USSD service provider.\n0. Back`,
      thankYou: `Thank you for your selection.`
    },
    rw: {
      main: `Menu Nkuru:\n1. Ibiryo\n2. Ibindi\n0. Gusoza`,
      foodMenu: `Ibiryo:\n1. Akawunga\n2. Inyama\n3. Umuceri\n0. Garuka`,
      otherOptions: `Ibindi:\n1. Ibyerekeye Twebwe\n0. Garuka`,
      ugaliTypes: `Hitamo ubwoko bw'Akawunga:\n1. Akawunga ya sosoma\n2. Akawunga iseye neza\n3. Akawunga ifite ibinyamisogwe\n0. Garuka`,
      meatTypes: `Hitamo ubwoko bw'Inyama:\n1. Inyama z'inkoko\n2. Inyama z'inka\n3. Inyama z'ihene\n0. Garuka`,
      riceTypes: `Hitamo ubwoko bw'Umuceri:\n1. Umweru\n2. Pilawu\n3. Umuceri n'ibishyimbo\n0. Garuka`,
      about: `Turi abakora serivisi za USSD.\n0. Garuka`,
      thankYou: `Murakoze guhitamo.`
    }
  };

  // Level 1: Main menu
  if (level === 1) {
    if (input[0] === '0') return 'END Goodbye!';
    if (input[0] === '1') return `CON ${menus[lang].foodMenu}`;
    if (input[0] === '2') return `CON ${menus[lang].otherOptions}`;
    return `END Invalid input.`;
  }

  // Level 2
  if (level === 2) {
    // Back option
    if (input[1] === '0') return `CON ${menus[lang].main}`;

    if (input[0] === '1') { // Food Menu
      if (input[1] === '1') return `CON ${menus[lang].ugaliTypes}`;
      if (input[1] === '2') return `CON ${menus[lang].meatTypes}`;
      if (input[1] === '3') return `CON ${menus[lang].riceTypes}`;
      return `END Invalid input.`;
    }

    if (input[0] === '2') { // Other Options
      if (input[1] === '1') return `CON ${menus[lang].about}`;
      return `END Invalid input.`;
    }

    return `END Invalid input.`;
  }

  // Level 3: Final selections or back option
  if (level === 3) {
    // Handle back navigation
    if (input[2] === '0') {
      return `CON ${menus[lang].foodMenu}`;
    }

    // Log transaction in DB and end session
    const categoryMap = {
      '1*1*1': 'Soft Ugali',
      '1*1*2': 'Fine Ugali',
      '1*1*3': 'Ugali with legumes',
      '1*2*1': 'Chicken',
      '1*2*2': 'Beef',
      '1*2*3': 'Goat',
      '1*3*1': 'White Rice',
      '1*3*2': 'Pilau',
      '1*3*3': 'Rice with Beans',
      '2*1': 'About Us'
    };

    const choicePath = input.join('*');
    const category = categoryMap[choicePath] || 'Unknown';

    // Save transaction
    db.query(
      `INSERT INTO Transactions (sessionID, phoneNumber, choicePath, language, category) VALUES (?, ?, ?, ?, ?)`,
      [input.session_id || 'unknown', phoneNumber, choicePath, lang, category],
      (err) => {
        if (err) console.error('DB insert error:', err);
      }
    );

    return `END ${menus[lang].thankYou}`;
  }

  return `END Invalid input.`;
}

// Helper promisified query for async/await usage
function queryPromise(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
