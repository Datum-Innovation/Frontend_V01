import { ElementRef, Injectable, QueryList, ViewChildren } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class GridNavigationService {

  currentRowIndex: number = 0;  // Index of the currently focused row
  currentColIndex: number = 0;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  selectedIndex: number = -1;

  tableDetails:any = [];

  constructor(private httpClient: HttpClient) {}

  moveToNextRow(allGridSettings: any[], focusCell: (rowIndex: number, colIndex: number) => void): void {
    if (this.currentRowIndex < allGridSettings.length - 1) {
      this.currentRowIndex++;
      focusCell(this.currentRowIndex, this.currentColIndex);
    }
  }

  // Method to move to the previous row
  moveToPreviousRow(focusCell: (rowIndex: number, colIndex: number) => void): void {
    if (this.currentRowIndex > 0) {
      this.currentRowIndex--;
      focusCell(this.currentRowIndex, this.currentColIndex);
    }
  }

  // Method to move to the next column
  moveToNextColumn(columns: any[], focusCell: (rowIndex: number, colIndex: number) => void): void {
    if (this.currentColIndex < columns.length - 1) {
      this.currentColIndex++;
      focusCell(this.currentRowIndex, this.currentColIndex);
    }
  }

  // Method to move to the previous column
  moveToPreviousColumn(focusCell: (rowIndex: number, colIndex: number) => void): void {
    if (this.currentColIndex > 0) {
      this.currentColIndex--;
      focusCell(this.currentRowIndex, this.currentColIndex);
    }
  }

  // Handle Enter and Tab keys
  handleNavigationKey(columns: any[], allGridSettings: any[], focusCell: (rowIndex: number, colIndex: number) => void, addRowCallback: () => void): void {
    if (this.currentColIndex < columns.length - 1) {
      this.currentColIndex++;
      focusCell(this.currentRowIndex, this.currentColIndex);
    } else {
      if (this.currentRowIndex < allGridSettings.length - 1) {
        this.currentRowIndex++;
        this.currentColIndex = 0;
        focusCell(this.currentRowIndex, this.currentColIndex);
      } else {
        addRowCallback();
      }
    }
  }

  // Method to focus on a specific cell
  focusCell(gridCells: any[], rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = gridCells.find(cell => cell.nativeElement.id === cellId);
    if (cellElement) {
      cellElement.nativeElement.focus();
    }
  }

  
}