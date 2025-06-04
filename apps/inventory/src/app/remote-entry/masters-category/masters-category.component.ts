import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { CategoryService } from '../../services/category.service';
import { CATEGORIES ,CATEGORY} from '../model/mastercategory.interface';
import { CATEGORYTYPES } from '../model/mastercategorytype.interface';
import { DatePipe, formatDate } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NativeDateAdapter, DateAdapter,
  MAT_DATE_FORMATS } from '@angular/material/core';
declare var $: any;
export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

class PickDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd/MM/yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

@Component({
  selector: 'dfinance-frontend-masters-category',
  templateUrl: './masters-category.component.html',
  styleUrls: ['./masters-category.component.css'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
  ]
})
export class MastersCategoryComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  categoryForm!: FormGroup;    
  allCategories = [] as Array<CATEGORIES>;   
  selectedCategoryId = 0;
  firstCategory = 0;
  isActive: number = 0;
  currentCategory = {} as CATEGORY;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;

  categoryTypeOptions = [] as Array<CATEGORYTYPES>;
  selectedCategoryTypeOption = '';
  categoryTypereturnField = 'code';
  categoryTypeKeys = ['Code','Description','ID'];
  selectedCategoryTypeObj:any = {};

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
    private categoryService: CategoryService,
    private datePipe: DatePipe,
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
  date : any;
  ngOnInit(): void {
    this.categoryForm = this.formBuilder.group({      
      categorycode: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      categoryname: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      categorytype: [{value: '', disabled: this.isInputDisabled},],
      startdate: [{value: '', disabled: this.isInputDisabled}],      
      enddate: [{value: '', disabled: this.isInputDisabled}],      
      active: [{value: true, disabled: this.isInputDisabled}],      
      disableminusstock: [{value: '', disabled: this.isInputDisabled}],      
      discountperc: [{value: '', disabled: this.isInputDisabled}]
    });
    this.fetchallCategory();
    this.fetchallCategoryType();

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

  fetchallCategory(): void {
    this.categoryService
    .getDetails(EndpointConstant.FILLALLMASTERCATEGORIES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allCategories = response?.data;        
        this.selectedCategoryId = this.allCategories[0].id;
        this.firstCategory = this.allCategories[0].id;
        this.fetchCategoryById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  fetchallCategoryType(): void {
    this.categoryService
    .getDetails(EndpointConstant.FILLALLCATEGORYTYPES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        let responseCategoryType = response?.data; 
        responseCategoryType.forEach((element:any) => {
          this.categoryTypeOptions.push({
            "code":element.code,
            "description":element.description,
            "id":element.id
          })
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickCategory(event:any): void {
    if (event.type === 'click') {
      this.selectedCategoryId = event.row.id;
      this.fetchCategoryById();
    }
  }

  fetchCategoryById(): void { 
    this.categoryService
    .getDetails(EndpointConstant.FILLMASTERSCATEGORYBYID+this.selectedCategoryId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCategory = response?.data[0];
        let formsDate = null;
        let formeDate = null;

        if(this.currentCategory.startDate != null){
          formsDate = this.datePipe.transform(new Date(this.currentCategory.startDate), 'yyyy-MM-dd');
        }
        if(this.currentCategory.endDate != null){
          formeDate = this.datePipe.transform(new Date(this.currentCategory.endDate), 'yyyy-MM-dd');
        }

        this.categoryForm.patchValue({
          categorycode: this.currentCategory.code,
          categoryname: this.currentCategory.description,
          categorytype: this.currentCategory.typeCode,
          startdate:formsDate,
          enddate: formeDate,
          active: this.currentCategory.activeFlag,
          disableminusstock: this.currentCategory.minusStock,
          discountperc: this.currentCategory.discount,
        });
        this.onCategoryTypeSelected(this.currentCategory.typeCode);
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewCategory(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.categoryForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCategoryId = this.firstCategory;
      this.fetchCategoryById();
    } else{
      this.selectedCategoryId = 0;
      this.enableFormControls(); 
      this.categoryForm.patchValue({
        active:true
      });
      this.generateCategoryCode();   
      this.selectedCategoryTypeObj = {}; 
      this.selectedCategoryTypeOption = "";
    }
    return true;
  }

  generateCategoryCode(){
    this.categoryService
    .getDetails(EndpointConstant.FETCHMASTERCATEGORYCODE)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.categoryForm.patchValue({
          categorycode: response?.data,
        });
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickEditCategory(){
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
      this.selectedCategoryTypeObj = {};       
      this.selectedCategoryTypeOption = "";
    } else{
      this.disbaleFormControls();
    }
    this.fetchCategoryById();
    return true;
  }

  onClickDeleteCategory(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.categoryService.deleteDetails(EndpointConstant.DELETEMASTERCATEGORY+this.selectedCategoryId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedCategoryId = this.firstCategory;
          this.fetchallCategory();
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

  onClickSaveCategory() {
    if (this.categoryForm.invalid) {
      for (const field of Object.keys(this.categoryForm.controls)) {
        const control: any = this.categoryForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    this.selectedCategoryTypeObj.name = null;
    const selectedsDate = this.categoryForm.value.startdate;
    // Create a JavaScript Date object from the provided date components
    const sDateisoString = selectedsDate ? (this.convertToLocalDateString(new Date(selectedsDate))) : null;
   
    const selectedeDate = this.categoryForm.value.enddate;
    // Create a JavaScript Date object from the provided date components
    const eDateisoString = selectedeDate ? (this.convertToLocalDateString(new Date(selectedeDate))) : null;
    

    const payload = {
      "categoryName": this.categoryForm.get('categoryname')?.value,
      "categoryCode": this.categoryForm.get('categorycode')?.value,
      "categoryType":this.selectedCategoryTypeObj,
      "category": "s",
      "activeFlag": this.categoryForm.get('active')?.value ? 1 : 0,
      "measurementType": "s",
      "minimumQuantity": 0,
      "maximumQuantity": 0,
      "floorRate": 0,
      "minusStock":this.categoryForm.get('disableminusstock')?.value ? 1 : 0,
      "startDate": sDateisoString,
      "endDate": eDateisoString,
      "discountPerc": this.categoryForm.get('discountperc')?.value
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.categoryService.updateDetails(EndpointConstant.UPDATEMASTERCATEGORY+this.selectedCategoryId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedCategoryId = this.firstCategory;
          this.fetchCategoryById();
          this.fetchallCategory();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.categoryService.saveDetails(EndpointConstant.SAVEMASTERCATEGORY,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedCategoryId = this.firstCategory;
          this.fetchCategoryById();
          this.fetchallCategory();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Category', error);
        },
      });
  }

  onCategoryTypeSelected(option: string):any{    
    this.selectedCategoryTypeOption = option;
    this.categoryTypeOptions.forEach((item) => {
      if (item.code === option) {
        this.selectedCategoryTypeObj = item;
      }
    });
    this.categoryForm.patchValue({
      categorytype:this.selectedCategoryTypeOption,
    }); 
  }

  enableFormControls(){
    this.categoryForm.get('categorycode')?.enable();
    this.categoryForm.get('categoryname')?.enable();
    this.categoryForm.get('categorytype')?.enable();
    this.categoryForm.get('startdate')?.enable();
    this.categoryForm.get('enddate')?.enable();
    this.categoryForm.get('active')?.enable();
    this.categoryForm.get('disableminusstock')?.enable();
    this.categoryForm.get('discountperc')?.enable();
  }

  disbaleFormControls(){
    this.categoryForm.get('categorycode')?.disable();
    this.categoryForm.get('categoryname')?.disable();
    this.categoryForm.get('categorytype')?.disable();
    this.categoryForm.get('startdate')?.disable();
    this.categoryForm.get('enddate')?.disable();
    this.categoryForm.get('active')?.disable();
    this.categoryForm.get('disableminusstock')?.disable();
    this.categoryForm.get('discountperc')?.disable();
  }

  convertToLocalDateString(selectedDate: Date | null): string | null {
    if (!selectedDate) {
      return null;
    }
  
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const seconds = selectedDate.getSeconds().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
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
