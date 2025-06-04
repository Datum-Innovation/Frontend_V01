import { AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Designation, Designations } from '../model/designation.interface';
import { CustomerSupplierService } from '../../services/customersupplier.service';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { ACCOUNT, ACCOUNTGROUP, AREA, CREDITCOLLECTION, CUSTOMERCATEGORIES, CUSTOMERCOMMODITY, CUSTOMERCOUNTRIES, CUSTOMERPRICECATEGORIES, CUSTOMERSUPPLIER, CUSTOMERSUPPLIERCATEGORIES, CUSTOMERSUPPLIERS, CUSTOMERSUPPLIERTYPE, DELIVERYDETAILS, PLACEOFSUPPLY, SALESMAN } from '../model/customersupplier.interface';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DatatableComponent } from '@swimlane/ngx-datatable';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-customer-supplier',
  templateUrl: './customer-supplier.component.html',
  styleUrls: ['./customer-supplier.component.css'],
})
export class CustomerSupplierComponent implements AfterViewInit {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('scrollableDivLeft') scrollableDivLeft!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild('stickybuttoncontainer') stickybuttoncontainer!: ElementRef;
  @ViewChild('btngroup') btngroup!: ElementRef;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  CustomerSupplierForm!: FormGroup;    
  allCustomerSupplier = [] as Array<CUSTOMERSUPPLIERS>;   
  tempCustomerSupplierList:any = [];
  selectedCustomerSupplierId!: number;
  firstCustomerSupplier!:number;
  isActive: number = 0;
  currentCustomerSupplier = {} as CUSTOMERSUPPLIER;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;

  salesmanOptions = [] as Array<SALESMAN>;
  selectedSalesmanOption = '';
  salesmanreturnField = 'name';
  salesmanKeys = ['Code','Name','ID'];
  selectedSalesmanId = 0;

  areaOptions = [] as Array<AREA>;
  selectedAreaOption = "";
  areareturnField = 'name';
  areaKeys = ['Code','Name','ID'];
  selectedArea = {
    "id": 0,
    "name": "string"
  };

  allDeliveryDetails = [] as Array<DELIVERYDETAILS>;
  currentDeliveryTableIndex = 0;

  customerSupplierCode = 0;

  customerSupplierTypes = [] as Array<CUSTOMERSUPPLIERTYPE>; 
  customerSupplierCategories = [] as Array<CUSTOMERSUPPLIERCATEGORIES>;
  customerPriceCategories = [] as Array<CUSTOMERPRICECATEGORIES>;
  customerCategories = [] as Array<CUSTOMERCATEGORIES>;

  // showOtherDetails = false;
  selectedCustomerSupplierType = 0;
  imageData: string | ArrayBuffer | null = null;
  listCommoditySought = [] as Array<CUSTOMERCOMMODITY>; 
  selectedCommodities: any[] = [];
  showCommodityPopup = false;

  countries = [] as Array<CUSTOMERCOUNTRIES>;

  selectedCategory:any = [];
  selectedCustomerType:any = [];
  selectedPriceCategory:any = {
      "id": 0,
      "name": "string"
    };
  saleTypes = [
    {
      "id":"S",
      "value":"Cash"
    },
    {
      "id":"R",
      "value":"Credit"
    }
  ];
  selectedSalesType :any = {
    "key": null,
    "value": "string"
  };
  businessTypes = [
    {
      "value":'p',
      "name":"Primary"
    },
    {
      "value":"s",
      "name":"Secondary"
    }
  ];
  selectedBusinessType:any = {
    "key": null,
    "value": "string"
  };
  selectedAvailedLoanLimits:any =   {
    "key": null,
    "value": "string"
  }
  selectedBusinessNature:any = {
    "key": null,
    "value": "string"
  };
  selectedBusinessAddress:any = {
    "key": null,
    "value": "string"
  };

  selectedCategoryRecommended:any = {
    "id":null,
    "name":"string"
  };
  selectedCategoryFixed:any = {
    "id":null,
    "name":"string"
  };

  creditCollectionData = [] as Array<CREDITCOLLECTION>;
  selectedCreditCollectionType:any = {
    "key": null,
    "value": "string"
  };

  selectedMarketReputation:any = {
    "key": null,
    "value": "string"
  };

  accountGroupData = [] as Array<ACCOUNTGROUP>;
  accountGroup:any = {
    "id": 0,
    "name": "string"
  };

  accountData = [] as Array<ACCOUNT>;
  account:any = {
    "id": 0,
    "name": "string"
  };

  placeofSupplyOptions = [] as Array<PLACEOFSUPPLY>;
  selectedPlaceofSupplyOption = '';
  placeofSupplyreturnField = 'value';
  placeofSupplyKeys = ['ID','VALUE'];
  selectedPlaceofSupplyId = 0;

  pageId = 0;
  selectedAccountId = 0;
  selectedAccountGroupId = 0;

  showImageContainer = true;

  showGeneralDetails = true;
  showCustomerDetails = false;
  showOtherDetails = false;

