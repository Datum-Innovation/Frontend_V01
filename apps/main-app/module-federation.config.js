module.exports = {
  name: 'main-app',
  exposes: {
    './Module': 'apps/main-app/src/app/remote-entry/entry.module.ts',
  },
};
