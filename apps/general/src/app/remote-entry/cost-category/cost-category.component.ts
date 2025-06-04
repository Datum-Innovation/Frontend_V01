import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { CostCategoryService } from '../../services/costcategory.service';
import { COSTCATEGORIES, COSTCATEGORY} from '../model/costcategory.interface';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-cost-category',
  templateUrl: './cost-category.component.html',
  styleUrls: ['./cost-category.component.css'],
})
export class CostCategoryComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  costCategoryForm!: FormGroup;    
  allCostCategories = [] as Array<COSTCATEGORIES>;   
  selectedCostCategoryId = 0;
  firstCategory = 0;
  isActive: number = 0;
  currentCostCategory = {} as COSTCATEGORY;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;
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
    private costCategoryService: CostCategoryService,
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
    this.costCategoryForm = this.formBuilder.group({      
      name: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      description: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      allocaterevenue: [{value: '', disabled: this.isInputDisabled},],
      allocatenonrevenue: [{value: '', disabled: this.isInputDisabled}],   
      active: [{value: true, disabled: this.isInputDisabled}], 
    });
    this.fetchallCostCategory();
    

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

  fetchallCostCategory(): void {
    this.costCategoryService
    .getDetails(EndpointConstant.FILLALLCOSTCATEGORIES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allCostCategories = response?.data;        
        this.selectedCostCategoryId = this.allCostCategories[0].id;
        this.firstCategory = this.allCostCategories[0].id;
        this.fetchCostCategoryById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickCostCategory(event:any): void {
    if (event.type === 'click') {
      this.selectedCostCategoryId = event.row.id;
      this.fetchCostCategoryById();
    }
  }

  fetchCostCategoryById(): void { 
    this.costCategoryService
    .getDetails(EndpointConstant.FILLCOSTCATEGORYBYID+this.selectedCostCategoryId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentCostCategory = response?.data[0];       
       
        this.costCategoryForm.patchValue({
          name: this.currentCostCategory.name,
          description: this.currentCostCategory.description,
          allocaterevenue: this.currentCostCategory.allocateRevenue,
          allocatenonrevenue:this.currentCostCategory.allocateNonRevenue,
          active: this.currentCostCategory.active,
        });
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewCostCategory(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.costCategoryForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCostCategoryId = this.firstCategory;
      this.fetchCostCategoryById();
    } else{
      this.selectedCostCategoryId = 0;
      this.enableFormControls(); 
      this.costCategoryForm.patchValue({
        active:true
      });
    }
    return true;
  }

  onClickEditCostCategory(){
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
    return true;
  }

  onClickDeleteCostCategory(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.costCategoryService.deleteDetails(EndpointConstant.DELETECOSTCATEGORY+this.selectedCostCategoryId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedCostCategoryId = this.firstCategory;
          this.fetchallCostCategory();
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

  onClickSaveCostCategory() {
    if (this.costCategoryForm.invalid) {
      for (const field of Object.keys(this.costCategoryForm.controls)) {
        const control: any = this.costCategoryForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
   
    const payload =  {
      "name": this.costCategoryForm.get('name')?.value,
      "description": this.costCategoryForm.get('description')?.value,
      "allocateRevenue": this.costCategoryForm.get('allocaterevenue')?.value ? true : false,
      "allocateNonRevenue": this.costCategoryForm.get('allocatenonrevenue')?.value ? true : false,
      "active": this.costCategoryForm.get('active')?.value ? true : false,
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.costCategoryService.updateDetails(EndpointConstant.UPDATECOSTCATEGORY+this.selectedCostCategoryId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedCostCategoryId = this.firstCategory;
          this.fetchCostCategoryById();
          this.fetchallCostCategory();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.costCategoryService.saveDetails(EndpointConstant.SAVECOSTCATEGORY,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedCostCategoryId = this.firstCategory;
          this.fetchCostCategoryById();
          this.fetchallCostCategory();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Category', error);
        },
      });
  }

  enableFormControls(){
    this.costCategoryForm.get('name')?.enable();
    this.costCategoryForm.get('description')?.enable();
    this.costCategoryForm.get('allocaterevenue')?.enable();
    this.costCategoryForm.get('allocatenonrevenue')?.enable();
    this.costCategoryForm.get('active')?.enable();
  }

  disbaleFormControls(){
    this.costCategoryForm.get('name')?.disable();
    this.costCategoryForm.get('description')?.disable();
    this.costCategoryForm.get('allocaterevenue')?.disable();
    this.costCategoryForm.get('allocatenonrevenue')?.disable();
    this.costCategoryForm.get('active')?.disable();
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
