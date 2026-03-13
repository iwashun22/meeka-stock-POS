"use strict";
import scanIcon from '../icons/scan-line.svg';
import { convertSVGToDOMNode } from './convertSVG';
import { startScanner } from './readQRCode';
import loadPasswordToggle from './loadPasswordToggle';

const scanIconElement = convertSVGToDOMNode(scanIcon, 26, 26);

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
});