function validUsernameInput(input) {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(input);
}

function validPasswordInput(input) {
  const regex = /^[a-zA-Z0-9!@#$%^&*()_-+='"<>,.?/]+$/;
  return regex.test(input);
}

module.exports = {
  validUsernameInput,
  validPasswordInput,
}