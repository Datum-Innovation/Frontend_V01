import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { QRCodeModule } from 'angularx-qrcode';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  AuthInterceptorService,
  DateFormatDirective,
  MenuModule,
  NumberFormatDirective,
  SharedModule,
  TokenInterceptorService,
} from '@dfinance-frontend/shared';
import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { ItemmasterComponent } from './itemmaster/itemmaster.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { ImportReferencePopupComponent } from './purchase/import-reference-popup/import-reference-popup.component';
import { AdditionalDetailsComponent } from './purchase/additional-details/additional-details.component';
import { ItemDetailsPopupComponent } from './purchase/item-details-popup/item-details-popup.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UnitmasterComponent } from './unitmaster/unitmaster.component';
import { AreamasterComponent } from './areamaster/areamaster.component';
import { MastersCategoryComponent } from './masters-category/masters-category.component';
import { MastersCategorytypeComponent } from './masters-categorytype/masters-categorytype.component';
import { WarehouseMasterComponent } from './warehouse-master/warehouse-master.component';
import { ItemPricePopupComponent } from './purchase/item-price-popup/item-price-popup.component';
import { AdvancePopupComponent } from './purchase/advance-popup/advance-popup.component';
import { ReferenceItemListComponent } from './purchase/reference-item-list/reference-item-list.component';
import { ChequepopupComponent } from './purchase/chequepopup/chequepopup.component';
import { PricecategoryComponent } from './pricecategory/pricecategory.component';
import { TaxtypeComponent } from './taxtype/taxtype.component';
import { DosagemasterComponent } from './dosagemaster/dosagemaster.component';
import { LocationtypeComponent } from './locationtype/locationtype.component';
import { SizemasterComponent } from './sizemaster/sizemaster.component';
import { SalesInvoiceComponent } from './sales-invoice/sales-invoice.component';
import { RemarksPopupComponent } from './purchase/remarks-popup/remarks-popup.component';
import { ItemratesPopupComponent } from './purchase/itemrates-popup/itemrates-popup.component';
import { RelateditempopupComponent } from './purchase/relateditempopup/relateditempopup.component';
import { PricecategorypopupComponent } from './purchase/pricecategorypopup/pricecategorypopup.component';
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

@NgModule({
  declarations: [
    RemoteEntryComponent,
    NxWelcomeComponent,
    ItemmasterComponent,
    PurchaseComponent,
    ImportReferencePopupComponent,
    AdditionalDetailsComponent,
    ItemDetailsPopupComponent,
    UnitmasterComponent,
    AreamasterComponent,
    MastersCategoryComponent,
    MastersCategorytypeComponent,
    WarehouseMasterComponent,
    DateFormatDirective,
    NumberFormatDirective,
    ItemPricePopupComponent,
    AdvancePopupComponent,
    ReferenceItemListComponent,
    ChequepopupComponent,
    PricecategoryComponent,
    TaxtypeComponent,
    DosagemasterComponent,
    LocationtypeComponent,
    SizemasterComponent,
    SalesInvoiceComponent,
    RemarksPopupComponent,
    ItemratesPopupComponent,
    RelateditempopupComponent,
    PricecategorypopupComponent,
    PurchaseorderComponent,
    SalesestimateComponent,
    SalesquotationComponent,
    DeliveryoutComponent,
    GeneralregisterComponent,
    StocktransferComponent,
    StockissueComponent,
    DeliveryInComponent,
    PurchaseenquiryComponent,
    MaterialrequestComponent,
    PurchasereturnComponent,
    SalesreturnComponent,
    BranchitemsComponent,
    SalesorderComponent,
    OpeningstockComponent,
    StockadjustmentComponent,
    PurchaserequestComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(remoteRoutes),
    SharedModule,
    TabsModule.forRoot(),
    QRCodeModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
    DecimalPipe,
  ],
  exports: [
    RelateditempopupComponent,
    PricecategorypopupComponent,
    PurchaseorderComponent,
    SalesestimateComponent,
    SalesquotationComponent,
    DeliveryoutComponent,
    GeneralregisterComponent,
    SalesorderComponent,
  ],
})
export class RemoteEntryModule {}
