/**
 * Tests for the form script
 *
 * Last slash is not allowed
 * No special characters
 */

var falseList = [
  '.facebook.com',
  'hello.',
  'kiss.kis.bang.bang.troll',
  'facebook.com//',
  '*.facebook.com',
  'satire/love',
  'troll',
  'hiya.93',
  '',
  '.fr',
  '*.fr',
  'http://hello.com',
  '//trololo.com'
];

var goodList = [
  'facebook.com',
  'facebook.com/',
  'hiya.fr/moncul/',
  'trololo.com/hello/les/foufous/du/32',
  'maxwellito.github.io/awesome'
];

for (var i = 0; i < falseList.length; i++) {
  console.log(!keyForm.regexp.domain.test(falseList[i]), falseList[i]);
}

for (i = 0; i < goodList.length; i++) {
  console.log(keyForm.regexp.domain.test(goodList[i]), goodList[i]);
}