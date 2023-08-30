// public/admin.js
document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginButton = document.getElementById('loginButton');
  const loginResult = document.getElementById('loginResult');

  const adminPanel = document.getElementById('adminPanel');
  const generateSerialButton = document.getElementById('generateSerialButton');
  const serialResult = document.getElementById('serialResult');
  const newHfPasswordInput = document.getElementById('newHfPassword');
  const changeHfPasswordButton = document.getElementById('changeHfPasswordButton');
  const changeHfPasswordResult = document.getElementById('changeHfPasswordResult');
  const logTableBody = document.getElementById('logTableBody');

  // Login button click event
  loginButton.addEventListener('click', () => {
    const username = loginUsername.value;
    const password = loginPassword.value;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'Login successful') {
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        fetchAndDisplayIPLog(); // Fetch and display IP log content on page load
      } else {
        loginResult.textContent = 'Invalid credentials';
      }
    })
    .catch(error => {
      loginResult.textContent = 'Error during login';
    });
  });

  // Generate Serial button click event
  generateSerialButton.addEventListener('click', () => {
    fetch('/generate_serial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        serialResult.textContent = data.error;
      } else {
        serialResult.textContent = `Generated Serial: ${data.serial}`;
      }
    })
    .catch(error => {
      serialResult.textContent = 'Error generating serial';
    });
  });

  // Change HF Password button click event
  changeHfPasswordButton.addEventListener('click', () => {
    const newHfPassword = newHfPasswordInput.value;

    fetch('/change_hf_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hfPassword: newHfPassword }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        changeHfPasswordResult.textContent = data.message;
      } else {
        changeHfPasswordResult.textContent = data.error;
      }
    })
    .catch(error => {
      changeHfPasswordResult.textContent = 'Error changing HF password';
    });

    // Fetch and display IP log content after changing password
    fetchAndDisplayIPLog();
  });

  // Fetch and display IP log content on page load
  fetchAndDisplayIPLog();

  function fetchAndDisplayIPLog() {
    fetch('/get_ip_log', {
      method: 'GET',
    })
    .then(response => response.text())
    .then(logContent => {
      logTableBody.innerHTML = ''; // Clear previous table rows

      const logEntries = logContent.trim().split('\n');
      for (const entry of logEntries) {
        try {
          const logObj = JSON.parse(entry);
          const formattedDate = new Date(logObj.timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${logObj.ip}</td>
            <td>${logObj.ipDetails.addr.join(' ')}</td>
            <td>${logObj.serial}</td>
          `;

          logTableBody.appendChild(row);
        } catch (error) {
          console.error('Error parsing log entry:', error);
        }
      }
    })
    .catch(error => {
      console.error('Error fetching IP log:', error);
    });
  }
});
