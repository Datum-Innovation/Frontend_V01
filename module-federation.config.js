// Core libraries such as react, angular, redux, ngrx, etc. must be
// singletons. Otherwise the applications will not work together.
const coreLibraries = new Set([
  '@angular/animations',
  '@angular/cdk',
  '@angular/common',
  '@angular/common/http',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/router',
  '@ngrx/component-store',
  '@ngrx/effects',
  '@ngrx/store-devtools',
  '@ngrx/entity',
  '@ngrx/router-store',
  '@ngrx/store',
  '@nx/angular',
  'rxjs',
]);

module.exports = {
  // Share core libraries, and avoid everything else
  shared: (libraryName, defaultConfig) => {
    if (coreLibraries.has(libraryName)) {
      return defaultConfig;
    }
    return false;
  },
};