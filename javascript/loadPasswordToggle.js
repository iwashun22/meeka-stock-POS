import eyeOff from '../icons/eye-off.svg';
import eye from '../icons/eye.svg';
import { convertSVGToDOMNode } from './convertSVG';

const eyeOffElement = convertSVGToDOMNode(eyeOff, 20, 20);
const eyeElement = convertSVGToDOMNode(eye, 20, 20);

[eyeOffElement, eyeElement].forEach(el => {
  el.classList.add('toggle-password-icon');
});

export default function loadPasswordToggle() {
  const spanLists = document.querySelectorAll('.toggle-password');
  if (!spanLists) {
    return;
  }

  spanLists.forEach(span => {
    span.appendChild(eyeOffElement.cloneNode(true))

    span.addEventListener('click', () => {
      const input = span.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        span.replaceChild(eyeElement.cloneNode(true), span.firstChild);
      } else {
        input.type = 'password';
        span.replaceChild(eyeOffElement.cloneNode(true), span.firstChild);
      }

      input.focus({ preventScroll: true });
    })
  })
}