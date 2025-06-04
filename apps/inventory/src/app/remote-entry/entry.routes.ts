import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry.component';
import { ItemmasterComponent } from './itemmaster/itemmaster.component';
import { AuthGuard } from 'libs/src/lib/auth.guard';
import { UnsavedChangesGuard } from 'libs/src/lib/unsaved-changes.guard';
import { PurchaseComponent } from './purchase/purchase.component';
import { UnitmasterComponent } from './unitmaster/unitmaster.component';
import { AreamasterComponent } from './areamaster/areamaster.component';
import { MastersCategoryComponent } from './masters-category/masters-category.component';
import { MastersCategorytypeComponent } from './masters-categorytype/masters-categorytype.component';
import { WarehouseMasterComponent } from './warehouse-master/warehouse-master.component';
import { PricecategoryComponent } from './pricecategory/pricecategory.component';
import { TaxtypeComponent } from './taxtype/taxtype.component';
import { DosagemasterComponent } from './dosagemaster/dosagemaster.component';
import { LocationtypeComponent } from './locationtype/locationtype.component'; 
import { SizemasterComponent } from './sizemaster/sizemaster.component';
import { SalesInvoiceComponent } from './sales-invoice/sales-invoice.component';
import { PurchaseorderComponent } from './purchaseorder/purchaseorder.component';
import { SalesestimateComponent } from './salesestimate/salesestimate.component';
import { SalesquotationComponent } from './salesquotation/salesquotation.component';
import { DeliveryoutComponent } from './deliveryout/deliveryout.component';
import { GeneralregisterComponent } from './generalregister/generalregister.component';
import { StocktransferComponent } from './stocktransfer/stocktransfer.component';
import { StockissueComponent } from './stockissue/stockissue.component';
import { DeliveryInComponent } from './deliveryIn/delivery-in.component';
import { PurchaseenquiryComponent } from './purchaseenquiry/purchaseenquiry.component';
import { MaterialrequestComponent } from './materialrequest/materialrequest.component';
import { PurchasereturnComponent } from './purchasereturn/purchasereturn.component';
import { SalesreturnComponent } from './salesreturn/salesreturn.component';
import { BranchitemsComponent } from './branchitems/branchitems.component';
import { SalesorderComponent } from './salesorder/salesorder.component';
import { OpeningstockComponent } from './openingstock/openingstock.component';
import { StockadjustmentComponent } from './stockadjustment/stockadjustment.component';
import { PurchaserequestComponent } from './purchaserequest/purchaserequest.component';

export const remoteRoutes: Route[] = [
  { path: '', component: RemoteEntryComponent },  
  { path: 'masters/itemmaster', component: ItemmasterComponent, canActivate: [AuthGuard] },
  { path: 'transactions/purchase/purchase', component: PurchaseComponent,canDeactivate: [UnsavedChangesGuard] },
  { path: 'masters/unitmaster', component: UnitmasterComponent, canActivate: [AuthGuard] },
  { path: 'masters/areamaster', component: AreamasterComponent, canActivate: [AuthGuard] },
  { path: 'masters/category', component: MastersCategoryComponent, canActivate: [AuthGuard] },
  { path: 'masters/categorytype', component: MastersCategorytypeComponent, canActivate: [AuthGuard] },
  { path: 'masters/warehousemaster', component: WarehouseMasterComponent, canActivate: [AuthGuard] },
  { path: 'masters/pricecategory', component:PricecategoryComponent, canActivate: [AuthGuard]},
  { path: 'masters/taxtype', component: TaxtypeComponent, canActivate: [AuthGuard] },
  { path: 'masters/dosagemaster',component: DosagemasterComponent,canActivate: [AuthGuard]},
  { path: 'masters/locationtypes',component: LocationtypeComponent,canActivate: [AuthGuard]},
  { path:'masters/sizemaster',component:SizemasterComponent,canActivate:[AuthGuard]},
  { path:'transactions/sales/salesinvoice',component:SalesInvoiceComponent,canActivate:[AuthGuard],canDeactivate: [UnsavedChangesGuard]},
  { path: 'transactions/purchase/purchaseorder', component: PurchaseorderComponent, canActivate: [AuthGuard],canDeactivate: [UnsavedChangesGuard] },
  { path: 'transactions/sales/salesestimate', component: SalesestimateComponent, canActivate: [AuthGuard],canDeactivate: [UnsavedChangesGuard] },
  { path: 'transactions/sales/salesquotation', component: SalesquotationComponent, canActivate: [AuthGuard],canDeactivate: [UnsavedChangesGuard] },
  { path: 'transactions/sales/deliveryout', component: DeliveryoutComponent, canActivate: [AuthGuard],canDeactivate: [UnsavedChangesGuard] },
  { path: 'reports/generalregister', component: GeneralregisterComponent, canActivate: [AuthGuard] },
  { path: 'transactions/stock/stocktransfer', component: StocktransferComponent, canActivate: [AuthGuard] },
  { path: 'transactions/stock/stockissue', component: StockissueComponent, canActivate: [AuthGuard] },
  { path: 'transactions/purchase/deliveryin', component: DeliveryInComponent, canActivate: [AuthGuard] },
  { path: 'transactions/purchase/purchaseenquiry', component: PurchaseenquiryComponent, canActivate: [AuthGuard] },
  { path: 'transactions/purchase/materialrequest', component: MaterialrequestComponent, canActivate: [AuthGuard] },
  { path: 'transactions/purchasereturn', component: PurchasereturnComponent, canActivate: [AuthGuard] },
  { path: 'transactions/salesreturn', component: SalesreturnComponent, canActivate: [AuthGuard] },
  { path:'masters/branchitems',component:BranchitemsComponent,canActivate:[AuthGuard]},
  { path:'transactions/sales/salesorder',component:SalesorderComponent,canActivate:[AuthGuard]},
  { path:'transactions/stock/stockadjustment',component:StockadjustmentComponent,canActivate:[AuthGuard]},
  { path: 'transactions/stock/openingstock', component: OpeningstockComponent, canActivate: [AuthGuard]},
  { path: 'transactions/purchase/purchaserequest', component: PurchaserequestComponent, canActivate: [AuthGuard] },
];