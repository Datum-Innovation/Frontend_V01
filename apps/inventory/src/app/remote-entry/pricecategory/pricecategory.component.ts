import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { PRICECATEGORIES, PRICECATEGORY } from '../model/pricecategory.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceCategoryService } from '../../services/pricecategory.service';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { integerValidator } from '../../validators/integer-validator';

@Component({
  selector: 'dfinance-frontend-pricecategory',
  templateUrl: './pricecategory.component.html',
  styleUrls: ['./pricecategory.component.css'],
})
export class PricecategoryComponent {
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  isLoading=false;
  selectedPriceCategory : number=0;
  //selectedpricecategoryId=0;
  firstpricecategory !:number;
  isInputDisabled: boolean = true;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isNewBtnDisabled: boolean = false;
  isUpdate: boolean = false;
  isOverlayVisible: boolean = false;
  allPriceCategory=[] as Array<PRICECATEGORY>;
  PriceCategoryForm!: FormGroup;
  //sellingPrice = [] as Array<SELLINGPRICE>;
  destroySubscription: Subject<void> = new Subject<void>();
  currentPriceCategory ={} as PRICECATEGORIES
 // ofsellingprice :number=0;
  //pageId:number=244;
  pageId = 0;
  signList:any =[
    {
      "value" : "+",
    },
    {
      "value" : "-"
    }
  ];
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  
  constructor(
    private formBuilder: FormBuilder,
    private pricecategoryservice : PriceCategoryService,
    private route : ActivatedRoute,    
    private menudataService: MenuDataService,
    private baseService:BaseService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
  }
  
   ngOnInit(): void {
     this.PriceCategoryForm= this.formBuilder.group({
       categoryname : [{value:'',disabled: this.isInputDisabled},Validators.required],
       ofsellingprice: [{ value: '', disabled: this.isInputDisabled }],
       ofsellingpriceSign: [{ value: '', disabled: this.isInputDisabled }],
       ofsellingpriceValue: [{ value: '', disabled: this.isInputDisabled }, [Validators.required,integerValidator()]],
       description: [{value: '', disabled: this.isInputDisabled}],
       active: [{value: '', disabled: this.isInputDisabled}],
       
     });
     this.fetchPriceCategory();
   }

