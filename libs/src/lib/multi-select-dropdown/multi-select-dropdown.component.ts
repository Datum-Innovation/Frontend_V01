import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter, fromEvent, startWith } from 'rxjs';

@Component({
  selector: 'dfinance-frontend-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss'],
})
export class MultiSelectDropdownComponent {
  showItemList = false;
  @Input() allItems: any[] = [];
  @Input() placeholderName: any = "Select";
  @Output() selectedItems = new EventEmitter<Array<{ id: number, value: string }>>();
  filterControl = new FormControl('');
  filteredItems: any[] = [];
  selected: Array<{ id: number, value: string }> = [];


  ngOnInit(): void {    
    this.filteredItems = this.allItems;
    this.filterControl.valueChanges.pipe(
      startWith(''),
      //filter(text => text !== null && text !== undefined)
    ).subscribe((value:any) => {
      this.filterDropdownItems(value);
    });

    fromEvent(document, 'click').pipe(
      filter((event: Event) => this.showItemList && !this.isInside(event))
    ).subscribe(() => this.hideDropdown());
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['allItems'] && changes['allItems'].currentValue) {
      this.filteredItems = this.allItems;
    }
  }

  hideDropdown() {
    this.showItemList = false;
    this.selectedItems.emit(this.selected);
  }

  isInside(event: Event): boolean {
    const target = event.target as HTMLElement;
    return target.closest('.form-multi-select') !== null || target.closest('.form-group') !== null;
  }

  filterDropdownItems(searchTerm: string) {
    if (!searchTerm) {
      this.filteredItems = this.allItems;
    } else {
      this.filteredItems = this.allItems.filter((item) =>
        item.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  onClickItem() {
    this.showItemList = !this.showItemList;
  }

  isSelected(item: any) {
    return this.selected.includes(item) || this.selected.includes(item);
  }

  toggleItemSelection(item: any) {
    const index = this.selected.indexOf(item);
    if (index >= 0) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push(item);
    }
  }
}
