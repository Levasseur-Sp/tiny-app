// Generates a URL of lengthURL length with each character being one of 62 possibilities
// 6 random characters = 56'800'235'584 possibilities
module.exports = function generateRandomString(lengthURL) {
  const possibleChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let randomURL = "";
  for (var i = 0; i < lengthURL; i++) {
    randomURL += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomURL;
}