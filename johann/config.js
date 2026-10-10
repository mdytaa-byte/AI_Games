/*
  Optional school settings for Johann and the "Ask Johann" buttons.
  Leave everything empty and Johann asks each student how to connect.

  proxyUrl   Your school link (the Cloudflare Worker from proxy-worker.js).
             Students are connected automatically and never see an API key.
  classCode  The Worker's CLASS_CODE. Anything here is visible to anyone who
             opens this file, so leave it empty if students should type it once.
  buttons    false hides every "Ask Johann" button (for example in Kleinhausen)
             without removing them from the pages.
*/
window.JOHANN_CONFIG = {
  proxyUrl: "",
  classCode: "",
  buttons: true
};
