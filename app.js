// app.js
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

let loggedIn = false; // Track login status
let hfPassword = 'defaultHFpassword'; // Initial HF password

let passwordsData = JSON.parse(fs.readFileSync('passwords.json'));

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === 'HF' && password === 'HFpasswords') {
    loggedIn = true;
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/generate_serial', (req, res) => {
  if (!loggedIn) {
    return res.status(403).json({ error: 'Not logged in' });
  }

  const newSerial = generateRandomSerial();
  passwordsData[newSerial] = hfPassword;
  fs.writeFileSync('passwords.json', JSON.stringify(passwordsData, null, 2));

  res.json({ serial: newSerial });
});

app.post('/change_hf_password', (req, res) => {
  if (!loggedIn) {
    return res.status(403).json({ error: 'Not logged in' });
  }

  const newHfPassword = req.body.hfPassword;
  hfPassword = newHfPassword;

  // Update the HF password for existing serials in passwordsData
  for (const serial in passwordsData) {
    if (passwordsData.hasOwnProperty(serial)) {
      passwordsData[serial] = newHfPassword;
    }
  }

  fs.writeFileSync('passwords.json', JSON.stringify(passwordsData, null, 2));

  res.json({ message: 'HF房间公示密码修改成功' });
});

app.post('/get_password', async (req, res) => {
  const serial = req.body.serial;

  if (passwordsData.hasOwnProperty(serial)) {
    const hfPassword = passwordsData[serial];

    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Fetch IP details using the API
    try {
      const response = await axios.get(`https://api.oioweb.cn/api/ip/ipaddress?ip=${clientIP}`);
      const ipDetails = response.data.result;

      // Log IP, IP details, serial, and HF password
      const logEntry = {
        timestamp: new Date().toISOString(),
        ip: clientIP,
        ipDetails: ipDetails,
        serial: serial,
        hfPassword: hfPassword
      };

      fs.appendFileSync('IPlog.txt', JSON.stringify(logEntry) + '\n', 'utf-8');

      res.json({ hfPassword: hfPassword });
    } catch (error) {
      console.error('Error fetching IP details:', error);
      res.json({ hfPassword: hfPassword }); // Still return HF password even if IP details fetch fails
    }
  } else {
    res.json({ error: '无效的序列码' });
  }
});

app.get('/get_ip_log', (req, res) => {
  try {
    const ipLogContent = fs.readFileSync('IPlog.txt', 'utf-8');
    res.send(ipLogContent);
  } catch (error) {
    console.error('Error reading IP log file:', error);
    res.status(500).send('Error reading IP log file');
  }
});

app.listen(30000, () => {
  console.log('服务器在端口30000上运行');
});

function generateRandomSerial() {
  const serialLength = 10;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let serial = '';
  for (let i = 0; i < serialLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    serial += characters.charAt(randomIndex);
  }
  return serial;
}