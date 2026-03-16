"use strict";
import scanIcon from '../icons/scan-line.svg';
import plusIcon from '../icons/plus.svg';
import { convertSVGToDOMNode } from './convertSVG';
import { startScanner } from './readQRCode';
import loadPasswordToggle from './loadPasswordToggle';
import { addSellEvent } from './updateProductForm';

const scanIconElement = convertSVGToDOMNode(scanIcon, 26, 26);
const plusIconElement = convertSVGToDOMNode(plusIcon, 32, 32);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const scanIconContainer = document.getElementById('scan-icon-container');
  if (scanIconContainer) {
    scanIconContainer.appendChild(scanIconElement);

    scanIconContainer.addEventListener('click', () => {
      console.log('Scan icon clicked');
      startScanner();
    });
  }

  loadPasswordToggle();

  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) {
    plusIconElement.style.color = '#fff';
    addProductBtn.appendChild(plusIconElement);
  }

  addSellEvent();
});