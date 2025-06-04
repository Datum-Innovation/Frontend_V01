import { Component, ElementRef, HostListener, Input, QueryList, ViewChildren } from '@angular/core';
import { GridSettings, LabelSettings } from '../../models/settings.interface';
import { SettingsService } from '../../services/settings.service';
import { EndpointConstant } from '../../constants/endpoint.constant';
import { Subject, takeUntil } from 'rxjs';
import { GridNavigationService } from '../../services/gridnavigation.service';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'dfinance-frontend-gridandlabelsettings',
  templateUrl: './gridandlabelsettings.component.html',
  styleUrls: ['./gridandlabelsettings.component.css'],
})
export class GridandlabelsettingsComponent {
  @Input() pageId: number = 1;
  destroySubscription: Subject<void> = new Subject<void>();
  showSettingsPopup = false;
  showGridSettings = true;
  showLabelSettings = false;
  allGridSettings = [] as Array<GridSettings>;
  allLabelSettings = [] as Array<LabelSettings>;
  selectedGridSettingsId: any = 0;
  selectedLabelSettingsId: any = 0;

  disableGridSettings: any = true;
  disableLabelSettings: any = true;
  selectedTab: any = "GridSettings";
  password: string = "";
  showPasswordBox = false;

  currentRowIndex: number = 0;  // Index of the currently focused row
  currentColIndex: number = 0;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChildren('labelCell') labelCells!: QueryList<ElementRef>;
  selectedIndex: number = -1;
  gridColumns = [
    { name: 'Grid Name', field: 'gridName' },
    { name: 'Column Name', field: 'columnname' },
    { name: 'Original Caption', field: 'originalcaption' },
    { name: 'New Caption', field: 'newcaption' },
    { name: 'Arabic Caption', field: 'arabiccaption' },
    { name: 'Visible', field: 'visible' }
  ];

  labelColumns = [
    { name: 'Label Name', field: 'labelName' },
    { name: 'Original Caption', field: 'originalcaption' },
    { name: 'New Caption', field: 'newcaption' },
    { name: 'Arabic Caption', field: 'arabiccaption' },
    { name: 'Visible', field: 'visible' },
    { name: 'Enable', field: 'enable' }
  ];
  constructor(
    private settingsService: SettingsService,
    private gridnavigationService: GridNavigationService,
    private baseService:BaseService
  ) { }

  ngOnInit(): void {
    this.fetchGridSettings();
    this.fetchLabelSettings();
  }

