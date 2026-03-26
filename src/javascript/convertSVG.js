export function convertSVGToDOMNode(svgString, width, height) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (width) {
    svgElement.setAttribute('width', width);
  }

  if (height) {
    svgElement.setAttribute('height', height);
  }

  return svgElement;
}