"use strict";
import scanIcon from '../icons/scan-line.svg';
import plusIcon from '../icons/plus.svg';
import { convertSVGToDOMNode } from './convertSVG';
import { startScanner } from './readQRCode';
import ignoreSpaceKeyRegistrationInput from './ignoreSpaceKey';
import loadPasswordToggle from './loadPasswordToggle';
import { addSellEvent } from './updateProductForm';
import loadAlertMessage from './loadAlertMessage';
import handleEditableForm from './adminEditableHandler';

import "../scss/loadfonts.scss";
import "../scss/styles.scss";
import "../scss/allPartsList.scss";

const scanIconElement = convertSVGToDOMNode(scanIcon, 26, 26);
const plusIconElement = convertSVGToDOMNode(plusIcon, 32, 32);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const scanIconBtn = document.getElementById('scan-icon-btn');
  if (scanIconBtn) {
    scanIconBtn.appendChild(scanIconElement);

    scanIconBtn.addEventListener('click', () => {
      // console.log('Scan icon clicked');
      startScanner();
    });
  }

  ignoreSpaceKeyRegistrationInput();
  loadPasswordToggle();

  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    plusIconElement.style.color = '#fff';
    addProductBtn.appendChild(plusIconElement);
  }

  addSellEvent();
  loadAlertMessage();
  handleEditableForm();
});