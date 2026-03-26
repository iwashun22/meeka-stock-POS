export default function ignoreSpaceKeyRegistrationInput() {
  const inputs = document.querySelectorAll(".registration-form input");

  inputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      input.value = value.replace(/\s/, '');
    });

    input.addEventListener("focusout", (e) => {
      const value = e.target.value;
      input.value = value.trim();
    });
  });
}