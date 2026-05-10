const printImageToThermal = async (device: any, imageSrc: string) => {
  if (!device || !device.gatt.connected) {
    throw new Error("Printer tidak terhubung atau terputus.");
  }

  const server = await device.gatt.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
  const characteristic = await server.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const printWidth = 384; 
  const scale = printWidth / img.width;
  canvas.width = printWidth;
  canvas.height = img.height * scale;

  if (!ctx) throw new Error("Gagal membuat konteks canvas.");

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const bitmap: number[] = [];

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x += 8) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const i = ((y * canvas.width) + (x + bit)) * 4;
        const luminance = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        if (luminance < 128) {
          byte |= (0x80 >> bit);
        }
      }
      bitmap.push(byte);
    }
  }

  const widthBytes = canvas.width / 8;
  const heightPixels = canvas.height;

  const header = new Uint8Array([
    0x1B, 0x40,             
    0x1D, 0x76, 0x30, 0x00, 
    widthBytes & 0xFF, (widthBytes >> 8) & 0xFF, 
    heightPixels & 0xFF, (heightPixels >> 8) & 0xFF 
  ]);

  const footer = new Uint8Array([0x1B, 0x64, 0x05, 0x1D, 0x56, 0x00]);

  const combinedData = new Uint8Array(header.length + bitmap.length + footer.length);
  combinedData.set(header);
  combinedData.set(new Uint8Array(bitmap), header.length);
  combinedData.set(footer, header.length + bitmap.length);

  const chunkSize = 20;
  for (let i = 0; i < combinedData.length; i += chunkSize) {
    const chunk = combinedData.slice(i, i + chunkSize);
    await characteristic.writeValue(chunk);
  }
};