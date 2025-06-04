import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService} from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { SETTINGS, SINGLESETTING } from '../model/settings.interface';

declare var $: any;
@Component({
  selector: 'dfinance-frontend-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  settingsForm!: FormGroup;    
  allSettings = [] as Array<SETTINGS>; 
  selectedSettingsId!: number;
  firstSetting!:number;
  active: boolean = false;
  isGroup: boolean = false;
  currentSetting = {} as SINGLESETTING;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isUpdate: boolean = false;  
  
  tempSettingsList:any = [];  
 
  isLoading = false;

  displayPasswordField = false;

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
    private settingsService: SettingsService,
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
    this.settingsForm = this.formBuilder.group({      
      key:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      value:[{value:'',disabled:this.isInputDisabled}, Validators.required],
      description:[{value:'',disabled:this.isInputDisabled}],
      systemsetting:[{value:'',disabled:this.isInputDisabled}],
      password:[{value:''}]
    });
    this.fetchAllSettings();
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

  fetchAllSettings(): void {
    this.settingsService
    .getDetails(EndpointConstant.FILLALLSETTINGS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.allSettings = response?.data;
        this.tempSettingsList = [...this.allSettings];
        this.selectedSettingsId = this.allSettings[0].id;
        this.firstSetting = this.allSettings[0].id;
        this.fetchSettingById();
      },
      error: (error) => {
        //this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }

  onClickSettings(event:any): void {
    if (event.type === 'click') {
      this.selectedSettingsId = event.row.id;
      this.fetchSettingById();
    }
  }

  fetchSettingById(): void {
    this.settingsService
    .getDetails(EndpointConstant.FILLSETTINGSBYID  +this.selectedSettingsId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.currentSetting = response?.data[0];
        
        this.settingsForm.patchValue({
          key: this.currentSetting.key,
          value: this.currentSetting.value,          
          description: this.currentSetting.description,
          systemsetting: this.currentSetting.systemSetting
        });
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }


  onClickNewSettings(){
    if(!this.isCreate){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.settingsForm.reset();
    this.displayPasswordField = false;
    this.settingsForm.patchValue({
      password: ""
    });
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedSettingsId = this.firstSetting;
      this.fetchSettingById();
    } else{
      this.selectedSettingsId = 0;
      this.enableFormControls();
    }
    return true;
  }

  onClickEditSettings(){
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    this.displayPasswordField = false;    
    // empty the password field
    this.settingsForm.patchValue({
      password: ""
    });
    if(this.isInputDisabled == false){
      this.enableFormControls();
    } else{
      this.disbaleFormControls();
    }
    this.fetchSettingById();
    return true;
  }

  onClickDeleteSettings(){
    if(!this.isDelete){
      alert('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      let password = "" ;
      
      if(this.settingsForm.value.password){
        password = this.settingsForm.value.password;
      } 
      this.settingsService.deleteDetails(EndpointConstant.DELETESETTING+this.selectedSettingsId+'&password='+password)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 500){
            alert(response.data);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue(response.data.msg)         
            this.selectedSettingsId = this.firstSetting;
            this.fetchAllSettings();
            this.setInitialState();
            this.displayPasswordField = false;
          }          
        },
        error: (errormsg) => {
          if(errormsg.status == 400 && errormsg.error){
            if(errormsg.error?.errors.password){
              alert('Please provide a valid password and press save button');    
              this.displayPasswordField = true;
            }
          }
          this.isLoading = false;
        },
      });
    }
    return true;
  }

  onClickSaveSettings() {
    if (this.settingsForm.invalid) {
      for (const field of Object.keys(this.settingsForm.controls)) {
        const control: any = this.settingsForm.get(field);
        if (control.invalid) {
          alert('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    
    const payload = {
      "key": this.settingsForm.value.key,
      "value": this.settingsForm.value.value,
      "description": this.settingsForm.value.description,
      "systemSetting": this.settingsForm.value.systemsetting ? true : false
    };

    if(this.isUpdate){
      this.updateCallback(payload,this.selectedSettingsId);
    } else{
      this.createCallback(payload);
    }
  }

  updateCallback(payload:any,settingsId:any){
    let password = "" ;
    if(this.settingsForm.value.password){
      password = this.settingsForm.value.password;
    } 
    this.settingsService.updateDetails(EndpointConstant.UPDATESETTING + settingsId+'&password='+password,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          if(response.httpCode == 500){
            alert(response.data);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue(response.data.msg)         
            this.selectedSettingsId = this.firstSetting;
            this.fetchSettingById();
            this.fetchAllSettings();
            this.setInitialState();
            // empty the password field
            this.settingsForm.patchValue({
              password: ""
            });
            this.displayPasswordField = false;
          }          
        },
        error: (errormsg) => {
          if(errormsg.status == 400 && errormsg.error){
            if(errormsg.error?.errors.password){
              alert('Please provide a valid password and press save button');    
              this.displayPasswordField = true;
            }
          }
          this.isLoading = false;
        },
      });
  }

  createCallback(payload:any){    
    let password = "" ;
    if(this.settingsForm.value.password){
      password = this.settingsForm.value.password;
    } 
    this.settingsService.saveDetails(EndpointConstant.SAVESETTING+password,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(response.httpCode == 500){
            alert(response.data);
          }
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue(response.data.msg) 
            this.selectedSettingsId = this.firstSetting;
            this.fetchSettingById();
            this.fetchAllSettings();
            this.setInitialState();
            // empty the password field
            this.settingsForm.patchValue({
              password: ""
            });
            this.displayPasswordField = false;
          }        
          
        },
        error: (errormsg) => {
          if(errormsg.status == 400 && errormsg.error){
            if(errormsg.error?.errors.password){
              alert('Please provide a valid password and press save button');    
              this.displayPasswordField = true;
            }
          }
          this.isLoading = false;
        },
      });
  }

  filtersettings(event:any) {
    const val = event.target.value.toLowerCase();

    const temp = this.tempSettingsList.filter((d: any) => {
      // Ensure code and name are strings before performing includes
      const key = d.key ? d.key.toString().toLowerCase() : '';
      const value = d.value ? d.value.toString().toLowerCase() : '';
      const valLower = val.toLowerCase();
      
      return key.includes(valLower) || value.includes(valLower);
    });
    // update the rows
    this.allSettings = temp;
  }

  enableFormControls(){
    this.settingsForm.get('key')?.enable();
    this.settingsForm.get('value')?.enable();
    this.settingsForm.get('description')?.enable();
    this.settingsForm.get('systemsetting')?.enable();

  }

  disbaleFormControls(){
    this.settingsForm.get('key')?.disable();
    this.settingsForm.get('value')?.disable();
    this.settingsForm.get('description')?.disable();
    this.settingsForm.get('systemsetting')?.disable();
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
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight - 65;
    
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
