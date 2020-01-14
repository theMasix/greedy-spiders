// Its the only way to include Toast

// If we use this in main.js without $(function) we cant get body var
// If we use this in main.js with $(function) we can get body but we get undefient toast error (I think this error occur because wrong scope)

// Get body to append .toast-box
var body = document.querySelector('body');

// Toast

// Create ToastBox
var toastBox = document.createElement('div');
toastBox.className = 'toast-box';
body.appendChild(toastBox);

// if we want message has green color, we don't have pass 'red' in toast function
function toast (message, color = 'green', duration = 2000) {
  var toastEl = document.createElement('div');
  var animationDuration = 300;

  toastEl.className = 'toast';
  if (color == 'red') {
    toastEl.className += ' red';
  }

  toastEl.innerText = message;
  toastBox.appendChild(toastEl);

  //////// Animate it! (Anime.JS)
  var animation = anime({
    targets: '.toast',
    opacity: [
      {value: 1, duration: animationDuration},
      {value: 0, delay: animationDuration +  duration, duration: animationDuration}
    ],
    easing: 'easeInOutQuint',
    complete: function() {
      toastBox.removeChild(toastEl);
    }
  });
}