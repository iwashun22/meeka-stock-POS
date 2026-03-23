import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

// Located in /views/layout.pug
function displayReaderDiv(display = false) {
  const readerDiv = document.getElementById("qr-reader");
  readerDiv.style.display = display ? "block" : "none";
}

function onScanSuccess(decodedText, decodedResult) {
  console.log(`Decoded text: ${decodedText}`, decodedResult);
  displayReaderDiv(false);

  // Located in /views/search.pug
  const inputText = document.getElementById("sku-id");
  inputText.value = decodedText;
}

function onScanFailure(error) {
  console.warn(`Code scan error = ${error}`);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "render",
  {
    fps: 10,
    qrbox: 250,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
  },
  /* verbose= */ false
);

const closeButton = document.getElementById("close-qr-btn");
closeButton.addEventListener("click", () => {
  displayReaderDiv(false);
  html5QrcodeScanner.clear().catch((error) => {
    console.error("Failed to clear QR code scanner. ", error);
  });
})


export function startScanner() {
  displayReaderDiv(true);
  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