  fetchGridSettings() {
    this.settingsService
      .getDetails(EndpointConstant.FILLGRIDSETTINGSBYPAGEID + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {// Assuming response.data is an array of objects
          if(response?.data  && response.httpCode == 200){
            this.allGridSettings = response?.data.map((item: any) => {
              return {
                ...item, // Spread the existing properties of the item
                formName: { name: item.formName } // Map 'forname' field to { name: forname }
              };
            });
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchLabelSettings() {
    this.settingsService
      .getDetails(EndpointConstant.FILLLABELSETTINGSBYPAGEID + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          if(response?.data && response.httpCode == 200){
            this.allLabelSettings = response?.data.map((item: any) => {
              return {
                ...item, // Spread the existing properties of the item
                formName: { name: item.formName } // Map 'forname' field to { name: forname }
              };
            });
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  onClickSettings() {
    this.showSettingsPopup = true;
  }

  openPopup() {
    this.showSettingsPopup = true;
  }

  closePopup() {
    this.showSettingsPopup = false;
  }

  openTab(tabName: any) {
    this.showGridSettings = false;
    this.showLabelSettings = false;
    this.selectedTab = tabName;
    if (tabName == 'GridSettings') {
      this.showGridSettings = true;
      this.disableLabelSettings = true;
    } else if (tabName == 'LabelSettings') {
      this.showLabelSettings = true;
      this.disableGridSettings = true;
    }
  }

  onClickGridSettings(event: any): void {
    if (event.type === 'click') {
      this.selectedGridSettingsId = event.row.id;
    }
  }

  onClickLabelSettings(event: any): void {
    if (event.type === 'click') {
      this.selectedLabelSettingsId = event.row.id;
    }
  }

  onClickEditGridSettings() {
    this.disableGridSettings = !this.disableGridSettings;
    if (this.allGridSettings.length > 0) {
      this.currentRowIndex = 0;
      this.currentColIndex = 0;
    }
  }

  onClickEditLabelSettings() {
    this.disableLabelSettings = !this.disableLabelSettings;
    if (this.allLabelSettings.length > 0) {
      this.currentRowIndex = 0;
      this.currentColIndex = 0;
    }
  }

  onClickSaveGridSettings() {
    if (!this.password) {
      this.baseService.showCustomDialogue('Please provide a valid password and press save button');
      this.showPasswordBox = true;
      return false;
    }
    //save grid settings...
    let payload = this.allGridSettings;
    this.settingsService.saveDetails(EndpointConstant.SAVEGRIDSETTINGS + this.password, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.baseService.showCustomDialogue(response.data);
          if (response.httpCode == 200 && response.data != "Invalid password") {
            this.showPasswordBox = false;
            this.disableGridSettings = true;
          } else if (response.httpCode == 200 && response.data == "Invalid password") {
            this.password = "";
          }
        },
        error: (error) => {
          console.error('Error saving grid settings', error);
        },
      });
    return true;
  }

  onClickSaveLabelSettings() {
    if (!this.password) {
      this.baseService.showCustomDialogue('Please provide a valid password and press save button');
      this.showPasswordBox = true;
      return false;
    }
    //save label settings...
    let payload = this.allLabelSettings;
    this.settingsService.saveDetails(EndpointConstant.SAVELABELSETTINGS + this.password, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.baseService.showCustomDialogue(response.data);
          if (response.httpCode == 200 && response.data != "Invalid password") {
            this.showPasswordBox = false;
            this.disableLabelSettings = true;
          } else if (response.httpCode == 200 && response.data == "Invalid password") {
            this.password = "";
          }
        },
        error: (error) => {
          console.error('Error saving label settings', error);
        },
      });
    return true;
  }

  onChangeGridFields(event: any, fieldName: keyof GridSettings, rowIndex: number) {
    this.allGridSettings[rowIndex][fieldName] = event.target.value;
  }

  onChangeLabelFields(event: any, fieldName: keyof GridSettings, rowIndex: number) {
    this.allLabelSettings[rowIndex][fieldName] = event.target.value;
  }

  onChangeVisible(event: any, rowIndex: number) {
    this.allGridSettings[rowIndex]['visible'] = event.target.checked ? true : false;
  }

  onChangeLabelVisible(event: any, rowIndex: number) {
    this.allLabelSettings[rowIndex]['visible'] = event.target.checked ? true : false;
  }

  onChangeLabelEnable(event: any, rowIndex: number) {
    this.allLabelSettings[rowIndex]['enable'] = event.target.checked ? true : false;
  }

  onClickAddGridSettings() {
    //CHECK ALL GRID SETTINGS HAVE GRIDNAME...
    const allEntriesHaveGridName = this.allGridSettings.every(entry => entry.gridName !== undefined && entry.gridName !== "");
    if (!allEntriesHaveGridName) {
      this.baseService.showCustomDialogue('Column Gridname does not allow nulls');
      return false;
    }

    //CHECK ALL GRID SETTINGS HAVE COLUMN NAME ...
    const allEntriesHaveColumName = this.allGridSettings.every(entry => entry.columnName !== undefined && entry.columnName !== "");
    if (!allEntriesHaveColumName) {
      this.baseService.showCustomDialogue('Column ColumnName does not allow nulls');
      return false;
    }

    let gridSettingsObj = {
      id: 0,
      formName: {
        name: ""
      },
      gridName: "",
      columnName: "",
      originalCaption: "",
      newCaption: "",
      visible: false,
      pageId: this.pageId,
      branchId: null,
      arabicCaption: "",
      enable: true
    };
    this.allGridSettings.push(gridSettingsObj);
    this.allGridSettings = [...this.allGridSettings];

    this.currentRowIndex++;
    this.currentColIndex = 0; // Reset column index to 0 for the new row
    this.gridnavigationService.focusCell(this.gridCells.toArray(),this.currentRowIndex, this.currentColIndex);
    return true;
  }


  onClickAddLabelSettings() {
    //CHECK ALL Label SETTINGS HAVE labelname...
    const allEntriesHaveLabelName = this.allLabelSettings.every(entry => entry.labelName !== undefined && entry.labelName !== "");
    if (!allEntriesHaveLabelName) {
      this.baseService.showCustomDialogue('Column Label name does not allow nulls');
      return false;
    }

    let labelSettingsObj = {
      id: 0,
      formName: {
        name: ""
      },
      labelName: "",
      originalCaption: "",
      newCaption: "",
      visible: false,
      pageId: this.pageId,
      branchId: null,
      arabicCaption: "",
      enable: true
    };
    this.allLabelSettings.push(labelSettingsObj);
    this.allLabelSettings = [...this.allLabelSettings];
    this.currentRowIndex++;
    this.currentColIndex = 0; // Reset column index to 0 for the new row
    this.gridnavigationService.focusCell(this.labelCells.toArray(),this.currentRowIndex, this.currentColIndex);
    return true;
  }


  onGridColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.allGridSettings, this.focusGridCell.bind(this));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.gridnavigationService.moveToPreviousRow(this.focusGridCell.bind(this));
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.gridnavigationService.moveToNextColumn(this.gridColumns, this.focusGridCell.bind(this));
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.gridnavigationService.moveToPreviousColumn(this.focusGridCell.bind(this));
        break;

      case 'Enter':
      case 'Tab':
        event.preventDefault();
        this.gridnavigationService.handleNavigationKey(this.gridColumns, this.allGridSettings, this.focusGridCell.bind(this), this.onClickAddGridSettings.bind(this));
        break;
    }
  }

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }

  onClickGridInput(rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates
    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

  onLabelColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.allLabelSettings, this.focusLabelCell.bind(this));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.gridnavigationService.moveToPreviousRow(this.focusLabelCell.bind(this));
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.gridnavigationService.moveToNextColumn(this.labelColumns, this.focusLabelCell.bind(this));
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.gridnavigationService.moveToPreviousColumn(this.focusLabelCell.bind(this));
        break;

      case 'Enter':
      case 'Tab':
        event.preventDefault();
        this.gridnavigationService.handleNavigationKey(this.labelColumns, this.allLabelSettings, this.focusLabelCell.bind(this), this.onClickAddLabelSettings.bind(this));
        break;
    }
  }

  focusLabelCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.labelCells.toArray(), rowIndex, colIndex);
  }

  onClickLabelInput(rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates
    setTimeout(() => {
        this.gridnavigationService.focusCell(this.labelCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }


  ngAfterViewInit(): void {
    this.gridCells.changes.subscribe(() => {
      if (this.gridCells.length > 0) {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
      }
    });

    this.labelCells.changes.subscribe(() => {
      if (this.labelCells.length > 0) {
        this.gridnavigationService.focusCell(this.labelCells.toArray(), this.currentRowIndex, this.currentColIndex);
      }
    });
  }

}
