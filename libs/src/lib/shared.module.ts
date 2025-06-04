import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BaseService } from './services/base.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpClient,
} from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { StoreModule } from '@ngrx/store';
import * as fromCounter from './+state/counter/counter.reducer';
export * from './+state/counter/counter.actions';
import * as fromLogin from './+state/login/login.reducer';
import * as fromMenu from './+state/menu/menu.reducer';
// import {MenuEffects} from './+state/menu/menu.effects';
export * from './+state/menu/menu.actions';
import { CustomMaterialModule } from './shared/custom-material.module';
export * from './+state/login/login.actions';
export * from './validators/custom.validator';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SearchableDropdownComponent } from './searchable-dropdown/searchable-dropdown.component';
import { LanguageLocalizationComponent } from './components/language-localization/language-localization.component';
import { MainHeaderComponent } from './components/main-header/main-header.component';
import { MenuModule } from './menu/menu.module';
import { LoaderComponent } from './components/loader/loader.component';
import { AuthInterceptorService } from './services/auth/auth-interceptor.service';
import { MultiSelectDropdownComponent } from './multi-select-dropdown/multi-select-dropdown.component';
import { GridandlabelsettingsComponent } from './components/gridandlabelsettings/gridandlabelsettings.component';
import { GridNavigationService } from './services/gridnavigation.service';
import { MenuDataService } from './services/menudata.service';
import { InputValidationService } from './services/input-validation.service';
import { CustomDialogueComponent } from './components/custom-dialogue/custom-dialogue.component';
import { SecondaryMenuComponent } from './components/secondary-menu/secondary-menu.component';
import { RouterModule } from '@angular/router';
import { AccountPopupComponent } from './components/account-popup/account-popup.component';
import { PdfGenerationService } from './services/pdfgeneration.service';

@NgModule({
  declarations: [
    SearchableDropdownComponent,
    LanguageLocalizationComponent,
    MainHeaderComponent,
    LoaderComponent,
    MultiSelectDropdownComponent,
    GridandlabelsettingsComponent,
    CustomDialogueComponent,
    SecondaryMenuComponent,
    AccountPopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CustomMaterialModule,
    MenuModule,
    StoreModule.forFeature(
      fromCounter.COUNTER_FEATURE_KEY,
      fromCounter.counterReducer
    ),
    StoreModule.forFeature(fromLogin.LOGIN_FEATURE_KEY, fromLogin.loginReducer),
    StoreModule.forFeature(fromMenu.MENU_FEATURE_KEY, fromMenu.menuReducer),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    RouterModule,
    MatDialogModule
  ],
  exports: [
    SearchableDropdownComponent,
    LanguageLocalizationComponent,
    MainHeaderComponent,
    LoaderComponent,
    CustomMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxDatatableModule,
    TranslateModule,
    BsDropdownModule,
    MultiSelectDropdownComponent,
    GridandlabelsettingsComponent,
    CustomDialogueComponent,
    SecondaryMenuComponent,
    AccountPopupComponent
  ],
  providers: [
    BaseService,
    GridNavigationService,
    InputValidationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    MenuDataService,
    DecimalPipe,
    PdfGenerationService
  ],
})
export class SharedModule {}
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
