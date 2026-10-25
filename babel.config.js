// Konfigurasi Babel untuk Expo.
// `babel-preset-expo` harus bisa ditemukan dari folder proyek. Pada instalasi yang rusak/bertingkat ia hanya ada di
// node_modules/expo/node_modules, dan Metro gagal dengan "Cannot find module 'babel-preset-expo'" (lalu di HP muncul
// "Cannot read properties of undefined (reading 'transformFile')"). Fallback di bawah mencarinya lewat paket `expo`.
module.exports = function (api) {
  api.cache(true);
  let preset = "babel-preset-expo";
  try {
    require.resolve(preset);
  } catch {
    try {
      preset = require.resolve("babel-preset-expo", { paths: [require.resolve("expo/package.json")] });
    } catch {
      /* biarkan Babel melaporkan error aslinya */
    }
  }
  return { presets: [preset] };
};
