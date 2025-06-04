module.exports = {
  name: 'finance',
  exposes: {
    './Module': 'apps/finance/src/app/remote-entry/entry.module.ts',
  },
};
