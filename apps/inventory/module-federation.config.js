module.exports = {
  name: 'inventory',
  exposes: {
    './Module': 'apps/inventory/src/app/remote-entry/entry.module.ts',
  },
};
