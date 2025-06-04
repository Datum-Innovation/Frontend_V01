import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { EndpointConstant } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Reference} from '../../model/purchase.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'dfinance-frontend-import-reference-popup',
  templateUrl: './import-reference-popup.component.html',
  styleUrls: ['./import-reference-popup.component.css'],
})
export class ImportReferencePopupComponent {
  showPopup = true;
  destroySubscription: Subject<void> = new Subject<void>();
  @Input() referenceData:any[] = []
  @Input() voucherTypes: any[] = [];
  @Input() partyData: any[] = [];
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  itemDetails:any = []; 
  @Output() close = new EventEmitter<void>();
  @Output() savereference = new EventEmitter<any[]>();
  @ViewChild('okbutton') okButton!: ElementRef;
  @ViewChild('cancelbutton') cancelbutton!: ElementRef;
  voucherNo = 0;
  referenceFillData = [] as Array<Reference>;
  referenceItemList = [] as Array<Reference>;
  
  referenceSearchForm!: FormGroup;
  modifiedArray: any = [];
  today = new Date();
  updatedSupplier="";
  supplierreturnField = 'id';
  supplierKeys = ['Account Code', 'Account Name', 'Address', 'ID', 'Mobile No', 'VAT No'];
  selectedPartyId = 0;

  filteredData:any = [];
  showReferenceItemList = false;

  itemListArray:any = [];
  transactionId:number = 0;

