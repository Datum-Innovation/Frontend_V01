import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { AuthGuard } from 'libs/src/lib/auth.guard';
import { CurrencyComponent } from './currency/currency.component';
import { CardMasterComponent } from './card-master/card-master.component';
import { FinancialYearComponent } from './financial-year/financial-year.component';
import { AccountlistComponent } from './accountlist/accountlist.component';
import { LedgersComponent } from './ledgers/ledgers.component';
import { AccountconfigurationComponent } from './accountconfiguration/accountconfiguration.component';
import { JournalvoucherComponent } from './journalvoucher/journalvoucher.component';
import { CreditnoteComponent } from './creditnote/creditnote.component';
import { DebitnoteComponent } from './debitnote/debitnote.component';
import { ContravoucherComponent } from './contravoucher/contravoucher.component';
import { PaymentvoucherComponent } from './paymentvoucher/paymentvoucher.component';
import { AccountStatementComponent } from './statements/accountStatement/account-statement.component';
import { DayBookComponent } from './statements/dayBook/day-book.component';
import { ReceiptvoucherComponent } from './receiptvoucher/receiptvoucher.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent, canActivate: [AuthGuard] },
  { path: 'masters/currency', component: CurrencyComponent, canActivate: [AuthGuard] },  
  { path: 'masters/cardmaster', component: CardMasterComponent, canActivate: [AuthGuard] },
  { path: 'masters/financeyear', component: FinancialYearComponent, canActivate: [AuthGuard] },
  { path: 'masters/accountlist', component: AccountlistComponent, canActivate: [AuthGuard] },
  { path: 'masters/ledgers', component: LedgersComponent, canActivate: [AuthGuard] },
  { path: 'masters/accountconfiguration', component: AccountconfigurationComponent, canActivate: [AuthGuard] },
  { path: 'vouchers/journalvoucher', component: JournalvoucherComponent, canActivate: [AuthGuard] }, 
  { path: 'vouchers/creditnote',component: CreditnoteComponent,canActivate:[AuthGuard]},
  { path: 'vouchers/debitnote',component: DebitnoteComponent,canActivate:[AuthGuard]},
  { path: 'vouchers/contravoucher',component: ContravoucherComponent,canActivate:[AuthGuard]},
  { path: 'vouchers/paymentvoucher',component: PaymentvoucherComponent,canActivate:[AuthGuard]},
  { path: 'statements/accountstatement', component: AccountStatementComponent, canActivate: [AuthGuard] },
 { path: 'statements/daybook', component: DayBookComponent, canActivate: [AuthGuard] },
 { path: 'vouchers/receiptvoucher', component: ReceiptvoucherComponent, canActivate: [AuthGuard] }
];
