const QRCode = require('qrcode');

const generateQR = async text => {
    try {
      console.log(await QRCode.toDataURL(text))
    } catch (err) {
      console.error(err)
    }
    try {
        await QRCode.toFile('./table.png', text);
      } catch (err) {
        console.error(err)
      }
  }
