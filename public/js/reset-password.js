var newPwd = document.getElementById('reset-new-password');
var newConfirmPwd = document.getElementById('reset-new-confirm-password');
var resetButton = document.getElementById('password-reset-button');
var errorSpan = document.getElementsByClassName('password-dont-match-span');
var email = document.getElementById('password-reset-email').value;
errorSpan[0].style.visibility = 'hidden';
errorSpan[1].style.visibility = 'hidden';
newPwd.addEventListener('keyup', function () {
  if (newPwd.value !== newConfirmPwd.value) {
    errorSpan[0].style.visibility = 'visible';
    resetButton.disabled = true;
  } else {
    errorSpan[0].style.visibility = 'hidden';
    errorSpan[1].style.visibility = 'hidden';
    resetButton.disabled = false;
  }
});

newConfirmPwd.addEventListener('keyup', function (e) {
  if (newPwd.value !== newConfirmPwd.value) {
    errorSpan[1].style.visibility = 'visible';
    resetButton.disabled = true;
  } else {
    errorSpan[0].style.visibility = 'hidden';
    errorSpan[1].style.visibility = 'hidden';
    resetButton.disabled = false;
  }
});

resetButton.addEventListener('click', function (e) {
  e.preventDefault();
  fetch('/user/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: newPwd.value,
    }),
  }).then(function(res){
    if(res.ok){
      window.close()
    } else {
      alert('Error');
    }
  });
});