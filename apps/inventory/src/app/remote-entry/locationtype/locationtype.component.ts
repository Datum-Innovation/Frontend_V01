import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { LOCATIONTYPE, LOCATIONTYPES } from '../model/locationtype.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationTypeService } from '../../services/locationtype.service';
import { ActivatedRoute } from '@angular/router';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { id } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-locationtype',
  templateUrl: './locationtype.component.html',
  styleUrls: ['./locationtype.component.css'],
})
export class LocationtypeComponent {
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  LocationTypeForm!: FormGroup
  isLoading=false;
  allLocationtype =[] as Array<LOCATIONTYPE>;
  selectedloctype:number=0;
  isInputDisabled: boolean = true;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isSaveBtnDisabled: boolean = true; 
  isNewBtnDisabled: boolean = false;
  isUpdate: boolean = false;
  isOverlayVisible: boolean = false;
  destroySubscription: Subject<void> = new Subject<void>();
  pageId = 0;
  firstLocation!: number;
  
  currentLocation ={} as LOCATIONTYPES

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;  constructor(
    private formBuilder: FormBuilder,
    private locationtypeservice: LocationTypeService,
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
  ngOnInit(): void
  {
    this.LocationTypeForm= this.formBuilder.group({
      id: [{ value: '', disabled: this.isInputDisabled }],
      locationType: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
    });
    this.fetchLocationType();
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

  fetchLocationType() {
     //console.log("entering in the LocationType");
     this.locationtypeservice
     .getDetails(EndpointConstant.FILLLOCATIONMASTER)
     .pipe(takeUntil(this.destroySubscription))
     .subscribe({
       next : (response) =>{
         this.allLocationtype = response?.data;
         this.selectedloctype = this.allLocationtype[0].ID;
         this.firstLocation = this.allLocationtype[0].ID;
         this.fetchLocationTypeById();
 
       },
       error: (error) => {
         this.isLoading=false;
         console.error('An error occured',error);
       }
     });
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


   onClickLocationType(event:any):void{
    if(event.type ==='click'){
      this.selectedloctype = event.row.ID;
      //console.log(this.selecteddosage);
      this.fetchLocationTypeById();
    }
  }


fetchLocationTypeById(): void {
  this.locationtypeservice.getDetails(EndpointConstant.FILLLOCATIONBYID + this.selectedloctype)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        // console.log('API Response:', response);

        // Check if response.data has the expected structure
        if (response?.data && response.data.length > 0) {
          this.currentLocation = response?.data[0];

          // console.log('Current loc data:', this.currentLocation);

          this.LocationTypeForm.patchValue({
            id: this.currentLocation.id,
            locationType: this.currentLocation.locationType, // Ensure this matches
          });
        } else {
          console.warn('No location data available');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occurred', error);
      },
    });
}

  onClickNewLocationType()
  {
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.LocationTypeForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedloctype = this.firstLocation;
      this.fetchLocationTypeById();
  }
  else{
    this.selectedloctype = 0;
    this.enableFormControls();
  }
  const ids = this.allLocationtype.map(Type => Type.ID);
  this.LocationTypeForm.patchValue({
    id: Math.max(...ids)+1
  });
  return true
}



onClickSaveLocationType(){
  if(this.LocationTypeForm.invalid){
    Object.keys(this.LocationTypeForm.controls).forEach(field=>{
      const control:any = this.LocationTypeForm.get(field);
      if(control.invalid){
        this.baseService.showCustomDialogue('Invalid Field'+field);
        return;
      }
    });
    return;

  }

  const payload ={
    "id": this.selectedloctype,
     "locationtype": this.LocationTypeForm.value.locationType,

  };
  this.createCallback(payload);
}

createCallback(payload:any){
  console.log('Payload:', payload);
  this.locationtypeservice.saveDetails(EndpointConstant.SAVELOCATION+this.pageId,payload)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next :(response) => {
      this.isLoading = false;
      if(response.httpCode == 200){
        this.baseService.showCustomDialogue('Successfully saves Location');
        this.selectedloctype= this.firstLocation;
        this.fetchLocationTypeById();
        this.fetchLocationType();
        this.setInitialState();
      }
      if(response.httpCode == 500){
        this.baseService.showCustomDialogue(response.data);

      }
    },
    error : (error) =>{
      this.isLoading =false;
      console.error('Error saving location',error);

    }
  });

}



onClickEditLocationType(){
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
  this.fetchLocationTypeById();
  return true;
}

onClickDeleteLocationType(){
  if(!this.isDelete){
    this.baseService.showCustomDialogue('Permission Denied!');
    return false;
  }
  if(confirm("Are you sure you want to delete this details?")){
    this.isLoading=true;
    
    this.locationtypeservice.deleteDetails(EndpointConstant.DELETELOCATION+this.selectedloctype + '&PageId=' + this.pageId)
    .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data);          
          this.selectedloctype = this.firstLocation;
          this.fetchLocationType();
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
  this.LocationTypeForm.get('id')?.disable();
  this.LocationTypeForm.get('locationType')?.disable();
 
  
}
enableFormControls(){
  //this.LocationTypeForm.get('id')?.enable();
  this.LocationTypeForm.get('locationType')?.enable();
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