  selectedTab = 1;

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  showLeftSection:boolean = true;
  isMaximized = false;

  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'Location Name', field: 'locationname'},
    { name: 'Project', field: 'project'},
    { name: 'Contact Person', field: 'contactperson' },
    { name: 'Contact No', field: 'contactno' },
    { name: 'Address', field: 'address' }
  ];

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('gridInput', { static: false }) gridInput!: ElementRef;
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";
    enableInlineEditing:boolean = false;
    selectedRowIndex:any = -1;

    deliveryDetailsObj:any = {
      "locationName": "",
      "projectName":"",
      "contactPerson":"",
      "contactNo":"",
      "address":""
    };
    
  selected: any[] = [];
  constructor(
    private formBuilder: FormBuilder,    
    private customerSupplierService: CustomerSupplierService,
    private store: Store,
    private router:Router,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private gridnavigationService: GridNavigationService,
    private baseService:BaseService
  ){
    // Access query parameters
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
    if (queryParams && queryParams['partyId']) {
      this.selectedCustomerSupplierId = queryParams['partyId'];
    }
  }
  ngOnInit(): void {
    this.CustomerSupplierForm = this.formBuilder.group({      
      type: [{value: '', disabled: this.isInputDisabled}, Validators.required], // Dropdown Required
      code: [{value: '', disabled: this.isInputDisabled}, Validators.required], // string Required
      name: [{value: '', disabled: this.isInputDisabled}, Validators.required], // string Required
      category: [{value: '', disabled: this.isInputDisabled}, Validators.required], // Dropdown
      active: [{value: true, disabled: this.isInputDisabled}, Validators.required], // bool Required
      salutation: [{value: '', disabled: this.isInputDisabled}], // Dropdown (Mr/Ms)
      arabicname: [{value: '', disabled: this.isInputDisabled}], // string
      contactpersonname: [{value: '', disabled: this.isInputDisabled}], // string
      telephoneno: [{value: '', disabled: this.isInputDisabled}], // string
      addresslineone: [{value: '', disabled: this.isInputDisabled}], // string
      addressarabic: [{value: '', disabled: this.isInputDisabled}], // string
      mobileno: [{value: '', disabled: this.isInputDisabled}], // string
      vatno: [{value: '', disabled: this.isInputDisabled}], // string
      creditperiod: [{value: '', disabled: this.isInputDisabled}], // decimal
      creditlimit: [{value: '', disabled: this.isInputDisabled}], // decimal
      salesman: [{value: '', disabled: this.isInputDisabled}], // popup
      city: [{value: '', disabled: this.isInputDisabled}], // string
      pobox: [{value: '', disabled: this.isInputDisabled}], // string
      countrycode: [{value: '', disabled: this.isInputDisabled}], // string
      country: [{value: '', disabled: this.isInputDisabled}], // Dropdown
      buildingno: [{value: '', disabled: this.isInputDisabled}], // string
      district: [{value: '', disabled: this.isInputDisabled}], // string
      districtarabic: [{value: '', disabled: this.isInputDisabled}], // string
      cityarabic: [{value: '', disabled: this.isInputDisabled}], // string
      provincearabic: [{value: '', disabled: this.isInputDisabled}], // string
      area: [{value: '', disabled: this.isInputDisabled}], // string
      province: [{value: '', disabled: this.isInputDisabled}], // string
      faxno: [{value: '', disabled: this.isInputDisabled}],
      contactperson2: [{value: '', disabled: this.isInputDisabled}],
      emailaddress: [{value: '', disabled: this.isInputDisabled}, Validators.email],
      telephoneno2: [{value: '', disabled: this.isInputDisabled}],
      centralsalestaxno: [{value: '', disabled: this.isInputDisabled}],
      actassupplieralso: [{value: false, disabled: this.isInputDisabled}],
      panno: [{value: '', disabled: this.isInputDisabled}],
      letsystemgeneratenewaccountforparty: [{ value: true, disabled: this.isInputDisabled }],
      accountgroup: [{value: '', disabled: this.isInputDisabled}], // Add Validators as needed
      account: [{value: '', disabled: this.isInputDisabled}], // Add Validators as needed
      remarks: [{value: '', disabled: this.isInputDisabled}],
      commoditysought: new FormControl<string[]>([]),
      salestype: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      quantityplanned: [{ value: '', disabled: this.isInputDisabled }], // int
      basicunit: [{ value: '', disabled: this.isInputDisabled }], // decimal
      creditcollectiontype: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      dl1: [{ value: '', disabled: this.isInputDisabled }], // string
      dl2: [{ value: '', disabled: this.isInputDisabled }], // string
      pricecategory: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      placeofsupply: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      businesstype: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      availedanyloanlimits: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      businessnature: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      othermerchantsofcustomer: [{ value: '', disabled: this.isInputDisabled }], // string
      businessaddress: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      valueofproperty: [{ value: '', disabled: this.isInputDisabled }], // decimal
      yearsofbusiness: [{ value: '', disabled: this.isInputDisabled }], // int
      yearlyturnover: [{ value: '', disabled: this.isInputDisabled }], // decimal
      marketreputation: [{ value: '', disabled: this.isInputDisabled }], // string    
      categoryrecommended: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      limitrecommended: [{ value: '', disabled: this.isInputDisabled }], 
      categoryfixed: [{ value: '', disabled: this.isInputDisabled }], // Dropdown
      limitfixedforcustomer: [{ value: '', disabled: this.isInputDisabled }], // int
      creditperiodpermitted: [{ value: '', disabled: this.isInputDisabled }], // int
      overdueamountlimit: [{ value: '', disabled: this.isInputDisabled }], // decimal
      overdueperiodlimit: [{ value: '', disabled: this.isInputDisabled }], // int
      chequebouncecountlimit: [{ value: '', disabled: this.isInputDisabled }], // int
      salespricelowvarlimit: [{ value: '', disabled: this.isInputDisabled }], // decimal
      salespriceupVarlimit: [{ value: '', disabled: this.isInputDisabled }], // decimal  
    });

    this.fetchAllCustomerSupplier();
    //this.fetchCustomerSupplierCode();
    this.fetchCustomerSupplierType();
    this.fetchCustomerSupplierCategory();
    this.fetchCustomerPriceCategory();
    this.fetchCustomerCategory();
    this.fetchCountry();
    this.fetchSalesman();
    this.fetchArea();
    this.fetchCommoditySought();
    this.fetchCreditCollection();
    //this.fetchAccountGroup();
    this.fetchPlaceOfSupply();
    
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

  fetchAllCustomerSupplier(): void {
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLALLCUSTOMERSUPPLIER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allCustomerSupplier = response;        
        this.tempCustomerSupplierList = [...this.allCustomerSupplier];
        //this.setBranches();
        if(this.selectedCustomerSupplierId >0){
          this.fetchCustomerSupplierById();
        } else if(this.selectedCustomerSupplierId == 0){
          this.onClickNewCustomerSupplier();
        } else{
          this.selectedCustomerSupplierId = this.allCustomerSupplier[0].id;
          this.firstCustomerSupplier = this.allCustomerSupplier[0].id;
          this.fetchCustomerSupplierById();
        }
        
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }
  
  fetchCustomerSupplierCode(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERSUPPLIERCODE)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.customerSupplierCode = response?.data.code;
        this.CustomerSupplierForm.patchValue({
          code: this.customerSupplierCode
        });
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
    
  }

  fetchCustomerSupplierType(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERSUPPLIERTYPE)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.customerSupplierTypes = response;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchCustomerSupplierCategory(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERSUPPLIERCATEGORY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.customerSupplierCategories = response;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchCustomerPriceCategory(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERPRICECATEGORY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.customerPriceCategories = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchCustomerCategory(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERCATEGORY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.customerCategories = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchCountry(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCOUNTRY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.countries = response?.data[0];
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchSalesman(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERSUPPLIERSALESMANDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.salesmanOptions = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchArea(): void{
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERSUPPLIERAREA)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        let areaData:any = response?.data;
        areaData.forEach((item:any) => {
          let areaObj = {
            code:item.code,
            name:item.value,
            id:item.id
          }
          this.areaOptions.push(areaObj);
        });
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });    
  }

  fetchCommoditySought(){
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERCOMMODITY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.listCommoditySought = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  fetchCreditCollection(){
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERCREDITDROPDOWN)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.creditCollectionData = response?.data;
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

   fetchAccountGroup(){
    let type = this.CustomerSupplierForm.get('type')?.value;
    let typename = "";
    if(type == 1){
      typename = 'CUSTOMER';
    } else if(type == 2){
      typename = 'SUPPLIER';
    }
    if(typename != ""){
      this.customerSupplierService
      .getDetails(EndpointConstant.FILLCUSTOMERACCOUNTGROUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.accountGroupData = response?.data;
          if(this.isUpdate == false && this.isInputDisabled == false){
            this.accountGroupData.forEach(element => {
              if((element.name == 'Sundry Debtors' && type == 1 ) || (element.name == 'Sundry Creditors' && type == 2)){
                this.CustomerSupplierForm.patchValue({
                  accountgroup:element.id
                });
                this.onChangeAccountGroup();
              }
            });
          }
          if(this.selectedAccountGroupId != 0){
            this.CustomerSupplierForm.patchValue({
              accountgroup:this.selectedAccountGroupId
            });
            this.onChangeAccountGroup();
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
    }
  }

  fetchPlaceOfSupply(){
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERPLACEOFSUPPLY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        let placeofSupplyData:any = response?.data[0];
        placeofSupplyData.forEach((item:any) => {
          let placeofSupplyObj = {
            id:item.id,
            value:item.value
          }
          this.placeofSupplyOptions.push(placeofSupplyObj);
        });
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  onClickCustomerSupplier(event:any): void {
    if (event.type === 'click') {
      this.selectedCustomerSupplierId = event.row.id;
      this.fetchCustomerSupplierById();
    }
  }

  fetchCustomerSupplierById(): void {
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERSUPPLIERBYID+this.selectedCustomerSupplierId+'&pageId='+this.pageId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCustomerSupplier = response;
        let customerSupplierData = response?.result;
        let deliveryDetails = response?.delDetails;
        let customerData = response?.custDetails[0];
        this.allDeliveryDetails = [];
        deliveryDetails.forEach((item:any) => {
          let deliveryObj:any = {
            delId: item.id,
            locationName: item.locationName,
            projectName: item.projectName,
            contactPerson: item.contactPerson,
            contactNo: item.contactNo,
            address: item.address
          }
          this.allDeliveryDetails.push(deliveryObj);
        });
        if(deliveryDetails.length == 0){
          this.allDeliveryDetails.push({
            delId: 0,
            locationName: "",
            projectName: "",
            contactPerson: "",
            contactNo: "",
            address: ""
          });
        }
        this.currentDeliveryTableIndex = this.allDeliveryDetails.length - 1;
        this.CustomerSupplierForm.patchValue({
          type: customerSupplierData.nature === 'C' ? 1 : 2,
          code: customerSupplierData.code,
          name: customerSupplierData.name,
          category: customerSupplierData.partyCategoryID,
          active: customerSupplierData.active,
          salutation: customerSupplierData.salutation,
          arabicname: customerSupplierData.arabicName,
          contactpersonname: customerSupplierData.contactPerson,
          telephoneno: customerSupplierData.telephoneNo,
          addresslineone: customerSupplierData.addressLineOne,
          addressarabic: customerSupplierData.addressLineTwo,
          mobileno: customerSupplierData.mobileNo,
          vatno: customerSupplierData.salesTaxNo,
          creditperiod: customerData ? customerData.creditPeriod : null,
          creditlimit: customerSupplierData.creditLimit,
          salesman: customerSupplierData.salesManID,
          city: customerSupplierData.city,
          pobox: customerSupplierData.pobox,
          countrycode: customerSupplierData.countryCode,
          country: customerSupplierData.country,
          buildingno: customerSupplierData.bulidingNo,
          district: customerSupplierData.district,
          districtarabic: customerSupplierData.districtArabic,
          cityarabic: customerSupplierData.cityArabic,
          provincearabic: customerSupplierData.provinceArabic,
          area: customerSupplierData.area,
          province: customerSupplierData.province,
          faxno: customerSupplierData.faxNo,
          contactperson2: customerSupplierData.contactPerson2,
          emailaddress: customerSupplierData.emailAddress,
          telephoneno2: customerSupplierData.telephoneNo2,
          centralsalestaxno: customerSupplierData.centralSalesTaxNo,
          actassupplieralso: customerSupplierData.isMultiNature,
          panno: customerSupplierData.panNo,
          letsystemgeneratenewaccountforparty: false,
          // accountgroup: response.accountGroup[0].id,
          // account: customerSupplierData.accountID,
          remarks: customerSupplierData.remarks,
          //commoditysought:
          salestype:customerData?.cashCreditType,
          quantityplanned: customerData?.plannedPcs,
          basicunit:customerData?.plannedCFT,
           creditcollectiontype:customerData?.creditCollnThru,
           dl1:customerSupplierData.dL1,
           dl2:customerSupplierData.dL2,
           pricecategory:customerSupplierData.priceCategoryID,
           placeofsupply:customerSupplierData.placeOfSupply,
           businesstype:customerData?.busPrimaryType,
           availedanyloanlimits:customerData?.isLoanAvailed,
           businessnature:customerData?.busRetailType,
           othermerchantsofcustomer:customerData?.mainMerchants,
           businessaddress:customerData?.addressOwned,
           valueofproperty:customerData?.valueofProperty,
           yearsofbusiness:customerData?.busYears,
           yearlyturnover:customerData?.busYearTurnover,
           marketreputation:customerData?.marketReputation,
           categoryrecommended:customerData?.bandByImportID,
           limitrecommended:customerData?.salesLimitByImport,
           categoryfixed:customerData?.bandByHOID,
           limitfixedforcustomer:customerData?.salesLimitByHO,
           creditperiodpermitted:customerData?.creditPeriodByHO,
           overdueamountlimit:customerData?.overdueLimitPerc,
           chequebouncecountlimit:customerData?.chequeBounceLimit,          
           overdueperiodlimit:customerData?.overduePeriodLimit,
           salespricelowvarlimit:customerData?.salesPriceLowVarPerc,
           salespriceupVarlimit:customerData?.salesPriceUpVarPerc ,           
           commoditysought:response.commoditySought.map((commodity: any) => commodity.id)
        });
        this.onTypeSelect();
        this.onChangeCategory();
        this.accountGroup = response.accountGroup[0];
        this.selectedCommodities = response.commoditySought;
        this.selectedAccountId = customerSupplierData.accountID;
        this.selectedAccountGroupId = response.accountGroup[0].id;
        this.selectedSalesmanOption = (customerSupplierData.salesMan == null) ? '' : customerSupplierData.salesMan;
        this.selectedSalesmanId = customerSupplierData.salesManID;
        this.onAreaSelected(customerSupplierData.area);
        this.selectedPlaceofSupplyOption = customerSupplierData.placeOfSupply;
        this.imageData = response?.img;
        this.onChangePriceCategory();
        this.onChangeCategoryFixed();
        this.onChangeCategoryRecommended();
        // if(this.currentCustomerSupplier.nature === 'C'){
        //   this.selectedCustomerSupplierType = 1;
        // } else{
        //   this.selectedCustomerSupplierType = 2;
        // }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewCustomerSupplier(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.CustomerSupplierForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCustomerSupplierId = this.firstCustomerSupplier;
      this.fetchCustomerSupplierById();
    } else{
      this.allDeliveryDetails = [];
      this.selectedCustomerSupplierId = 0;
      this.enableFormControls();
      this.selectedAccountGroupId = 0;
      this.selectedAccountId = 0;
      //area...
      this.selectedAreaOption = "";
      this.selectedArea = {
        "id": 0,
        "name": "string"
      };

      this.addRow();
      this.selectedPlaceofSupplyOption = '';
      this.CustomerSupplierForm.patchValue({
        letsystemgeneratenewaccountforparty: true,
        active:true
      });
      this.imageData = null;
      this.CustomerSupplierForm.get('account')?.disable();
      this.fetchCustomerSupplierCode();  
      this.selectedCommodities = [];
    }
    return true;
  }

  onClickEditCustomerSupplier(){
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
    this.fetchCustomerSupplierById();
    return true;
  }

  onClickDeleteCustomerSupplier(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.customerSupplierService.deleteDetails(EndpointConstant.DELETECUSTOMERSUPPLIER+this.selectedCustomerSupplierId+'&pageId='+this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedCustomerSupplierId = this.firstCustomerSupplier;
          this.fetchAllCustomerSupplier();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
    }
    return true;
  }

  onClickSaveCustomerSupplier() {
    if (this.CustomerSupplierForm.invalid) {
      for (const field of Object.keys(this.CustomerSupplierForm.controls)) {
        const control: any = this.CustomerSupplierForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    if(this.CustomerSupplierForm.value.businesstype){
      this.selectedBusinessType = {
        key:"string",
        value:this.CustomerSupplierForm.value.businesstype
      };
    }
    //credit collection type ...
    if(this.CustomerSupplierForm.value.salestype){
      let salesTypeName = null;
      this.saleTypes.forEach(item => {
        if(item.id == this.CustomerSupplierForm.value.salestype){
          salesTypeName = item.value;
        }
      });

      this.selectedSalesType = {
        key:this.CustomerSupplierForm.value.salestype,
        value:salesTypeName
      };
    }

    //availed loan limits ...
    if(this.CustomerSupplierForm.value.availedanyloanlimits){
      let availedLoanLimitName = "string";
      if(this.CustomerSupplierForm.value.availedanyloanlimits == 'Y'){
        availedLoanLimitName = 'Yes';
      } else if(this.CustomerSupplierForm.value.availedanyloanlimits == 'N'){
        availedLoanLimitName = 'No';
      } 

      this.selectedAvailedLoanLimits = {
        key:this.CustomerSupplierForm.value.availedanyloanlimits,
        value:availedLoanLimitName
      };
    }

    //business nature....
    if(this.CustomerSupplierForm.value.businessnature){
      let businessNatureName = "string";
      if(this.CustomerSupplierForm.value.businessnature == 'R'){
        businessNatureName = 'Retail';
      } else if(this.CustomerSupplierForm.value.businessnature == 'W'){
        businessNatureName = 'Whole Sale';
      } 
      this.selectedBusinessNature = {
        key:this.CustomerSupplierForm.value.businessnature,
        value:businessNatureName
      };
    }

    //business address....
    if(this.CustomerSupplierForm.value.businessaddress){
      let businessAddressName = "string";
      if(this.CustomerSupplierForm.value.businessnature == 'O'){
        businessAddressName = 'Owned';
      } else if(this.CustomerSupplierForm.value.businessnature == 'R'){
        businessAddressName = 'Rented';
      } 

      this.selectedBusinessAddress = {
        key:this.CustomerSupplierForm.value.businessaddress,
        value:businessAddressName
      }
    }

    //credit collection type...
    if(this.CustomerSupplierForm.value.creditcollectiontype){
      let creditCollectionName = "string";
      this.creditCollectionData.forEach(item => {
        if(item.value == this.CustomerSupplierForm.value.creditcollectiontype){
          creditCollectionName = item.description;
        }
      });

      this.selectedCreditCollectionType = {
        key:this.CustomerSupplierForm.value.creditcollectiontype,
        value:creditCollectionName
      }
    }

    //market reputattion...
    if(this.CustomerSupplierForm.value.marketreputation){
      let marketReputationName = null;
      if(this.CustomerSupplierForm.value.marketreputation == 'V'){
        marketReputationName = 'Very Good';
      } else if(this.CustomerSupplierForm.value.marketreputation == 'G'){
        marketReputationName = 'Good';
      }  else if(this.CustomerSupplierForm.value.marketreputation == 'A'){
        marketReputationName = 'Average';
      }  else if(this.CustomerSupplierForm.value.marketreputation == 'B'){
        marketReputationName = 'Below Average';
      } 

      this.selectedMarketReputation = {
        key:this.CustomerSupplierForm.value.marketreputation,
        value:marketReputationName
      }
    }

    this.accountGroupData.forEach(item => {
      if(item.id == this.CustomerSupplierForm.value.accountgroup){
        this.accountGroup = item;
      }
    });

    this.accountData.forEach(item => {
      if(item.id == this.CustomerSupplierForm.value.account){
        this.account = item;
      }
    });
    let placeofsupply = {
      "id": 0,
      "value": this.CustomerSupplierForm.value.placeofsupply
    }
    let countryName = null;
    this.countries.forEach(item => {
      if(item.id == this.CustomerSupplierForm.value.country){
        countryName = item.value;
      }
    });
    let country = {
      "id": this.CustomerSupplierForm.value.country ? this.CustomerSupplierForm.value.country : 0,
      "value": countryName
    }

    
    // Assuming selectedCommodityIds contains the selected IDs
    let selectedCommodityIds = this.CustomerSupplierForm.get('commoditysought')?.value;

    // Filter the listCommoditySought array to get the selected commodity objects
    if(selectedCommodityIds){
      this.selectedCommodities = this.listCommoditySought.filter(commodity =>
        selectedCommodityIds.includes(commodity.id)
      );
    }
    const payload = { 
        "id": this.isUpdate ? this.selectedCustomerSupplierId : 0,
        "type": this.selectedCustomerType,
        "category": this.selectedCategory?this.selectedCategory:null,
        "code": this.CustomerSupplierForm.value.code.toString(),
        "salutation": this.CustomerSupplierForm.value.salutation,
        "active": this.CustomerSupplierForm.value.active,
        "name": this.CustomerSupplierForm.value.name,
        "arabicName": this.CustomerSupplierForm.value.arabicname,
        "contactPersonName": this.CustomerSupplierForm.value.contactpersonname,
        "telephoneNo": this.CustomerSupplierForm.value.telephoneno,
        "addressLineOne": this.CustomerSupplierForm.value.addresslineone,
        "addressArabic": this.CustomerSupplierForm.value.addressarabic,
        "mobileNo": this.CustomerSupplierForm.value.mobileno,
        "vatno": this.CustomerSupplierForm.value.vatno,
        "creditPeriod": this.CustomerSupplierForm.value.creditperiod ? this.CustomerSupplierForm.value.creditperiod: 0,
        "creditLimit": this.CustomerSupplierForm.value.creditlimit,
        "salesMan": this.CustomerSupplierForm.value.salesman,
        "city": this.CustomerSupplierForm.value.city,
        "poBox": this.CustomerSupplierForm.value.pobox,
        "countryCode": this.CustomerSupplierForm.value.countrycode,
        "country": country,
        "bulidingNo": this.CustomerSupplierForm.value.buildingno,
        "district": this.CustomerSupplierForm.value.district,
        "districtArabic": this.CustomerSupplierForm.value.districtarabic,
        "cityArabic": this.CustomerSupplierForm.value.cityarabic,
        "provinceArabic": this.CustomerSupplierForm.value.provincearabic,
        "area": this.selectedArea,
        "province": this.CustomerSupplierForm.value.province,
        "faxNo": this.CustomerSupplierForm.value.faxno,
        "contactPerson2": this.CustomerSupplierForm.value.contactperson2,
        "emailAddress": this.CustomerSupplierForm.value.emailaddress,
        "telephoneNo2": this.CustomerSupplierForm.value.telephoneno2,
        "centralSalesTaxNo": this.CustomerSupplierForm.value.centralsalestaxno,
        "actAsSupplierAlso": this.CustomerSupplierForm.value.actassupplieralso,
        "panNo": this.CustomerSupplierForm.value.panno,
        "letSystemGenNewAccForParty": this.CustomerSupplierForm.value.letsystemgeneratenewaccountforparty,
        "accountGroup": this.accountGroup,
        "account": this.account,
        "remarks": this.CustomerSupplierForm.value.remarks,
        "image": this.imageData ? this.imageData : null,
        "customerDetails": {
          "commoditySought": this.selectedCommodities,
          "salesType": this.selectedSalesType,
          "quantityPlanned":this.CustomerSupplierForm.value.quantityplanned ? this.CustomerSupplierForm.value.quantityplanned : 0,
          "basicUnit": this.CustomerSupplierForm.value.basicunit ? this.CustomerSupplierForm.value.basicunit : 0,
          "creditCollectionType": this.selectedCreditCollectionType,
          "dL1": this.CustomerSupplierForm.value.dl1,
          "dL2": this.CustomerSupplierForm.value.dl2,
          "priceCategory": this.selectedPriceCategory,
          "placeOfSupply": placeofsupply,
          "businessType": this.selectedBusinessType,
          "availedAnyLoanLimits": this.selectedAvailedLoanLimits,
          "businessNature": this.selectedBusinessNature,
          "otherMerchantsOfCustomer": this.CustomerSupplierForm.value.othermerchantsofcustomer,
          "businessAddress": this.selectedBusinessAddress,
          "valueOfProperty": this.CustomerSupplierForm.value.valueofproperty ? this.CustomerSupplierForm.value.valueofproperty :0,
          "yearsOfBusiness": this.CustomerSupplierForm.value.yearsofbusiness ? this.CustomerSupplierForm.value.yearsofbusiness : 0,
          "yearlyTurnover": this.CustomerSupplierForm.value.yearlyturnover ? this.CustomerSupplierForm.value.yearlyturnover : 0,
          "marketReputation":this.selectedMarketReputation,
          "categoryRecommended": this.selectedCategoryRecommended,
          "limitRecommended": this.CustomerSupplierForm.value.limitrecommended ? this.CustomerSupplierForm.value.limitrecommended : 0,
          "categoryFixed": this.selectedCategoryFixed,
          "limitFixedForCustomer": this.CustomerSupplierForm.value.limitfixedforcustomer ? this.CustomerSupplierForm.value.limitfixedforcustomer : 0,
          "creditPeriodPermitted": this.CustomerSupplierForm.value.creditperiodpermitted ? this.CustomerSupplierForm.value.creditperiodpermitted : 0,
          "overdueAmountLimit": this.CustomerSupplierForm.value.overdueamountlimit ? this.CustomerSupplierForm.value.overdueamountlimit : 0,
          "overduePeriodLimit": this.CustomerSupplierForm.value.overdueperiodlimit ? this.CustomerSupplierForm.value.overdueperiodlimit : 0,
          "chequeBounceCountLimit": this.CustomerSupplierForm.value.chequebouncecountlimit ? this.CustomerSupplierForm.value.chequebouncecountlimit : 0,
          "salesPriceLowVarLimit": this.CustomerSupplierForm.value.salespricelowvarlimit ? this.CustomerSupplierForm.value.salespricelowvarlimit : 0,
          "salesPriceUpVarLimit": this.CustomerSupplierForm.value.salespriceupVarlimit ? this.CustomerSupplierForm.value.salespriceupVarlimit : 0,
        },
        "deliveryDetails": this.allDeliveryDetails
      
    };console.log({payload});
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.customerSupplierService.updateDetails(EndpointConstant.UPDATECUSTOMERSUPPLIER+this.pageId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue(response.data.msg); 
            this.imageData = null;         
            this.selectedCustomerSupplierId = this.firstCustomerSupplier;
            this.fetchCustomerSupplierById();
            this.fetchAllCustomerSupplier();
            this.setInitialState();
          } else{
            this.baseService.showCustomDialogue('Some error occred');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.customerSupplierService.saveDetails(EndpointConstant.SAVECUSTOMERSUPPLIER+this.pageId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(response.httpCode == 201){
            this.baseService.showCustomDialogue(response.data.msg);  
            this.imageData = null;         
            this.selectedCustomerSupplierId = this.firstCustomerSupplier;
            this.fetchCustomerSupplierById();
            this.fetchAllCustomerSupplier();
            this.setInitialState(); 
            const queryParams = this.route.snapshot.queryParams;
   
            if (queryParams && queryParams['partyId'] && queryParams['partyId'] == 0) {
              // Notify other tabs
              localStorage.setItem('customerSaved', JSON.stringify({ timestamp: new Date() }));
            } 
          } else{            
            this.baseService.showCustomDialogue('Some error occred');
          }
          
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Designation', error);
        },
      });
  }

  enableFormControls(){
    this.CustomerSupplierForm.get('type')?.enable();
    this.CustomerSupplierForm.get('code')?.enable();
    this.CustomerSupplierForm.get('name')?.enable();
    this.CustomerSupplierForm.get('category')?.enable();
    this.CustomerSupplierForm.get('active')?.enable();
    this.CustomerSupplierForm.get('salutation')?.enable();
    this.CustomerSupplierForm.get('arabicname')?.enable();
    this.CustomerSupplierForm.get('contactpersonname')?.enable();
    this.CustomerSupplierForm.get('telephoneno')?.enable();
    this.CustomerSupplierForm.get('addresslineone')?.enable();
    this.CustomerSupplierForm.get('addressarabic')?.enable();
    this.CustomerSupplierForm.get('mobileno')?.enable();
    this.CustomerSupplierForm.get('vatno')?.enable();
    this.CustomerSupplierForm.get('creditperiod')?.enable();
    this.CustomerSupplierForm.get('creditlimit')?.enable();
    this.CustomerSupplierForm.get('salesman')?.enable();
    this.CustomerSupplierForm.get('city')?.enable();
    this.CustomerSupplierForm.get('pobox')?.enable();
    this.CustomerSupplierForm.get('countrycode')?.enable();
    this.CustomerSupplierForm.get('country')?.enable();
    this.CustomerSupplierForm.get('buildingno')?.enable();
    this.CustomerSupplierForm.get('district')?.enable();
    this.CustomerSupplierForm.get('districtarabic')?.enable();
    this.CustomerSupplierForm.get('cityarabic')?.enable();
    this.CustomerSupplierForm.get('provincearabic')?.enable();
    this.CustomerSupplierForm.get('area')?.enable();
    this.CustomerSupplierForm.get('province')?.enable();
    this.CustomerSupplierForm.get('faxno')?.enable();
    this.CustomerSupplierForm.get('contactperson2')?.enable();
    this.CustomerSupplierForm.get('emailaddress')?.enable();
    this.CustomerSupplierForm.get('telephoneno2')?.enable();
    this.CustomerSupplierForm.get('centralsalestaxno')?.enable();
    this.CustomerSupplierForm.get('actassupplieralso')?.enable();
    this.CustomerSupplierForm.get('panno')?.enable();
    this.CustomerSupplierForm.get('province')?.enable();
    this.CustomerSupplierForm.get('area')?.enable();
    this.CustomerSupplierForm.get('letsystemgeneratenewaccountforparty')?.enable();
    this.CustomerSupplierForm.get('accountgroup')?.enable();
    this.CustomerSupplierForm.get('account')?.enable();
    this.CustomerSupplierForm.get('remarks')?.enable();
    this.CustomerSupplierForm.get('commoditysought')?.enable();
    this.CustomerSupplierForm.get('salestype')?.enable();
    this.CustomerSupplierForm.get('quantityplanned')?.enable();
    this.CustomerSupplierForm.get('basicunit')?.enable();
    this.CustomerSupplierForm.get('creditcollectiontype')?.enable();
    this.CustomerSupplierForm.get('dl1')?.enable();
    this.CustomerSupplierForm.get('dl2')?.enable();
    this.CustomerSupplierForm.get('pricecategory')?.enable();
    this.CustomerSupplierForm.get('placeofsupply')?.enable();
    this.CustomerSupplierForm.get('businesstype')?.enable();
    this.CustomerSupplierForm.get('availedanyloanlimits')?.enable();
    this.CustomerSupplierForm.get('businessnature')?.enable();
    this.CustomerSupplierForm.get('othermerchantsofcustomer')?.enable();
    this.CustomerSupplierForm.get('businessaddress')?.enable();
    this.CustomerSupplierForm.get('valueofproperty')?.enable();
    this.CustomerSupplierForm.get('yearsofbusiness')?.enable();
    this.CustomerSupplierForm.get('yearlyturnover')?.enable();
    this.CustomerSupplierForm.get('marketreputation')?.enable();
    this.CustomerSupplierForm.get('categoryrecommended')?.enable();
    this.CustomerSupplierForm.get('limitrecommended')?.enable();
    this.CustomerSupplierForm.get('categoryfixed')?.enable();
    this.CustomerSupplierForm.get('limitfixedforcustomer')?.enable();
    this.CustomerSupplierForm.get('creditperiodpermitted')?.enable();
    this.CustomerSupplierForm.get('overdueamountlimit')?.enable();
    this.CustomerSupplierForm.get('overdueperiodlimit')?.enable();
    this.CustomerSupplierForm.get('chequebouncecountlimit')?.enable();
    this.CustomerSupplierForm.get('salespricelowvarlimit')?.enable();
    this.CustomerSupplierForm.get('salespriceupVarlimit')?.enable();   
  }

  disbaleFormControls(){
    this.CustomerSupplierForm.get('type')?.disable();
    this.CustomerSupplierForm.get('code')?.disable();
    this.CustomerSupplierForm.get('name')?.disable();
    this.CustomerSupplierForm.get('category')?.disable();
    this.CustomerSupplierForm.get('active')?.disable();
    this.CustomerSupplierForm.get('salutation')?.disable();
    this.CustomerSupplierForm.get('arabicname')?.disable();
    this.CustomerSupplierForm.get('contactpersonname')?.disable();
    this.CustomerSupplierForm.get('telephoneno')?.disable();
    this.CustomerSupplierForm.get('addresslineone')?.disable();
    this.CustomerSupplierForm.get('addressarabic')?.disable();
    this.CustomerSupplierForm.get('mobileno')?.disable();
    this.CustomerSupplierForm.get('vatno')?.disable();
    this.CustomerSupplierForm.get('creditperiod')?.disable();
    this.CustomerSupplierForm.get('creditlimit')?.disable();
    this.CustomerSupplierForm.get('salesman')?.disable();
    this.CustomerSupplierForm.get('city')?.disable();
    this.CustomerSupplierForm.get('pobox')?.disable();
    this.CustomerSupplierForm.get('countrycode')?.disable();
    this.CustomerSupplierForm.get('country')?.disable();
    this.CustomerSupplierForm.get('buildingno')?.disable();
    this.CustomerSupplierForm.get('district')?.disable();
    this.CustomerSupplierForm.get('districtarabic')?.disable();
    this.CustomerSupplierForm.get('cityarabic')?.disable();
    this.CustomerSupplierForm.get('provincearabic')?.disable();
    this.CustomerSupplierForm.get('area')?.disable();
    this.CustomerSupplierForm.get('province')?.disable();
    this.CustomerSupplierForm.get('faxno')?.disable();
    this.CustomerSupplierForm.get('contactperson2')?.disable();
    this.CustomerSupplierForm.get('emailddres')?.disable();
    this.CustomerSupplierForm.get('telephoneno2')?.disable();
    this.CustomerSupplierForm.get('centralsalestaxno')?.disable();
    this.CustomerSupplierForm.get('actassupplieralso')?.disable();
    this.CustomerSupplierForm.get('panno')?.disable();
    this.CustomerSupplierForm.get('province')?.disable();
    this.CustomerSupplierForm.get('area')?.disable();
    this.CustomerSupplierForm.get('letsystemgeneratenewaccountforparty')?.disable();
    this.CustomerSupplierForm.get('accountgroup')?.disable();
    this.CustomerSupplierForm.get('account')?.disable();
    this.CustomerSupplierForm.get('remarks')?.disable();
    this.CustomerSupplierForm.get('commoditysought')?.disable();
    this.CustomerSupplierForm.get('salestype')?.disable();
    this.CustomerSupplierForm.get('quantityplanned')?.disable();
    this.CustomerSupplierForm.get('basicunit')?.disable();
    this.CustomerSupplierForm.get('creditcollectiontype')?.disable();
    this.CustomerSupplierForm.get('dl1')?.disable();
    this.CustomerSupplierForm.get('dl2')?.disable();
    this.CustomerSupplierForm.get('pricecategory')?.disable();
    this.CustomerSupplierForm.get('placeofsupply')?.disable();
    this.CustomerSupplierForm.get('businesstype')?.disable();
    this.CustomerSupplierForm.get('availedanyloanlimits')?.disable();
    this.CustomerSupplierForm.get('businessnature')?.disable();
    this.CustomerSupplierForm.get('othermerchantsofcustomer')?.disable();
    this.CustomerSupplierForm.get('businessaddress')?.disable();
    this.CustomerSupplierForm.get('valueofproperty')?.disable();
    this.CustomerSupplierForm.get('yearsofbusiness')?.disable();
    this.CustomerSupplierForm.get('yearlyturnover')?.disable();
    this.CustomerSupplierForm.get('marketreputation')?.disable();
    this.CustomerSupplierForm.get('categoryrecommended')?.disable();
    this.CustomerSupplierForm.get('limitrecommended')?.disable();
    this.CustomerSupplierForm.get('categoryfixed')?.disable();
    this.CustomerSupplierForm.get('limitfixedforcustomer')?.disable();
    this.CustomerSupplierForm.get('creditperiodpermitted')?.disable();
    this.CustomerSupplierForm.get('overdueamountlimit')?.disable();
    this.CustomerSupplierForm.get('overdueperiodlimit')?.disable();
    this.CustomerSupplierForm.get('chequebouncecountlimit')?.disable();
    this.CustomerSupplierForm.get('salespricelowvarlimit')?.disable();
    this.CustomerSupplierForm.get('salespriceupVarlimit')?.disable(); 
  }

  onSalesmanSelected(option: string):any{    
    this.selectedSalesmanOption = option;
    this.salesmanOptions.forEach((item) => {
      if (item.name === option) {
        this.selectedSalesmanId = item.id;
      }
    });
    this.CustomerSupplierForm.patchValue({
      salesman:this.selectedSalesmanId,
    }); 
  }

  onAreaSelected(option: string):any{    
    this.selectedAreaOption= (option == null) ? " " : option;
    this.areaOptions.forEach((item) => {
      if (item.name === option) {
        this.selectedArea = {
          id:item.id,
          name:item.name
        }
      }
    });
    this.CustomerSupplierForm.patchValue({
      area:this.selectedAreaOption,
    }); 
  }
  translateItemName(){

  }

  onPlaceofSupplySelected(option: string):any{    
    this.selectedPlaceofSupplyOption= option;
    this.CustomerSupplierForm.patchValue({
      placeofsupply:this.selectedPlaceofSupplyOption,
    }); 
  }
  

  addRow(clicknew = false) {
    //checking department is empty or not....
    // if(this.checkFieldEmpty('departmentId') && clicknew){
    //   this.baseService.showCustomDialogue('Please fill department');
    //   return false;
    // }
    // //checking branchname is empty or not....
    // if(this.checkFieldEmpty('branchName') && clicknew){
    //   this.baseService.showCustomDialogue('Please fill branchName');
    //   return false;
    // }

    // //checking supervisorId is empty or not....
    // if(this.checkFieldEmpty('supervisorId') && clicknew){
    //   this.baseService.showCustomDialogue('Please fill supervisorId');
    //   return false;
    // }
    this.allDeliveryDetails.push({
      delId: 0,
      locationName: "",
      projectName: "",
      contactPerson: "",
      contactNo: "",
      address: ""
    });
    this.currentDeliveryTableIndex = this.allDeliveryDetails.length - 1;
    this.allDeliveryDetails = [...this.allDeliveryDetails];
    return true;
  }

  onChangeLocationName(event: any, rowIndex: number) {
    const locationName = event.target.value;
    this.allDeliveryDetails[rowIndex]['locationName'] = locationName; 
  }
  onChangeProjectName(event: any, rowIndex: number) {
    const projectName = event.target.value;
    this.allDeliveryDetails[rowIndex]['projectName'] = projectName; 
  }
  onChangeContactPerson(event: any, rowIndex: number) {
    const contactPerson = event.target.value;
    this.allDeliveryDetails[rowIndex]['contactPerson'] = contactPerson; 
  }
  onChangeContactNo(event: any, rowIndex: number) {
    const contactNo = event.target.value;
    this.allDeliveryDetails[rowIndex]['contactNo'] = contactNo; 
  }
  onChangeAddress(event: any, rowIndex: number) {
    const address = event.target.value;
    this.allDeliveryDetails[rowIndex]['address'] = address; 
  }

  toggleOtherDetails(event:Event){
    event.preventDefault();
    this.showOtherDetails = !this.showOtherDetails;
  }

  onChangeAccountOption(event:any){
    let accountGenerate = event.target.checked ? true : false;
    if(accountGenerate == false){
      this.CustomerSupplierForm.get('account')?.enable();
    }else{
      this.CustomerSupplierForm.get('account')?.disable();
    }
  }

  onTypeSelect(){
    this.selectedCustomerSupplierType = this.CustomerSupplierForm?.get('type')?.value;
    this.selectedCustomerType= this.customerSupplierTypes?.find(obj => obj?.id == this.selectedCustomerSupplierType) as CUSTOMERSUPPLIERTYPE;
    
    if(this.selectedCustomerSupplierType == 1){
      this.CustomerSupplierForm.get('creditperiod')?.enable();
    } else if(this.selectedCustomerSupplierType == 2){
      this.CustomerSupplierForm.get('creditperiod')?.disable();
    }
    this.fetchAccountGroup();
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

  showCommodityList(){
    this.showCommodityPopup = !this.showCommodityPopup;
  }
  onClickCommodity(commodity: any) {
    const index = this.selectedCommodities.findIndex(c => c.id === commodity.id);
    if (index === -1) {
      // Add the commodity to the array if it's not already present
      this.selectedCommodities.push(commodity);
    } else {
      // Remove the commodity from the array if it's already present
      this.selectedCommodities.splice(index, 1);
    }
  }

  isSelectedCommodity(commodity: any): boolean {
    return this.selectedCommodities.some(c => c.id === commodity.id);
  }

  onChangeCategory(){
    let selectedCategoryId = this.CustomerSupplierForm?.get('category')?.value;
    this.selectedCategory = this.customerSupplierCategories?.find(obj => obj?.id == selectedCategoryId) as CUSTOMERSUPPLIERCATEGORIES;
  }

  onChangePriceCategory(){
    let selectedPriceCategoryId = this.CustomerSupplierForm?.get('pricecategory')?.value;
    if(selectedPriceCategoryId){
      this.selectedPriceCategory = this.customerPriceCategories?.find(obj => obj?.id == selectedPriceCategoryId) as CUSTOMERPRICECATEGORIES;
    }
  }

  onChangeCategoryRecommended(){
    let selectedCategoryRecommendedId = this.CustomerSupplierForm?.get('categoryrecommended')?.value;
    if(selectedCategoryRecommendedId){
      let itemFound = this.customerCategories?.find(obj => obj?.id == selectedCategoryRecommendedId) as CUSTOMERCATEGORIES;
      if(itemFound){
        this.selectedCategoryRecommended = itemFound;
      }
    }
  }

  onChangeCategoryFixed(){
    let selectedCategoryFixedId = this.CustomerSupplierForm?.get('categoryfixed')?.value;
    if(selectedCategoryFixedId){
      let itemFound = this.customerCategories?.find(obj => obj?.id == selectedCategoryFixedId) as CUSTOMERCATEGORIES;
      if(itemFound){
        this.selectedCategoryFixed = itemFound;
      }
    }
  }

  onChangeAccountGroup(){
    let accountGroupId = this.CustomerSupplierForm?.get('accountgroup')?.value;
    //fetch Accounts corresponding to account group ...
    this.fetchAccount(accountGroupId);
  }

  fetchAccount(accountGroupId:any){
    this.customerSupplierService
    .getDetails(EndpointConstant.FILLCUSTOMERACCOUNT+accountGroupId+'&tree=true')
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.accountData = response?.data;
        if(this.selectedAccountId != 0){
          this.CustomerSupplierForm.patchValue({
            account:this.selectedAccountId
          });
        }
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  filterCustomerSupplier(event:any) {
    const val = event.target.value.toLowerCase();

    const temp = this.tempCustomerSupplierList.filter((d: any) => {
      // Ensure code and name are strings before performing includes
      const code = d.code ? d.code.toString().toLowerCase() : '';
      const name = d.name ? d.name.toString().toLowerCase() : '';
      const valLower = val.toLowerCase();
      
      return code.includes(valLower) || name.includes(valLower);
    });
    // update the rows
    this.allCustomerSupplier = temp;
  }

  toggleLeftSection(){
    this.showLeftSection = !this.showLeftSection;
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
  }

  // Utility function to check if an option is selected
  isChecked(option: any): boolean {
    return this.CustomerSupplierForm.get('selectedOptions')?.value.includes(option);
  }

  // Log the selected values
  onSelectionChange(): void {
    console.log('Selected values:', this.CustomerSupplierForm.get('commoditysought')?.value);
  }

  get commoditysoughtControl(): FormControl {
    return this.CustomerSupplierForm.get('commoditysought') as FormControl;
  }

  onClickInput(event:any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }



  onKeyDown(event: KeyboardEvent) {
    
    let cursorPosition = 0;
    let targetlength = 0;
    const targetElement = event.target as HTMLElement;

    // Check if the event target is an input or textarea
    if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) {
      if(targetElement.selectionStart != null){
        cursorPosition = targetElement.selectionStart;
      }     
      targetlength = targetElement.value.length;    
    }

    switch (event.key) {
      case 'ArrowDown':
        if(this.enableInlineEditing == false){
          event.preventDefault();
          if (this.currentRowIndex < this.allDeliveryDetails.length - 1) {
            this.currentRowIndex++;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
          // this.gridnavigationService.moveToNextRow(this.allDeliveryDetails, this.focusGridCell.bind(this));
        }
         break;
       

      case 'ArrowUp':
        if(this.enableInlineEditing == false){
          event.preventDefault();
          if (this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
          //this.gridnavigationService.moveToPreviousRow(this.focusGridCell.bind(this));
        }
        break;

      case 'ArrowRight':
        if(cursorPosition == targetlength){
          event.preventDefault();
          if (this.currentColIndex < this.tablecolumns.length - 1) {
            this.currentColIndex++;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
          }        
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        }
        break;

      case 'ArrowLeft':
        if(cursorPosition == 0 && this.currentColumname != 'locationname'){
          event.preventDefault();
          if (this.currentColIndex > 0) {
            this.currentColIndex--;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;          
            this.handleKeysForInlineEditing();
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
        }
        break;

      case 'Delete':
        if(!this.enableInlineEditing){
          event.preventDefault();
          //call delete function to delete current row.
          this.deleteItemGrid(this.currentRowIndex);
        }
      break;

      case 'Escape':
      case 'Esc': 
        if(!this.enableInlineEditing){
          event.preventDefault();
          //call delete function to delete current row.
          if(this.allDeliveryDetails.length > 1){
            let index = this.allDeliveryDetails.length - 2;
            this.deleteItemGrid(index);
          }          
        }
      break;

      case 'Enter':
        event.preventDefault(); 
        
        this.enableInlineEditing = false; 
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCell(this.currentRowIndex,this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          

        } else {
          if (this.currentRowIndex < this.allDeliveryDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            // focusCell(this.currentRowIndex, this.currentColIndex);
          } else {
            this.addRow(false);
            this.enableInlineEditing = false;
          } 
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        } 
          break;
      case 'Tab':

        if (event.shiftKey) {
          // Logic for Shift+Tab
          event.preventDefault(); // Prevent the default Shift+Tab behavior
          // this.moveFocusToDropdown('supplier'); // Move focus to the supplier input or other logic
        } else {
          event.preventDefault();         
          this.enableInlineEditing = false; 
          
          let currentCoulmn = this.tablecolumns[this.currentColIndex];
          
         
          if (this.currentRowIndex < this.allDeliveryDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          } else{
            this.addRow();
            this.enableInlineEditing = false;
          }
        }       

        break;
      case 'Shift': 
      break;

      case 'Ctrl': 
      break;

      case 'Alt': 
      break;

      

      

      default:
        if(!this.isInputDisabled){
        
                    
          // Handle other keys for inline editing
          const cellId = (event.target as HTMLElement).id;
          const cellElement = document.getElementById(cellId);
          if (cellElement) {
            const columnName = cellElement.getAttribute('data-column-name');
            const columnKeyName = cellElement.getAttribute('data-column-key-name');
            if(columnName != null){
              this.currentColumname = columnName;
            }
            if(this.enableInlineEditing == false && (columnName != 'id' )){
              this.enableInlineEditing = true;
              setTimeout(() => {
                const cellElement = document.getElementById(cellId);
                let newValue = event.key;
                // Check if the key is a character key
                const isCharacterKey = event.key.length === 1;
                if ((cellElement instanceof HTMLInputElement || cellElement instanceof HTMLTextAreaElement) && isCharacterKey) {
                  // If it's an input or textarea, set the value
                  cellElement.value = newValue;
                  if (columnKeyName !== null && columnKeyName !== undefined) {
                    
                    let tempRow:any = { ...this.allDeliveryDetails[this.currentRowIndex] };
                    tempRow[columnKeyName] = event.key;
                    this.allDeliveryDetails[this.currentRowIndex] = tempRow;
                  }
                  this.allDeliveryDetails = [...this.allDeliveryDetails];
                  this.focusGridCell(this.currentRowIndex, this.currentColIndex);
                } 
              }, 0);
              
            }  
          }  
        }
        break;
    }
    return true;
  }


  onClickSpan(event:any, rowIndex: number, colIndex: number): void {
    this.enableInlineEditing = false;
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

  handleDoubleClick(event:any){
    if(this.currentColumname != 'id' ){
      this.enableInlineEditing  = true;
    }    
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }

  handleKeysForInlineEditing(){
    // Handle other keys for inline editing
    const cellid = "cell-"+this.currentRowIndex+"-"+this.currentColIndex;
    const cellelement = document.getElementById(cellid);
    if (cellelement) {
      const columnName = cellelement.getAttribute('data-column-name');
      if(columnName != null){
        this.currentColumname = columnName;
      }
    } 
  }

  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }

  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if ( this.allDeliveryDetails.length == 1) {
        // this.noGridItem = true;
        this.allDeliveryDetails = [];
        this.allDeliveryDetails.push(this.deliveryDetailsObj);
      } else if (index !== -1) {
        this.allDeliveryDetails.splice(index, 1);
        this.selected = [];
      }
      this.allDeliveryDetails = [...this.allDeliveryDetails];
      this.selectedRowIndex = -1
    }
    return true;
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
    const stickybuttonHeight = this.stickybuttoncontainer.nativeElement.offsetHeight;    
    const btnGroupHeight = this.btngroup.nativeElement.offsetHeight;
    const availableHeight = window.innerHeight - headerHeight - footerHeight - stickybuttonHeight -btnGroupHeight -40;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight -65;
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

  onClickTab(tabId:any): void {    
    this.selectedTab = tabId;
    this.showGeneralDetails = false;
    this.showCustomerDetails = false;
    this.showOtherDetails = false;
    this.showImageContainer = false;
    this.setMaxHeight();
    if(tabId == 1){ 
      this.allDeliveryDetails = [...this.allDeliveryDetails];
      this.showGeneralDetails = true;
      this.showImageContainer = true;
    } else if(tabId == 2){
      this.showCustomerDetails = true;
    } else if(tabId == 3){      
      this.showOtherDetails = true;
    } else{

    }
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