  selectedReferenceArray:any = [];
  isOverwriteVoucher = true;
  referenceWithItemsArr:any = [];
  referenceVNoArray:any = [];
  constructor(    
    private PurchaseService: PurchaseService,
    private route: ActivatedRoute,    
    private formBuilder: FormBuilder,    
    private renderer: Renderer2
  ){
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['voucherNo']) {
      this.voucherNo = queryParams['voucherNo'];
    }
  }
  ngOnInit(): void {
    this.modifiedArray = JSON.parse(JSON.stringify(this.referenceData));
    this.referenceSearchForm = this.formBuilder.group({
      vouchertype: ['all'],
      voucherno: [''],
      voucherdate: [this.today, Validators.required],
      party: [""],
    });
    this.setReferenceData();
  }

  setReferenceData(){
    const { vouchertype, voucherno, voucherdate, party } = this.referenceSearchForm.value;
    this.filteredData = this.modifiedArray.filter((item:any)=> {
    // Check if at least one filter is provided
    const hasFilters = vouchertype || voucherno || voucherdate || party;

    if (!hasFilters) {
      return false;
    }
      let matches = true;

      // Handle 'vouchertype' filter, returning all items if 'vouchertype' is 'all'
      if (vouchertype && vouchertype.toLowerCase() !== 'all') {
        matches = matches && item.voucherType.toLowerCase().includes(vouchertype.toLowerCase());
      }

      if (voucherno) {
        matches = matches && item.vNo.toLowerCase().includes(voucherno.toLowerCase());
      }

      if (voucherdate) {
        matches = matches && item.vDate.includes(this.formatDate(voucherdate));
      }

      if (party) {
        matches = matches && item.accountName.toLowerCase().includes(party.toLowerCase());
      }

      return matches;
    });
    
  }

  onSupplierSelected(option: any): any {
    if(option == ""){
      this.updatedSupplier = "";
      this.selectedPartyId = 0;
      this.referenceSearchForm.patchValue({
        party: ""
      });
    } else{
      this.selectedPartyId = option;
      this.partyData.forEach((item) => {
        if (item.id === option) {
          this.referenceSearchForm.patchValue({
            party: item.accountName
          });
          this.updatedSupplier = item.accountName;
        }
      });
    }    
  }

  formatDate(date:any) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero based
    const day = ('0' + date.getDate()).slice(-2);
    
    // Create ISO 8601 string in UTC without milliseconds or 'Z' (UTC indicator)
    return `${year}-${month}-${day}T00:00:00`;
  }

  onChangeSelection(event:Event,rowIndex:any,ID:number){
    let input = event.target as HTMLInputElement;
    let selected = input.checked;
    this.filteredData[rowIndex]['sel'] = selected;
    this.filteredData[rowIndex]['addItem'] = selected;
    if(selected){
      this.selectedReferenceArray.push(this.filteredData[rowIndex]);
      this.fetchReferenceItemList(ID);
    } else{
      this.selectedReferenceArray = this.selectedReferenceArray.filter((item:any) => item.id !== ID);
      //remove subitems under this transaction id..
      delete this.referenceWithItemsArr[ID];
    }
  }

  fetchReferenceItemList(transactionId:number){
    this.transactionId = transactionId;
    this.PurchaseService
    .saveDetails(EndpointConstant.FILLREFERENCEITEMLIST+transactionId+'&voucherId='+this.voucherNo,{})
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.referenceItemList = response?.data; 
        // Set each item's selection to true
        this.referenceItemList.forEach((item:any) => item.selected = true);
        
        this.referenceWithItemsArr[transactionId] = this.referenceItemList;
        // this.renderer.setStyle(document.body, 'overflow', 'hidden');
        // this.showReferenceItemList = true;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    }); 
  }

  onClickAddItem(rowIndex:any,ID:number){
      //call reference Item list api...
      if(this.referenceWithItemsArr[ID]){
        this.referenceItemList = this.referenceWithItemsArr[ID];
      } else{
        this.fetchReferenceItemList(ID);
      }
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      this.showReferenceItemList = true;
  }

  onChangeOverwriteOption(event:Event){
    let input = event.target as HTMLInputElement;
    this.isOverwriteVoucher = input.checked;
  }

  saveItemList(items: any[]) { 
    this.renderer.removeStyle(document.body, 'overflow');
    this.showReferenceItemList = false;
    //if items is not empty save this to itemlistArray...
    this.referenceWithItemsArr[this.transactionId] = items;
  }

  closeImportReference() { 
    this.renderer.removeStyle(document.body, 'overflow');
    this.showReferenceItemList = false;
  }

  importItems(){
    this.showPopup = false;
    this.referenceWithItemsArr.forEach((itemsArr:any,refID:any) => {     
      let referItemArr:any = [];
      itemsArr.forEach((element:any) =>{
        if(element?.selected){
          this.itemListArray.push(element);
          referItemArr.push(element);
        }
      });      
      //add selected items to selectedReferenceArray
      // Update selectedReferenceArray: Add/Update refItems if ID matches; Remove if not
      this.selectedReferenceArray = this.selectedReferenceArray.filter((item: any) => {
        if (item.id === refID) {
          // Update the matching item's refItems and referenceVNoArray
          item.refItems = referItemArr;
          if (!this.referenceVNoArray.includes(item.vNo)) {
            this.referenceVNoArray.push(item.vNo);
          }
          return true; // Keep this item in the array
        }
        return false; // Remove items that don't match the ID
      });

      
    });
    let response:any = {
      "referenceList" : this.selectedReferenceArray,
      "referenceVNoList" : this.referenceVNoArray,
      "itemListArray" :this.itemListArray,
      "isOverwriteVoucher" : this.isOverwriteVoucher
    };
    this.savereference.emit(response);    
  }
  cancelItems(){
    this.showPopup = false;
    this.close.emit();
  }

  handleOkbuttonkeydown(event: KeyboardEvent) {
    // Check if the Enter key is pressed and the focus is on the OK button
    if (event.key === 'Enter' && document.activeElement === this.okButton.nativeElement) {
      this.importItems();
    } else if (event.key == 'ArrowRight'){
      if (this.cancelbutton) {
        this.cancelbutton.nativeElement.focus();
      }
    }
  }

  handleCancelbuttonkeydown(event: KeyboardEvent) {
    // Check if the Enter key is pressed and the focus is on the OK button
    if (event.key === 'Enter' && document.activeElement === this.cancelbutton.nativeElement) {
      this.cancelItems();
    } else if (event.key == 'ArrowLeft'){
      if (this.okButton) {
        this.okButton.nativeElement.focus();
      }
    }
  }


}
