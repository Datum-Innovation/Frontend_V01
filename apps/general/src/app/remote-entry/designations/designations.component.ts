import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService, minLengthValidator, selectToken } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import {  Designation, Designations } from '../model/designation.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DesignationsService } from '../../services/designations.service';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-designations',
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.css'],
})
export class DesignationsComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('scrollableDivLeft') scrollableDivLeft!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  designationForm!: FormGroup;    
  allDesignations = [] as Array<Designations>; 
  selectedDesignationId!: number;
  firstDesignation!:number;
  isActive: number = 0;
  currentDesignation = {} as Designation;
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
    private designationsService: DesignationsService,
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
    this.designationForm = this.formBuilder.group({      
      designation:[{value:'',disabled:this.isInputDisabled}, Validators.required]
    });
    this.fetchAllDesignations();
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

  fetchAllDesignations(): void {
    //this.isLoading = true;
    this.designationsService
    .getDetails(EndpointConstant.FILLALLDESIGNATIONS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.allDesignations = response?.data;
        //this.setBranches();
        this.selectedDesignationId = this.allDesignations[0].id;
        this.firstDesignation = this.allDesignations[0].id;
        this.fetchDesignationById();
      },
      error: (error) => {
       // this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

 

  onClickDesignation(event:any): void {
    if (event.type === 'click') {
      this.selectedDesignationId = event.row.id;
      this.fetchDesignationById();
    }
  }

  fetchDesignationById(): void {
    //this.isLoading = true;
    this.designationsService
    .getDetails(EndpointConstant.FILLALLDESIGNATIONSBYID  +this.selectedDesignationId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        //this.isLoading = false;
        this.currentDesignation = response?.data[0];
        this.designationForm.patchValue({
          designation: this.currentDesignation.name
        });
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewDesignation(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.designationForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedDesignationId = this.firstDesignation;
      this.fetchDesignationById();
    } else{
      this.selectedDesignationId = 0;
      this.enableFormControls();
    }
    return true;
  }

  onClickEditDesignation(){
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
    this.fetchDesignationById();
    return true;
  }

  onClickDeleteDesignation(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
     
      this.isLoading = true;
      this.designationsService.deleteDetails(EndpointConstant.DELETEDESIGNATION+this.selectedDesignationId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedDesignationId = this.firstDesignation;
          this.fetchAllDesignations();
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

  onClickSaveDesignation() {
    if (this.designationForm.invalid) {
      for (const field of Object.keys(this.designationForm.controls)) {
        const control: any = this.designationForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    this.isLoading = true;
    const payload = {      
      name: this.designationForm.value.designation
    };
    if(this.isUpdate){
      this.updateCallback(payload,this.selectedDesignationId);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any,designationId:any){
    this.designationsService.updateDetails(EndpointConstant.UPDATEDESIGNATION + designationId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedDesignationId = this.firstDesignation;
          this.fetchDesignationById();
          this.fetchAllDesignations();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.designationsService.saveDetails(EndpointConstant.SAVEDESIGNATION,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedDesignationId = this.firstDesignation;
          this.fetchDesignationById();
          this.fetchAllDesignations();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Designation', error);
        },
      });
  }

  enableFormControls(){
    this.designationForm.get('designation')?.enable();
  }

  disbaleFormControls(){
    this.designationForm.get('designation')?.disable();
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
