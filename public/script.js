// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  const getPasswordButton = document.getElementById('getPasswordButton');
  const passwordResult = document.getElementById('passwordResult');

  getPasswordButton.addEventListener('click', () => {
    const serial = document.getElementById('serialInput').value;

    fetch('/get_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serial: serial }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        passwordResult.textContent = data.error;
      } else {
        passwordResult.textContent = `密码: ${data.hfPassword}`;
      }
    })
    .catch(error => {
      passwordResult.textContent = 'Error retrieving password';
    });
  });
});
