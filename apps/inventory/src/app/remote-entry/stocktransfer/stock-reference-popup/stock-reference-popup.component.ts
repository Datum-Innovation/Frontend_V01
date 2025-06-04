import { EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class StockReferencePopupComponent{

    showPopup=true;
    today = new Date();
    modifiedArray: any = [];
    @Output() close = new EventEmitter<void>();
    @Input() voucherTypes: any[] = [];
    @Input() partyData: any[] = [];

    referenceSearchForm!: FormGroup;
    updatedSupplier="";
    supplierreturnField = 'id';
    supplierKeys = ['Account Code', 'Account Name', 'Address', 'ID', 'Mobile No', 'VAT No'];
    selectedPartyId = 0;
    filteredData:any = [];

    constructor(
        private formBuilder: FormBuilder,
     )
     {

     }

    ngOnInit(): void {
       // this.modifiedArray = JSON.parse(JSON.stringify(this.referenceData));
        this.referenceSearchForm = this.formBuilder.group({
          vouchertype: [''],
          voucherno: [''],
          voucherdate: [this.today, Validators.required],
          party: [""],
        });
        this.setReferenceData();
      }
    

    cancelItems(){
        this.showPopup = false;
        this.close.emit();
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

      setReferenceData(){
        const { vouchertype, voucherno, voucherdate, party } = this.referenceSearchForm.value;
        this.filteredData = this.modifiedArray.filter((item:any)=> {
        // Check if at least one filter is provided
        const hasFilters = vouchertype || voucherno || voucherdate || party;
    
        if (!hasFilters) {
          return false;
        }
          let matches = true;
    
          if (vouchertype) {
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
}