   setInitialState(){
    this.isNewBtnDisabled=false;
    this.isEditBtnDisabled=false;
    this.isDeleteBtnDisabled=false;
    this.isSaveBtnDisabled=true;
    this.isInputDisabled=true;
    this.isUpdate=false;
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

   fetchPriceCategory():void{
    this.pricecategoryservice
    .getDetails(EndpointConstant.FILLALLPRICECATEGORY)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allPriceCategory = response?.data;
        this.selectedPriceCategory = this.allPriceCategory[0].ID;
        this.firstpricecategory = this.allPriceCategory[0].ID;
        this.fetchPriceCategoryById();
      },
      error: (error) => {
        this.isLoading=false;
        console.error('An error occured',error);
      }
    });
   }

   onClickPriceCategory(event:any):void{
    if(event.type ==='click'){
      this.selectedPriceCategory=event.row.ID;
      this.fetchPriceCategoryById();
    }
   }

   fetchPriceCategoryById():void{
    this.pricecategoryservice
    .getDetails(EndpointConstant.FILLPRICECATEGORYBYID+this.selectedPriceCategory)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {

        //console.log('API Response:', response);


        this.currentPriceCategory = response?.data[0];

        //console.log('Current Price Category Data:', this.currentPriceCategory);

        let sign = '+';
        let decimalValue = Math.abs(this.currentPriceCategory.perc);

        if (this.currentPriceCategory.perc < 0) {
          sign = '-';
        }

        this.PriceCategoryForm.patchValue({
          categoryname: this.currentPriceCategory.name,
          ofsellingpriceSign: sign,
          ofsellingpriceValue: decimalValue,
          active: this.currentPriceCategory.active,
          description: this.currentPriceCategory.note,
          
        
        });

      // console.log('Form Values After Patching:', this.PriceCategoryForm.value);
      
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }
  


 
  onClickNewPriceCategory()
  {
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    //this.isUpdate = !this.isInputDisabled;
    //this.selectedPriceCategory=0;
    this.PriceCategoryForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedPriceCategory = this.firstpricecategory;
      this.fetchPriceCategoryById();
    }
    else{
      this.selectedPriceCategory = 0;
      this.enableFormControls();
    }
    this.PriceCategoryForm.get('ofsellingpriceSign')?.setValue('+');
    return true;
  }
 
  onClickSavePriceCategory()
  {
    if (this.PriceCategoryForm.invalid) {
      for (const field of Object.keys(this.PriceCategoryForm.controls)) {
        const control: any = this.PriceCategoryForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    const sign = this.PriceCategoryForm.get('ofsellingpriceSign')?.value;
    const value = this.PriceCategoryForm.get('ofsellingpriceValue')?.value;
    const numericValue = parseFloat(value);
    let finalValue = numericValue;
    
    if (sign === '-') {
      finalValue = -numericValue; 
    } else if (sign === '+') {
      finalValue = +numericValue; 
    } else {
      console.error('Invalid sign value');
      return;
    }
    
  
    const payload ={
      "ID" :  Number(this.selectedPriceCategory),
      "categoryName": this.PriceCategoryForm.value.categoryname,
      "sellingPrice": finalValue,
      "description":this.PriceCategoryForm.value.description,
      "active":Boolean(this.PriceCategoryForm.value.active)
    };

    if(this.isUpdate){
      this.updateCallBack(payload);
    }else{
      this.createCallBack(payload);
    }
  }

  updateCallBack(payload:any){
     
    //console.log('Payload:', payload);
    this.pricecategoryservice.updateDetails(EndpointConstant.UPDATEPRICECATEGORY+this.pageId,payload)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.baseService.showCustomDialogue("Successfully updated Price Category"); 
        this.selectedPriceCategory = this.firstpricecategory;
        this.fetchPriceCategoryById();
        this.fetchPriceCategory();
        this.setInitialState();
      },
      error: (error) => {
        this.isLoading = false;
        this.baseService.showCustomDialogue('Please try again');
      },
    });
}

  createCallBack(payload:any){
    this.pricecategoryservice.saveDetails(EndpointConstant.SAVEPRICECATEGORY+this.pageId,payload)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        if(response.httpCode == 200){
          this.baseService.showCustomDialogue('Successfully saves PriceCategory');
          this.selectedPriceCategory = this.firstpricecategory;
          this.fetchPriceCategoryById();
          this.fetchPriceCategory();
          this.setInitialState();
        }
        if(response.httpCode == 500){
          this.baseService.showCustomDialogue(response.data);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving pricecategory',error);
      }
     });
  }

  onClickEditPriceCategory(){
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
    this.fetchPriceCategoryById();
    return true;
  }

  onClickDeletePriceCategory(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.pricecategoryservice.deleteDetails(EndpointConstant.DELETEPRICECATEGORY+this.selectedPriceCategory +'&PageId=' +this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data);          
          this.selectedPriceCategory = this.firstpricecategory;
          this.fetchPriceCategory();
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


  disbaleFormControls(){
    this.PriceCategoryForm.get('categoryname')?.disable();
    this.PriceCategoryForm.get('ofsellingpriceSign')?.disable();
    this.PriceCategoryForm.get('ofsellingpriceValue')?.disable();
    this.PriceCategoryForm.get('description')?.disable();
    this.PriceCategoryForm.get('active')?.disable();
    
  }
  enableFormControls(){
    this.PriceCategoryForm.get('categoryname')?.enable();
    this.PriceCategoryForm.get('ofsellingpriceSign')?.enable();
    this.PriceCategoryForm.get('ofsellingpriceValue')?.enable();
    this.PriceCategoryForm.get('description')?.enable();
    this.PriceCategoryForm.get('active')?.enable();
   
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
      const leftContentHeight = window.innerHeight - headerHeight - footerHeight - 30;
  
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
