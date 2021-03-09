import quantize from "quantize";

export const getPixelArray = (data, pixelCount, qual) => {
  const pixels = data;
  const pixelArr = [];
  for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + qual) {
    offset = i * 4;
    r = pixels[offset + 0];
    g = pixels[offset + 1];
    b = pixels[offset + 2];
    a = pixels[offset + 3];
    if (typeof a === "undefined" || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArr.push([r, g, b]);
      }
    }
  }
  return pixelArr;
};
export const getColor = (myImage) => {
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  let width = (canvas.width = myImage.naturalWidth);
  let height = (canvas.height = myImage.naturalHeight);
  let pixelCount = width * height;
  context.drawImage(myImage, 0, 0, width, height);
  const getImageData = context.getImageData(0, 0, width, height);
  let data = getImageData.data;
  const pixelArr = getPixelArray(data, pixelCount, 10);
  const cmap = quantize(pixelArr, 4);
  const palette = cmap ? cmap.palette() : null;
  const paletteObj = {};
  paletteObj[
    "formattedMain"
  ] = `rgba(${palette[0][0]},${palette[0][1]},${palette[0][2]})`;
  paletteObj[
    "formattedSecondary"
  ] = `rgba(${palette[1][0]},${palette[1][1]},${palette[1][2]})`;
  return paletteObj;
};
