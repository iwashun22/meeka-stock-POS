import circleX from "../icons/circle-x.svg";
import { convertSVGToDOMNode } from "./convertSVG";

const circleXSVG = convertSVGToDOMNode(circleX, 26, 26);

const DURATION = 4; // seconds

export default function loadAlertMessage() {
  const alertContainer = document.getElementById("alert-container");

  const messageBox = alertContainer.getElementsByClassName("message-box");

  if (!messageBox) return;

  Array.from(messageBox).forEach(el => {
    const deleteBtn = el.querySelector("button");
    el.classList.add("show");

    const x = circleXSVG.cloneNode(true);
    deleteBtn.appendChild(x);

    const fn = (e) => {
      el.remove();
    }
    deleteBtn.addEventListener("click", fn, { once: true });

    setTimeout(() => {
      deleteBtn.removeEventListener("click", fn);
      el.remove();
    }, DURATION * 1000);
  })
}