function validUsernameInput(input) {
  const regex = /^(?=.*[A-Za-z])[a-zA-Z0-9]+$/;
  return regex.test(input);
}

function validPasswordInput(input) {
  const regex = /^[a-zA-Z0-9!@#$%^&*()_\-+='"<>,.?/]+$/;
  return regex.test(input);
}

function hasSpace(input) {
  const regex = /\s/;
  return regex.test(input);
}

module.exports = {
  validUsernameInput,
  validPasswordInput,
  hasSpace
}