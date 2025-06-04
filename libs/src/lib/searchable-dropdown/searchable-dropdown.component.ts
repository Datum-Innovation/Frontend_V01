import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { BaseService } from '../services/base.service';
interface DropdownOption {
  [key: string]: any;
}
@Component({
  selector: 'dfinance-frontend-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements OnInit, ControlValueAccessor {
  @ViewChild('dropdown') dropdown!: NgbDropdown;
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  selectedValue: any;
  onChange: any = () => { };
  onTouch: any = () => { };
  @Input() fieldName!: string;
  @Input() options: any[] = [];
  @Output() selectedOption = new EventEmitter<string>();
  filteredOptions: any[] = [];
  @Input() isdisabled: boolean = false;
  @Input() updatedOption: string = "";
  @Input() returnField: any = "";
  @Input() dropdownFields: any = [];
  @Input() tabIndex:number = 0;
  @Input() excludedKeys:any[] = [];
  @Input() isEmitEvent:boolean = false;
  @Input() cellid:string = "";
  @Input() isGridCell:boolean = false;
  @Input() focusable:boolean = false;
  @Input() setwidth:any = "";
  @Output() focusEvent = new EventEmitter<void>();
  @Output() emitKeyboardEvent = new EventEmitter<KeyboardEvent>();
  control!: FormControl;
  @ViewChild('optionsList') optionsList!: ElementRef;
  searchInput: string = "";
  showList: boolean = false;
  valueChangesSubscription: Subscription;
  selectedIndex = 0;  
  @ViewChildren('dropdownItem') dropdownItems!: QueryList<ElementRef>;

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('searchInputEle', { static: false }) searchInputEle!: ElementRef;
  constructor(private elementRef: ElementRef,
    private renderer: Renderer2,    
    private baseService: BaseService
  ) {
    this.valueChangesSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.control = new FormControl({ value: '', disabled: this.isdisabled });
    this.onChangeControlField();
    this.searchInput = this.updatedOption;
    this.control.patchValue(this.updatedOption);   
  }

  // Method to focus the input
  focusInput(): void {
    if (this.searchInputEle) {
      this.searchInputEle.nativeElement.focus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('isdisabled' in changes && this.control) {
      if (changes['isdisabled'].currentValue !== changes['isdisabled'].previousValue) {
        if (this.valueChangesSubscription) {
          this.valueChangesSubscription.unsubscribe();
        }
        this.onChangeControlField();
      }
    }

    if ('updatedOption' in changes && this.control) {
      if (changes['updatedOption'].currentValue !== changes['updatedOption'].previousValue) {
        if (this.valueChangesSubscription) {
          this.valueChangesSubscription.unsubscribe();
        }
        this.searchInput = this.updatedOption;
        this.control.patchValue(this.updatedOption);
      }
    }
  }
  onChangeControlField() {
    if (this.isdisabled) {
      this.control.disable({ emitEvent: false }); // Disable the control
    } else {
      this.control.enable({ emitEvent: false }); // Enable the control
    }
    if(this.options && this.options.length > 0){
      this.filteredOptions = Object.values(this.options); // Initialize filteredOptions with all options
      this.control.valueChanges.subscribe(async value => {
        if (!value) {
          this.selectedOption.emit('');
          // Reset filteredOptions to all options when value is empty
          this.filteredOptions = Object.values(this.options);
        } 
        else {
          // Filter the options based on the search value
          this.filteredOptions = await this.filterOptions(value);   
          if(this.isGridCell){
            this.dropdown.open();
          }       
           
        }
      });
    }
    
  }

  filterOptions(value: string): Promise<any[]> {
    return new Promise(resolve => {
      const filteredOptions = Object.values(this.options).filter(option =>
        Object.values(option).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(value.toLowerCase())
        )
      );
      resolve(filteredOptions);
    });
  }
  // Implement ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void { }



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if the click is outside the dropdown
    console.log('clicked outside');
  }

  onInput(event: any): void {
    if(this.isEmitEvent){
      this.isEmitEvent = false;
      this.focusEvent.emit();      
    }
    this.showList = true;
    this.onChangeControlField();
  }

  selectOption(event: Event, option: string): void {
    event.preventDefault();
   // this.searchInput = option[this.returnField];
    this.showList = false;
    //this.control.patchValue(this.searchInput);
    this.selectedOption.emit(option[this.returnField]);
  }

  onKeyDown(event: KeyboardEvent): void { 
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredOptions.length - 1);
      this.showList = true;
      this.dropdown.open();
      this.scrollToSelectedItem();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.showList = true;
      this.dropdown.open();
      this.scrollToSelectedItem();
    } else if ((event.key === 'Tab' || event.key === 'ArrowRight' || event.key === 'ArrowLeft') && this.isGridCell ) {
      //emit an event to main component to handle keyboard navigation ....
      // this.emitKeyboardEvent.emit(event);
      // this.showList = false;
      // this.dropdown.close();

      this.manageTabandEnterKey(event);   

    } else if (event.key === 'Tab') {
      this.manageTabandEnterKey(event);      
    } else if (event.key === 'Enter') {
      // this.dropdown.close();
      // this.selectOption(event, this.filteredOptions[this.selectedIndex]);
      // this.selectedIndex = -1;
       this.manageTabandEnterKey(event);
    } else if (event.key === 'PageDown' || event.key === 'PageUp') {
      this.updatedOption = (event.target as HTMLInputElement).value;
      event.preventDefault();
       this.control.patchValue(this.updatedOption);
      this.onChangeControlField();
      this.dropdown.open();
    } else{
      this.showList = true;
      this.dropdown.open();
    }
  }
  manageTabandEnterKey(event:any){
    const currentValue = this.control.value;
    if (currentValue) {
      // Check if any object in filteredOptions has a property that matches the current value
      const matchExists = this.filteredOptions.some(option => option[this.returnField] === currentValue);

      if (matchExists) {
        this.dropdown.close();
        this.selectOption(event, this.filteredOptions[this.selectedIndex]);
        this.selectedIndex = -1;
      } else {
        if(this.filteredOptions.length > 0){
          // this.control.patchValue(this.filteredOptions[0][this.returnField]);
          this.dropdown.close();
          this.selectOption(event, this.filteredOptions[this.selectedIndex]);
          this.selectedIndex = 0;
        } else{
          this.baseService.showCustomDialogue('Invalid Entry');
          this.control.patchValue("");
          this.selectedIndex = 0;
        }   
        this.showList = false;
        this.dropdown.close();
      }
    } else{
      // this.control.patchValue(this.filteredOptions[0][this.returnField]);
      this.dropdown.close();
      this.selectOption(event, this.filteredOptions[this.selectedIndex]);
      this.selectedIndex = 0;
    }
  }
  

  scrollToSelectedItem() {
    // Get the selected item element and scroll it into view
    const selectedItem = this.dropdownItems.toArray()[this.selectedIndex];
    if (selectedItem) {
      selectedItem.nativeElement.scrollIntoView({
        behavior: 'smooth',  // Smooth scrolling
        block: 'nearest',    // Scrolls the item to the nearest edge of the container
      });
      // Set focus to the selected item
      selectedItem.nativeElement.focus();
    }
  }
  

  onKeyDownOptions(event: KeyboardEvent): void { 
    if (event.key === 'Tab') {
      event.preventDefault();
      if(this.fieldName == 'supplier'){
        this.dropdown.close();  
        this.selectOption(event, this.filteredOptions[this.selectedIndex]);
        this.selectedIndex = -1;
      }
    } else if (event.key === 'Enter') {
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredOptions.length - 1);
     
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
     
    } 
  }

  // scrollOptionIntoView() {
  //   const optionsElement = this.optionsList.nativeElement;
  //   const selectedOption = optionsElement.querySelector(`.dropdown-item:nth-child(${this.selectedIndex + 1})`);
  //   if (selectedOption) {
  //     selectedOption.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  //   }
  // }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    // Check if the clicked target is outside the input element

    // const cellElement = this.gridCells.find(cell => cell.nativeElement.id === this.cellid);
    // if (cellElement &&
    //   cellElement.nativeElement &&
    //   !cellElement.nativeElement.contains(event.target)) {
    //     console.log('Clicked outside the input element');
    //     event.stopPropagation();
    //     this.showList = false;
    //     const currentValue = this.control.value;
    //     // if (currentValue) {
    //       // Check if any object in filteredOptions has a property that matches the current value
    //       const matchExists = this.filteredOptions.some(option => option[this.returnField] === currentValue);
    //       if (matchExists) {
    //         this.dropdown.close();
    //         this.selectOption(event, this.filteredOptions[this.selectedIndex]);
    //         this.selectedIndex = -1;
    //       } else {
    //         this.baseService.showCustomDialogue('Invalid Entry');
    //         this.selectedOption.emit("");
    //         // this.control.patchValue("");
    //         // this.selectedIndex = 0;
    //       }
    //     // }
    // }
  }

  

  getFields(option: DropdownOption) {
    return Object.keys(option)
    .filter(key => !this.excludedKeys.includes(key)) // Exclude specified keys
    .map(key => option[key]);
  }

  ngAfterViewChecked(): void {
      if (this.isGridCell && this.gridCells) {
        const cellElement = this.gridCells.find(cell => cell.nativeElement.id === this.cellid);
        if (cellElement) {
          cellElement.nativeElement.focus();
          //setTimeout(() => this.onChangeControlField(), 0); 
        }
      }
    }

}
