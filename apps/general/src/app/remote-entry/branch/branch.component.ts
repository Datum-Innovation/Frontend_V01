import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BranchService } from '../../services/branch.service';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService, minLengthValidator, selectToken } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { Branch, BranchType, Branches, ContactPerson, Country } from '../model/branch.interface';
import { ActivatedRoute, Router } from '@angular/router';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css'],
})
export class BranchComponent implements OnInit,OnDestroy{
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('scrollableDivLeft') scrollableDivLeft!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  branchForm!: FormGroup;    
  selectedContactPerson = {} as ContactPerson;
  selectedBranchType = {} as BranchType;
  selectedCountry = {} as Country;
  contactPerson = [] as Array<ContactPerson>;
  allBranches = [] as Array<Branches>;
  branchType:BranchType[] = [
    {
    "value":"HO",
    "name":"Head Office"
    },
    {
    "value":"BO",
    "name":"Branch Office"
    }];
  countries = [] as Array<Country>;  
  selectedContactPersonId!: number;
  selectedBranchTypeId!: string;
  selectedCountryId!: string;
  selectedBranchId!: number;
  firstBranch!:number;
  isActive: number = 0;
  currentBranch = {} as Branch;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;

  imageData: string | ArrayBuffer | null = null;
  showImageContainer = true;
  pageId = 0;
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  constructor(
    private formBuilder: FormBuilder,    
    private branchService: BranchService,
    private store: Store,
    private router:Router,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService:BaseService
  ){
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];      
      this.fetchMenuDataPermissions();
    }
  }

  ngOnInit(): void {
    this.branchForm = this.formBuilder.group({      
      hocompanyname:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      hoarabicname:[{value:'',disabled:this.isInputDisabled}],
      branchtype: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      isactive:[{value:'',disabled:this.isInputDisabled}],
      companyname: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      arabicname:[{value:'',disabled:this.isInputDisabled}],
      telephone:[{value:'',disabled:this.isInputDisabled}],
      mobile:[{value:'',disabled:this.isInputDisabled}],
      faxno:[{value:'',disabled:this.isInputDisabled}],
      country: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      addresslineone: [{value:'',disabled:this.isInputDisabled}, [Validators.required,minLengthValidator(1)]],
      addresslinetwo: [{value:'',disabled:this.isInputDisabled}],
      city: [{value:'',disabled:this.isInputDisabled}],
      emailaddress:[{value:'',disabled:this.isInputDisabled}],
      pobox:[{value:'',disabled:this.isInputDisabled}],
      district:[{value:'',disabled:this.isInputDisabled}],
      buildingno:[{value:'',disabled:this.isInputDisabled}],
      countrycode:[{value:'',disabled:this.isInputDisabled}],
      province:[{value:'',disabled:this.isInputDisabled}],
      vatno:[{value:'',disabled:this.isInputDisabled}],
      centralsalestaxno:[{value:'',disabled:this.isInputDisabled}],
      contactperson: [{value:'',disabled:this.isInputDisabled}, Validators.required],
      remarks:[{value:'',disabled:this.isInputDisabled}],
      dl1:[{value:'',disabled:this.isInputDisabled}],
      dl2:[{value:'',disabled:this.isInputDisabled}],
      uniqueid:[{value:'',disabled:this.isInputDisabled}],
      reference:[{value:'',disabled:this.isInputDisabled}],
      bankcode:[{value:'',disabled:this.isInputDisabled}]
    });
    this.fetchAllBranches();
    this.fetchContactPerson();
    this.fetchCountries();
  }

  setInitialState(){
    this.isNewBtnDisabled = false;
    this.isEditBtnDisabled = false;
    this.isDeleteBtnDisabled = false; 
    this.isSaveBtnDisabled = true; 
    this.isInputDisabled = true;
    this.isUpdate = false;    
    this.disbaleFormControls();
  }

  onContactPersonSelect(): void {
    this.selectedContactPersonId = this.branchForm?.get('contactperson')?.value;
    this.selectedContactPerson = this.contactPerson?.find(obj => obj?.id == this.selectedContactPersonId) as ContactPerson;
  }

  onBranchTypeSelect(): void {
    this.selectedBranchTypeId = this.branchForm?.get('branchtype')?.value;
    this.selectedBranchType = this.branchType?.find(obj => obj?.value == this.selectedBranchTypeId) as BranchType;
  }

  onCountrySelect(): void {
    this.selectedCountryId = this.branchForm?.get('country')?.value;
    this.selectedCountry = this.countries?.find(obj => obj?.value == this.selectedCountryId) as Country;
  }
  onActiveChange(event: any) {
    this.isActive = event.target.checked ? 1 : 0;
  }

  fetchContactPerson(): void {
    this.branchService
    .getDetails(EndpointConstant.CONTACTPERSON)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.contactPerson = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchCountries(): void {
    this.branchService
    .getDetails(EndpointConstant.FILLCOUNTRY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.countries =  response?.data[0];
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchMenuDataPermissions(){
    let menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
    this.isView = menuData.isView;
    this.isCreate = menuData.isCreate;
    this.isEdit = menuData.isEdit;
    this.isDelete = menuData.isDelete;
    this.isCancel = menuData.isCancel;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }

  fetchAllBranches(): void {
    //this.isLoading = true;
    console.log("Branch api:"+EndpointConstant.FILLALLBRANCH)
    this.branchService
    .getDetails(EndpointConstant.FILLALLBRANCH)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allBranches = response?.data;
        //this.setBranches();
        this.selectedBranchId = this.allBranches[0].id;
        this.firstBranch = this.allBranches[0].id;
        this.fetchBranchById();
        //this.isLoading = false;
      },
      error: (error) => {
        console.error('An Error Occured', error);
       
      },
    });
  }

  setBranches():void{
     // Create the table
     $(this.table.nativeElement).DataTable({
      data: this.allBranches,
      columns: [
        { title: 'Nature', data: 'nature' },
        { title: 'Company', data: 'company' }
      ]
    });
  }

  onClickBranch(event:any): void {
    if (event.type === 'click') {
      this.selectedBranchId = event.row.id;
      this.fetchBranchById();
    }
  }

  fetchBranchById(): void {
   // this.isLoading = true;
    this.branchService
    .getDetails(EndpointConstant.FILLALLBRANCHBYID  +this.selectedBranchId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentBranch = response?.data;
        this.branchForm.patchValue({
          hocompanyname: this.currentBranch.hoCompanyName,
          hoarabicname: this.currentBranch.hoCompanyNameArabic,
          branchtype: this.currentBranch.nature, // Adjust as per your data structure
          companyname: this.currentBranch.company,
          isactive:this.currentBranch.activeFlag,
          arabicname:this.currentBranch.arabicName,
          telephone:this.currentBranch.telephoneNo,
          mobile:this.currentBranch.mobileNo,
          faxno:this.currentBranch.faxNo,
          country: this.currentBranch.country,
          addresslineone: this.currentBranch.addressLineOne,
          addresslinetwo: this.currentBranch.addressLineTwo,
          city: this.currentBranch.city,
          emailaddress:this.currentBranch.emailAddress,
          pobox:this.currentBranch.poBox,
          district:this.currentBranch.district,
          buildingno:this.currentBranch.bulidingNo,
          countrycode:this.currentBranch.countryCode,
          province:this.currentBranch.province,
          vatno:this.currentBranch.salesTaxNo,
          centralsalestaxno:this.currentBranch.centralSalesTaxNo,
          contactperson: this.currentBranch.contactPersonID,
          remarks:this.currentBranch.remarks,
          dl1:this.currentBranch.dL1,
          dl2:this.currentBranch.dL2,
          uniqueid:this.currentBranch.uniqueID,
          reference:this.currentBranch.reference,
          bankcode:this.currentBranch.bankCode
        });
        this.onBranchTypeSelect();
        this.onContactPersonSelect();
        this.onCountrySelect();
        //this.isLoading = false;
      },
      error: (error) => {
       // this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewBranch(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    } 
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.branchForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedBranchId = this.firstBranch;
      this.fetchBranchById();
    } else{
      this.selectedBranchId = 0;
      this.enableFormControls();
    }
    return true;
  }

  onClickEditBranch(){
    if(!this.isEdit){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    } 
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    if(this.isInputDisabled == false){
      this.enableFormControls();
    } else{
      this.disbaleFormControls();
    }
    this.fetchBranchById();
    return true;
  }

  onClickDeleteBranch(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    } 
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.branchService.deleteDetails(EndpointConstant.DELETEBRANCH+this.selectedBranchId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedBranchId = this.firstBranch;
          this.fetchAllBranches();
          this.setInitialState();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
    }
    return true;
  }

  onClickSaveBranch() {
    if (this.branchForm.invalid) {
      for (const field of Object.keys(this.branchForm.controls)) {
        const control: any = this.branchForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    this.isLoading = true;
    const payload = {      
      hocompanyName: this.branchForm.value.hocompanyname,    
      hocompanyNameArabic: this.branchForm.value.hoarabicname, 
      branchType: {
        key:this.selectedBranchTypeId,
        value:this.selectedBranchType?.name
      },          
      active: this.branchForm.value.isactive ? 1: 0,
      companyName: this.branchForm.value.companyname,
      arabicName: this.branchForm.value.arabicname,      
      telephone: this.branchForm.value.telephone,     
      mobile: this.branchForm.value.mobile,
      faxNo: this.branchForm.value.faxno,
      country: {
        id:this.selectedCountry?.id,
        value:this.selectedCountry?.value
      }, 
      addressLineOne: this.branchForm.value.addresslineone,
      addressLineTwo: this.branchForm.value.addresslinetwo,
      city: this.branchForm.value.city,     
      emailAddress: this.branchForm.value.emailaddress, 
      pObox: this.branchForm.value.pobox,     
      district: this.branchForm.value.district,   
      buildingNo: this.branchForm.value.buildingno,  
      countryCode: this.branchForm.value.countrycode,  
      province: this.branchForm.value.province,      
      vatNo: this.branchForm.value.vatno,  
      centralSalesTaxNo: this.branchForm.value.centralsalestaxno,    
      contactPerson: {
        id:this.selectedContactPersonId,
        name:this.selectedContactPerson?.name
      },
      remarks: this.branchForm.value.remarks,
      dl1: this.branchForm.value.dl1,     
      dl2: this.branchForm.value.dl2,                 
      uniqueId: this.branchForm.value.uniqueid,     
      reference: this.branchForm.value.reference,     
      bankCode: this.branchForm.value.bankcode,   
    };
    if(this.isUpdate){
      this.updateCallback(payload,this.selectedBranchId);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any,branchId:any){
    console.log("branch payload:"+JSON.stringify(payload,null,2))
    this.branchService.updateDetails(EndpointConstant.UPDATEBRANCH + branchId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedBranchId = this.firstBranch;
          this.fetchBranchById();
          this.fetchAllBranches();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.branchService.saveDetails(EndpointConstant.SAVEBRANCH,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedBranchId = this.firstBranch;
          this.fetchBranchById();
          this.fetchAllBranches();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving branch', error);
        },
      });
  }

  enableFormControls(){
    this.branchForm.get('hocompanyname')?.enable();
    this.branchForm.get('hoarabicname')?.enable();
    this.branchForm.get('branchtype')?.enable();
    this.branchForm.get('isactive')?.enable();
    this.branchForm.get('companyname')?.enable();
    this.branchForm.get('arabicname')?.enable();
    this.branchForm.get('telephone')?.enable();
    this.branchForm.get('mobile')?.enable();
    this.branchForm.get('faxno')?.enable();
    this.branchForm.get('country')?.enable();
    this.branchForm.get('addresslineone')?.enable();
    this.branchForm.get('addresslinetwo')?.enable();
    this.branchForm.get('city')?.enable();
    this.branchForm.get('emailaddress')?.enable();
    this.branchForm.get('pobox')?.enable();
    this.branchForm.get('district')?.enable();
    this.branchForm.get('buildingno')?.enable();
    this.branchForm.get('countrycode')?.enable();
    this.branchForm.get('province')?.enable();
    this.branchForm.get('vatno')?.enable();
    this.branchForm.get('centralsalestaxno')?.enable();
    this.branchForm.get('contactperson')?.enable();
    this.branchForm.get('remarks')?.enable();
    this.branchForm.get('dl1')?.enable();
    this.branchForm.get('dl2')?.enable();
    this.branchForm.get('uniqueid')?.enable();
    this.branchForm.get('reference')?.enable();
    this.branchForm.get('bankcode')?.enable();
  }

  disbaleFormControls(){
    this.branchForm.get('hocompanyname')?.disable();
    this.branchForm.get('hoarabicname')?.disable();
    this.branchForm.get('branchtype')?.disable();
    this.branchForm.get('isactive')?.disable();
    this.branchForm.get('companyname')?.disable();
    this.branchForm.get('arabicname')?.disable();
    this.branchForm.get('telephone')?.disable();
    this.branchForm.get('mobile')?.disable();
    this.branchForm.get('faxno')?.disable();
    this.branchForm.get('country')?.disable();
    this.branchForm.get('addresslineone')?.disable();
    this.branchForm.get('addresslinetwo')?.disable();
    this.branchForm.get('city')?.disable();
    this.branchForm.get('emailaddress')?.disable();
    this.branchForm.get('pobox')?.disable();
    this.branchForm.get('district')?.disable();
    this.branchForm.get('buildingno')?.disable();
    this.branchForm.get('countrycode')?.disable();
    this.branchForm.get('province')?.disable();
    this.branchForm.get('vatno')?.disable();
    this.branchForm.get('centralsalestaxno')?.disable();
    this.branchForm.get('contactperson')?.disable();
    this.branchForm.get('remarks')?.disable();
    this.branchForm.get('dl1')?.disable();
    this.branchForm.get('dl2')?.disable();
    this.branchForm.get('uniqueid')?.disable();
    this.branchForm.get('reference')?.disable();
    this.branchForm.get('bankcode')?.disable();
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
  
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.error('Only image files are allowed.');
      return;
    }
  
    // Check file size (e.g., 5 MB maximum)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      console.error('File size exceeds the maximum allowed size.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imageData = reader.result; 
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageData = null;
  }

  ngAfterViewInit(): void {
    this.setMaxHeight();
    this.isOverlayVisible = !!this.overlayElement.nativeElement;
   if(this.isOverlayVisible){
    this.adjustOverlayHeight();
   }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
  }

  setMaxHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    
    const availableHeight = window.innerHeight - headerHeight - footerHeight - 90;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight -30;
    // const availableHeight = 400;
    // const leftContentHeight = 400;
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });
    
    const leftsection = document.querySelectorAll('.ngx-datatable.scroll-vertical');
    leftsection.forEach(section => {
      (section as HTMLElement).style.setProperty('height', `${leftContentHeight}px`, 'important');
    });
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
    //this.overlayElement.nativeElement.style.height = `${leftContentHeight}px`;
  }

  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }

}
