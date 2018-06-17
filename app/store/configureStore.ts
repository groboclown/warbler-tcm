let cs: any;

if (process.env.NODE_ENV === 'production') {
  cs = require('./configureStore.production');
} else {
  cs = require('./configureStore.development');
}

export = cs
