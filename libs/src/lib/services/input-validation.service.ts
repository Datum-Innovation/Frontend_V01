// src/app/common/decimal-input.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InputValidationService {
  validateDecimalInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // If the value is empty, do not validate it
    if (value === '') return;

    // Regular expression to check for decimal values
    const decimalRegex = /^\d*\.?\d{0,2}$/;

    // If the value does not match the regex, remove the last character
    if (!decimalRegex.test(value)) {
      inputElement.value = value.slice(0, -1);
    }
  }

  validatetextt(event: Event): void {
    
  }
}
