import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { CurrencyComponent } from './currency/currency.component';
import {
  AuthInterceptorService,
  SharedModule,
  TokenInterceptorService,
} from '@dfinance-frontend/shared';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CardMasterComponent } from './card-master/card-master.component';
import { FinancialYearComponent } from './financial-year/financial-year.component';
import { AccountlistComponent } from './accountlist/accountlist.component';
import { LedgersComponent } from './ledgers/ledgers.component';
import { AccountconfigurationComponent } from './accountconfiguration/accountconfiguration.component';
import { JournalvoucherComponent } from './journalvoucher/journalvoucher.component';
import { DebitnoteComponent } from './debitnote/debitnote.component';
import { CreditnoteComponent } from './creditnote/creditnote.component';
import { AdvancepopupComponent } from './creditnote/advancepopup/advancepopup.component';
import { JournalAdvancePopupComponent } from './journalvoucher/journal-advance-popup/journal-advance-popup.component';
import { ContravoucherComponent } from './contravoucher/contravoucher.component';
import { PaymentvoucherComponent } from './paymentvoucher/paymentvoucher.component';
import { ChequepopupComponent } from './paymentvoucher/chequepopup/chequepopup.component';
import { AccountStatementComponent } from './statements/accountStatement/account-statement.component';
import { DayBookComponent } from './statements/dayBook/day-book.component';
import { ReceiptvoucherComponent } from './receiptvoucher/receiptvoucher.component';

@NgModule({
  declarations: [
    RemoteEntryComponent,
    NxWelcomeComponent,
    CurrencyComponent,
    CardMasterComponent,
    FinancialYearComponent,
    AccountlistComponent,
    LedgersComponent,
    AccountconfigurationComponent,
    JournalvoucherComponent,
    CreditnoteComponent,
    DebitnoteComponent,
    AdvancepopupComponent,
    JournalAdvancePopupComponent,
    ContravoucherComponent,
    PaymentvoucherComponent,
    ChequepopupComponent,
    AccountStatementComponent,
    DayBookComponent,
    ReceiptvoucherComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild(remoteRoutes),
    MatDialogModule
  ],
  providers: [
    SharedModule,
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
    DatePipe,
  ],
  exports: [ReceiptvoucherComponent],
})
export class RemoteEntryModule {}
