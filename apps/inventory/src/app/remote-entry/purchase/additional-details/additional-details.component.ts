import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'dfinance-frontend-additional-details',
  templateUrl: './additional-details.component.html',
  styleUrls: ['./additional-details.component.css'],
})
export class AdditionalDetailsComponent {
  showPopup = true;
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  itemDetails:any = []; 
  @Output() close = new EventEmitter<{}>();
  @Input() deliveryLocation: any[] = [];
  @Input() vehicleNoData: any[] = [];
  @Input() transportationTypes: any[] = [];
  @Input() additionalDetails: any = {};
  @Input() isdisabled:boolean = false;
  updatedDeliveryLocation = "";
  deliveryLocationReturnField = 'locationname';
  deliveryLocationKeys = ['ID','Location Name','Project Name','ContactPerson','Contact No','Address'];
  
  updatedVehicleNo = "";
  vehicleNoReturnField = 'vehicleNo';
  vehicleNoKeys = ['vehicleNo','Name','Code','ID'];
  
  additionalDetailsForm!: FormGroup;  

  modifiedAdditionalDetails = {
    entryNo:"",
    entryDate:"",
    referenceNo:"",
    referenceDate:"",
    name:"",
    expiryDate:"",
    transportationtype:"",
    period:"",
    vehicleNo:"",
    bankAddress:"",
    passNo:"",
    submitDate:"",
    documentNo:"",
    documentDate:"",
    partyName:"",
    address1:"",
    address2:"",
    recommendNote:"",
    address:""
  };
  constructor(
    private formBuilder: FormBuilder
  ){} 
  ngOnInit(): void {
    if (this.additionalDetails && Object.keys(this.additionalDetails).length > 0) {
      this.modifiedAdditionalDetails = JSON.parse(JSON.stringify(this.additionalDetails));
    }
    
    this.additionalDetailsForm = this.formBuilder.group({
      invoiceno:[{ value: this.modifiedAdditionalDetails?.entryNo, disabled: this.isdisabled }],
      invoicedate: [{ value: this.modifiedAdditionalDetails?.entryDate, disabled: this.isdisabled }],   
      orderno:[{ value: this.modifiedAdditionalDetails?.referenceNo, disabled: this.isdisabled }, Validators.required],
      orderdate: [{ value: this.modifiedAdditionalDetails?.referenceDate, disabled: this.isdisabled }],
      partyaddress: [{ value: this.modifiedAdditionalDetails?.name, disabled: this.isdisabled }, Validators.required],
      expirydate: [{ value: this.modifiedAdditionalDetails?.expiryDate, disabled: this.isdisabled }],
      transportationtype: [{ value: this.modifiedAdditionalDetails?.transportationtype, disabled: this.isdisabled }],
      creditperiod: [{ value: this.modifiedAdditionalDetails?.period, disabled: this.isdisabled }, Validators.required],
      vehicleno: [{ value: this.modifiedAdditionalDetails?.vehicleNo, disabled: this.isdisabled }, Validators.required],
      attention: [{ value: this.modifiedAdditionalDetails?.bankAddress, disabled: this.isdisabled }],
      deliverynote: [{ value: this.modifiedAdditionalDetails?.passNo, disabled: this.isdisabled }],
      deliverydate: [{ value: this.modifiedAdditionalDetails?.submitDate, disabled: this.isdisabled }],
      dispatchno: [{ value: this.modifiedAdditionalDetails?.documentNo, disabled: this.isdisabled }],
      dispatchdate: [{ value: this.modifiedAdditionalDetails?.documentDate, disabled: this.isdisabled }],
      partyname: [{ value: this.modifiedAdditionalDetails?.partyName, disabled: this.isdisabled }],
      addressline1: [{ value: this.modifiedAdditionalDetails?.address1, disabled: this.isdisabled }],
      addressline2: [{ value: this.modifiedAdditionalDetails?.address2, disabled: this.isdisabled }],
      deliverylocation: [{ value: this.modifiedAdditionalDetails?.recommendNote, disabled: this.isdisabled }],
      terms: [{ value: this.modifiedAdditionalDetails?.address, disabled: this.isdisabled }]
    });
    this.updatedDeliveryLocation = this.modifiedAdditionalDetails?.recommendNote;
    this.updatedVehicleNo = this.modifiedAdditionalDetails?.vehicleNo;console.log(this.modifiedAdditionalDetails);
  }

  onDeliveryLocationSelected(option:string){
    this.updatedDeliveryLocation = option;
    this.additionalDetailsForm.patchValue({
      "deliverylocation":option
    });
  }

  onVehicleNoSelected(option:string){
    this.updatedVehicleNo = option;
    this.additionalDetailsForm.patchValue({
      "vehicleno":option
    });
  }
  
  save(){
    this.showPopup = false;
    this.modifiedAdditionalDetails = {
      "entryNo":this.additionalDetailsForm.get('invoiceno')?.value,
      "entryDate":this.additionalDetailsForm.get('invoicedate')?.value,
      "referenceNo":this.additionalDetailsForm.get('orderno')?.value,
      "referenceDate":this.additionalDetailsForm.get('orderdate')?.value,
      "name":this.additionalDetailsForm.get('partyaddress')?.value,
      "expiryDate":this.additionalDetailsForm.get('expirydate')?.value,
      "transportationtype":this.additionalDetailsForm.get('transportationtype')?.value,
      "period":this.additionalDetailsForm.get('creditperiod')?.value,
      "vehicleNo":this.additionalDetailsForm.get('vehicleno')?.value,
      "bankAddress":this.additionalDetailsForm.get('attention')?.value,
      "submitDate":this.additionalDetailsForm.get('deliverydate')?.value,
      "passNo":this.additionalDetailsForm.get('deliverynote')?.value,
      "documentNo":this.additionalDetailsForm.get('dispatchno')?.value,
      "documentDate":this.additionalDetailsForm.get('dispatchdate')?.value,
      "partyName":this.additionalDetailsForm.get('partyname')?.value,
      "address1":this.additionalDetailsForm.get('addressline1')?.value,
      "address2":this.additionalDetailsForm.get('addressline2')?.value,
      "recommendNote":this.additionalDetailsForm.get('deliverylocation')?.value,
      "address":this.additionalDetailsForm.get('terms')?.value
    }
    this.close.emit(this.modifiedAdditionalDetails);    
  }
}
