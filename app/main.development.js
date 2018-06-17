const path = require('path')


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

let electronApp = require('../dist/api/electron/bootstrap').createElectronApp({
  title: 'Wimbrel TCM',
  home: path.join(__dirname, 'app.html'),
  icon: path.join(__dirname, '../resources/icon.ico')
})
