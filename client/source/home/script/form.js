'use strict';

/**
 * The form
 * @type {Object}
 */
var keyForm = {
  dom: {
    email: document.getElementById('f-email'),
    domain: document.getElementById('f-domain'),
    tcs: document.getElementById('f-tcs'),
    panel: document.getElementById('f-panel'),
    submit: document.getElementById('f-submit')
  },
  regexp: {
    domain: /^([a-z0-9-_]+\.)+[a-z]{2,4}(\/[a-z0-9-_]+)*\/?$/i,
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  },
  prompt: function (msg, type) {
    keyForm.dom.panel.textContent = msg;
    keyForm.dom.panel.className = type || '';
  }
};

keyForm.dom.submit.addEventListener('click', function (e) {
  // Stop here if there's a request in progress
  if (keyForm.request) {
    return;
  }

  // Test the browser
  if (!XMLHttpRequest || !JSON) {
    keyForm.prompt('Your browser is really deprecated, even for simple things like a XHR (1st version). Nah! Come on! Stop joking, get something good.', 'error');
    return;
  }

  // Test the inputs
  if (!keyForm.regexp.email.test(keyForm.dom.email.value)) {
    keyForm.prompt('Your email address is not valid.', 'error');
    return;
  }
  if (!keyForm.regexp.domain.test(keyForm.dom.domain.value)) {
    keyForm.prompt('Your domain pattern is not valid.', 'error');
    return;
  }
  if (!keyForm.dom.tcs.checked) {
    keyForm.prompt('You must agree the terms and conditions.', 'error');
    return;
  }

  // Make the request
  var oReq = keyForm.request = new XMLHttpRequest();

  oReq.onreadystatechange = function () {
    if (oReq.readyState !== 4) {
      return;
    }
    var response;
    keyForm.request = null;
    if (oReq.status !== 200) {
      keyForm.prompt('An error has occured, please try again later.', 'error');
      return;
    }
    response = JSON.parse(oReq.responseText);
    if (response.error) {
      keyForm.prompt(response.error, 'error');
    }
    else {
      keyForm.prompt('Success, you should receive an email, at some point, one day.', 'success');
    }
  };

  oReq.onerror = function () {
    keyForm.prompt('An error has occured, please try again later.', 'error');
    keyForm.request = null;
  };

  oReq.open('POST', '/** @routes.requestKey **/', true);
  var oParams = [
    'email=' + keyForm.dom.email.value,
    'domain=' + keyForm.dom.domain.value,
    'tcs=' + keyForm.dom.tcs.checked
  ];

  var formData = new FormData( document.getElementById('key-form') );
  oReq.send(formData);
});