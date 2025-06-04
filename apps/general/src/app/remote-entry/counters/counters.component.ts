import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { COUNTER, COUNTERS, NAME } from '../model/counters.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseService, EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { CounterService } from '../../services/counter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dfinance-frontend-counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.css'],
})
export class CountersComponent {
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild(MainHeaderComponent,{read:ElementRef}) header !: ElementRef;
  isLoading=false;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = true;
  isSaveBtnDisabled: boolean = true; 
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false; 
  isUpdate: boolean = false;
  isOverlayVisible: boolean = false;
  destroySubscription: Subject<void> = new Subject<void>();

  CounterComponentForm !: FormGroup;
  selectedcounter: number=0;
  firstcounter!:number;

  allcounters =[] as Array<COUNTER>;
  currentcounters={} as COUNTERS

  pageId = 0;
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  isEditMode = false;
  constructor(
    private formBuilder: FormBuilder,
    private counterservice: CounterService,
    private route : ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService:BaseService
  ){
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
  }

  ngOnInit(): void{
  this.createForm();
    this.fetchCounter();

  }
  fetchMenuDataPermissions(){
    let menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
    this.isView = menuData.isView;
    this.isCreate = menuData.isCreate;
    this.isEdit = menuData.isEdit;
    console.log("IsEdit  :"+this.isEdit);
    this.isDelete = menuData.isDelete;
    this.isCancel = menuData.isCancel;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }
createForm(){
  this.CounterComponentForm= this.formBuilder.group({
    machinename : [{ value: '', disabled: this.isInputDisabled }],
    countercode : [{ value: '', disabled: this.isInputDisabled },Validators.required],
    countername : [{ value: '', disabled: this.isInputDisabled },Validators.required],
    machineip : [{ value: '', disabled: this.isInputDisabled }],
    active : [{ value: '', disabled: this.isInputDisabled }],
  });
}
  
  setInitialState(){
    this.isNewBtnDisabled=true;
    this.isEditBtnDisabled=false;
    this.isDeleteBtnDisabled=false;
    this.isSaveBtnDisabled=true;
    this.isInputDisabled=true;
    this.isUpdate=false;
    this.disbaleFormControls();
   }

  fetchCounter(): void{
    this.counterservice
    .getDetails(EndpointConstant.FILLCOUNTERS)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next : (response)=>{
        this.allcounters = response?.data;
        this.selectedcounter = this.allcounters[0].id;
        this.firstcounter=this.allcounters[0].id;
        this.fetchCountersById();
      },
      error :(error)=>{
        this.isLoading=false;
        console.error('An error occured',error);
      }
    });
  }

  onClickCounters(event:any):void{
    if(event.type ==='click'){
      this.selectedcounter = event.row.id;
      this.fetchCountersById();

    }
  }


  fetchCountersById():void{
    this.counterservice.getDetails(EndpointConstant.FILLCOUNTERSBYID+ this.selectedcounter)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next : (response)=>{
        this.currentcounters = response?.data;
        this.CounterComponentForm.patchValue({
     
          machinename: this.currentcounters.machineName,
          countercode: this.currentcounters.counterCode,
          countername: this.currentcounters.counterName,
          machineip: this.currentcounters.machineIP,
          active: this.currentcounters.active
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }


  onClickNewCounters(){
    if(!this.isCreate){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.CounterComponentForm.reset();
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedcounter = this.firstcounter;
      this.fetchCountersById();
  }
  else{
    this.selectedcounter = 0;
    this.enableFormControls();
  }

  // this.counterservice.getDetails(EndpointConstant.FILLNAMEANDIP)

  // .pipe(takeUntil(this.destroySubscription))
  //   .subscribe({
  //     next : (response)=>{

  //       this.nameandip = response?.data;
  //       this.CounterComponentForm.patchValue({
     
  //         machinename: this.nameandip.machinename,
          
  //         machineip: this.nameandip.machineIp,
          
  //       });
  //     },
  //     error :(error)=>{
  //       this.isLoading=false;
  //       console.error('An error occured',error);
  //     }
        

  //   });
  return true;
  }


  onClickSaveCounters(){
    if(this.CounterComponentForm.invalid){
      Object.keys(this.CounterComponentForm.controls).forEach(field=>{
        const control:any = this.CounterComponentForm.get(field);
        if(control.invalid){
          alert('Invalid Field'+field);
          return;
        }
      });
      return;
  
    }
  
    const payload ={
      "id": this.selectedcounter,
      "machinename": this.CounterComponentForm.value.machinename,
      "countercode": this.CounterComponentForm.value.countercode,
      "countername": this.CounterComponentForm.value.countername,
      "machineip": this.CounterComponentForm.value.machineip,
      "active": this.CounterComponentForm.value.active
    };
      this.updateCallBack(payload);
   
  }
  


  createCallBack(payload:any){
    this.counterservice.saveDetails(EndpointConstant.SAVECOUNTERS,payload)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {

      
        this.isLoading = false;
        if(response.httpCode == 200){
          this.baseService.showCustomDialogue(response.data.msg);  
          this.selectedcounter = this.firstcounter;
          this.fetchCountersById();
          this.fetchCounter();
          this.setInitialState();
        }
        if(response.httpCode == 500){
          alert(response.data);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving counter',error);
      }
     });
  }
  

  updateCallBack(payload:any){
    this.counterservice.updateDetails(EndpointConstant.UPDATECOUNTERS+this.pageId,payload)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.baseService.showCustomDialogue(response.data.msg);  
        this.selectedcounter = this.firstcounter;
        this. fetchCountersById();
        this.fetchCounter();
        this.setInitialState();
      },
      error: (error) => {
        this.isLoading = false;
        alert('Please try again');
      },
    });
  }



  onClickEditCounters(){
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    //this.isNewBtnDisabled = this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    if(this.isInputDisabled == false){
      this.enableFormControls();
    } else{
      this.disbaleFormControls();
    }
    this.fetchCountersById();
    return true;
  }



  onClickDeleteCounters(){
    if(!this.isDelete){
      alert('Permission Denied!');
      return false;
    }
    if(confirm("Are you sure you want to delete this details?")) {
      this.isLoading = true;
      this.counterservice.deleteDetails(EndpointConstant.DELETECOUNTERS+this.selectedcounter +'&PageId=' +this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);          
          this.selectedcounter = this.firstcounter;
          this.fetchCounter();
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          alert('Please try again');
        },
      });
    }
    return true;
  }

  disbaleFormControls(){
    this.CounterComponentForm.get('machinename')?.disable();
    this.CounterComponentForm.get('countercode')?.disable();
    this.CounterComponentForm.get('countername')?.disable();
    this.CounterComponentForm.get('machineip')?.disable();
    this.CounterComponentForm.get('active')?.disable();
  }
  enableFormControls(){
    this.CounterComponentForm.get('machinename')?.enable();
    this.CounterComponentForm.get('countercode')?.enable();
    this.CounterComponentForm.get('countername')?.enable();
    this.CounterComponentForm.get('machineip')?.enable();
    this.CounterComponentForm.get('active')?.enable();
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
