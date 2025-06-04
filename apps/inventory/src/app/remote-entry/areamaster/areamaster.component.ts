import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { BASICUNIT, UNITMASTER } from '../model/unitmaster.interface';
import { AREAGROUPPOPUP, AREAMASTER, AREAMASTERS } from '../model/areamaster.interface';
import { AreaMasterService } from '../../services/areamaster.service';
declare var $: any;
@Component({
  selector: 'dfinance-frontend-areamaster',
  templateUrl: './areamaster.component.html',
  styleUrls: ['./areamaster.component.css'],
})
export class AreamasterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  areaMasterForm!: FormGroup;    
  allAreaMaster = [] as Array<AREAMASTERS>;   
  selectedAreaMasterId = 0;
  firstAreaMaster = 0;
  isActive: number = 0;
  currentAreaMaster = {} as AREAMASTER;   
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;
  isLoading = false;

  areaGroupData = [] as Array<AREAGROUPPOPUP>;
  selectedAreaGroupOption = '';
  areaGroupreturnField = 'name';
  areaGroupKeys = ['Code','Name','ID'];
  selectedGroupId = 0;

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
    private areaMasterService: AreaMasterService,
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
    this.areaMasterForm = this.formBuilder.group({      
      code: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      name: [{value: '', disabled: this.isInputDisabled}, Validators.required],
      description: [{value: '', disabled: this.isInputDisabled}],
      group: [{value: '', disabled: this.isInputDisabled}],
      isgroup: [{value: true, disabled: this.isInputDisabled}], 
      active: [{value: true, disabled: this.isInputDisabled}]
    });
    this.fetchallAreaMaster();
    this.fetchAreaGroup();

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

  fetchallAreaMaster(): void {
    this.areaMasterService
    .getDetails(EndpointConstant.FILLAREAMASTER)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allAreaMaster = response?.data;        
        this.selectedAreaMasterId = this.allAreaMaster[0].id;
        this.firstAreaMaster = this.allAreaMaster[0].id;
        this.fetchAreaMasterById();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }
  
  fetchAreaGroup(): void{
    this.areaMasterService
    .getDetails(EndpointConstant.FILLAREAGROUPPOPUP)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        let areaGroup = response?.data;       
        areaGroup.forEach((item:any) => {
          this.areaGroupData.push({
            "code":item.code,
            "name":item.value,
            "id":item.id
          })
        });
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

  onClickAreaMaster(event:any): void {
    if (event.type === 'click') {
      this.selectedAreaMasterId = event.row.id;
      this.fetchAreaMasterById();
    }
  }

  fetchAreaMasterById(): void {    
    //this.fetchBasicUnit();
    this.areaMasterService
    .getDetails(EndpointConstant.FILLAREAMASTERBYID+this.selectedAreaMasterId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentAreaMaster = response?.data[0];
        this.areaMasterForm.patchValue({
          code: this.currentAreaMaster.code,
          name: this.currentAreaMaster.name,
          description: this.currentAreaMaster.note,
          group: this.currentAreaMaster.parentName,
          isgroup: this.currentAreaMaster.isGroup,
          active: this.currentAreaMaster.active
        });
        this.selectedAreaGroupOption = this.currentAreaMaster.parentName ? this.currentAreaMaster.parentName : "";
        this.selectedGroupId = this.currentAreaMaster.parentId;
        
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickNewAreaMaster(){
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.areaMasterForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedAreaMasterId = this.firstAreaMaster;
      this.fetchAreaMasterById();
    } else{
      this.selectedAreaMasterId = 0;
      this.enableFormControls(); 
      this.areaMasterForm.patchValue({
        active:true,
        isgroup:true
      });     
    }
    return true;
  }

  onClickEditAreaMaster(){
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
    this.fetchAreaMasterById();
    return true;
  }

  onClickDeleteAreaMaster(){
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.areaMasterService.deleteDetails(EndpointConstant.DELETEAREAMASTER+this.selectedAreaMasterId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedAreaMasterId = this.firstAreaMaster;
          this.fetchallAreaMaster();
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

  onClickSaveAreamaster() {
    if (this.areaMasterForm.invalid) {
      for (const field of Object.keys(this.areaMasterForm.controls)) {
        const control: any = this.areaMasterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }

    const payload = {
      "code": this.areaMasterForm.value.code,
      "name": this.areaMasterForm.value.name,
      "description": this.areaMasterForm.value.description,
      "group": this.selectedGroupId,
      "isGroup": this.areaMasterForm.value.isgroup ? this.areaMasterForm.value.isgroup : false,
      "active": this.areaMasterForm.value.active ? this.areaMasterForm.value.active : false,
    };
    if(this.isUpdate){
      this.updateCallback(payload);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any){
    this.areaMasterService.updateDetails(EndpointConstant.UPDATEAREAMASTER+this.selectedAreaMasterId,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedAreaMasterId = this.firstAreaMaster;
          this.fetchAreaMasterById();
          this.fetchallAreaMaster();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload:any){
    this.areaMasterService.saveDetails(EndpointConstant.SAVEAREAMASTER,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg); 
          this.selectedAreaMasterId = this.firstAreaMaster;
          this.fetchAreaMasterById();
          this.fetchallAreaMaster();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Area master', error);
          this.baseService.showCustomDialogue('Error saving Area master');
        },
      });
  }

  onAreaGroupSelected(option: string):any{   console.log(option); 
    this.selectedAreaGroupOption = option;
    if(option == "" ){
      this.selectedGroupId = 0;
    }
    this.areaGroupData.forEach((item) => {
      if (item.name === option) {
        this.selectedGroupId = item.id;
      }
    });
    this.areaMasterForm.patchValue({
      group:this.selectedAreaGroupOption,
    }); 
  }

  enableFormControls(){
    this.areaMasterForm.get('code')?.enable();
    this.areaMasterForm.get('name')?.enable();
    this.areaMasterForm.get('description')?.enable();
    this.areaMasterForm.get('group')?.enable();
    this.areaMasterForm.get('isgroup')?.enable();
    this.areaMasterForm.get('active')?.enable();
  }

  disbaleFormControls(){
    this.areaMasterForm.get('code')?.disable();
    this.areaMasterForm.get('name')?.disable();
    this.areaMasterForm.get('description')?.disable();
    this.areaMasterForm.get('group')?.disable();
    this.areaMasterForm.get('isgroup')?.disable();
    this.areaMasterForm.get('active')?.disable();
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
