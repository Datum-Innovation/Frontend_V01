import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { BaseService } from '@dfinance-frontend/shared';

@Component({
  selector: 'dfinance-frontend-companypopup',
  templateUrl: './companypopup.component.html',
  styleUrls: ['./companypopup.component.css'],
})
export class CompanypopupComponent {
  @Input() allBranches: any[] = [];
  @Input() savedBranches:any[] = [];
  @Output() selectionConfirmed = new EventEmitter<any[]>();

  selectedBranchesForm!: FormGroup;
  showPopup = true;
  constructor(private formBuilder: FormBuilder,
    private baseService:BaseService) {
  }

  ngOnInit() {
    this.initializeForm();
  }
  
  private initializeForm() {
    this.selectedBranchesForm = this.formBuilder.group({});
    this.allBranches.forEach(branch => {
      let initialValue = false;
      this.savedBranches.forEach(innerArray => {
        // Check if branch.id exists in the inner array
        if (innerArray.id == branch.id) {
          initialValue = true;
          // If the value is found in any inner array, exit the loop
          return;
        }
      });
      this.selectedBranchesForm.addControl(branch.id, new FormControl(initialValue));
    });
  }

  onOkClick() {
    const selectedBranches: any[] = [];
    Object.keys(this.selectedBranchesForm.controls).forEach(controlName => {
      if (this.selectedBranchesForm.get(controlName)?.value === true) {
        this.allBranches.filter(branch => {
            if(branch.id == controlName){
              selectedBranches.push(branch);
            }
          });
      }
    });
    if(selectedBranches.length>0){
      this.selectionConfirmed.emit(selectedBranches);    
      this.showPopup = false;
    } else{
      this.baseService.showCustomDialogue('Please select atleast one company')
    }
  }

  selectUnselectAll(event: any) {
    const isChecked = event.target.checked;

    Object.keys(this.selectedBranchesForm.controls).forEach(controlName => {
      this.selectedBranchesForm.get(controlName)?.setValue(isChecked);
    });
    
  }
  
  
}
