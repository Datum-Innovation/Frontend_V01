import { Directive, ElementRef, HostListener } from '@angular/core';
import { BaseService } from '../services/base.service';

@Directive({
  selector: '[appNumberFormat]'
})
export class NumberFormatDirective {

  // Regular expression to allow only numbers, +, -, and . (decimal point)
  private regex: RegExp = new RegExp(/^[+-]?\d*(\.\d*)?$/); 

  constructor(private el: ElementRef, private baseService: BaseService) {}

  // Listen for 'input' events to prevent entering invalid characters
  @HostListener('input', ['$event']) onInput(event: any) {
    let input = event.target.value;
    
    // Allow only numbers, +, -, and decimal point
    let sanitizedInput = input.replace(/[^0-9+\-\.]/g, ''); // Exclude all except numbers, +, -, .

    // Set the sanitized value back to the input element
    this.el.nativeElement.value = sanitizedInput;

    // If the sanitized input does not match the valid pattern, reset the value
    if (!this.regex.test(sanitizedInput)) {
      this.el.nativeElement.value = sanitizedInput.substring(0, sanitizedInput.length - 1); // Remove last invalid character
    }
  }

  // Listen for 'blur' event to format the number once input loses focus
  @HostListener('blur') onBlur() {
    this.formatNumber();
  }

  private formatNumber() {
    let value = parseFloat(this.el.nativeElement.value);
    if (!isNaN(value)) {
      // Format the number using the service or to a fixed number of decimal places
      this.el.nativeElement.value = this.baseService.formatInput(value); // value.toFixed(3); // Format to 3 decimal places if needed
    } else {
      this.el.nativeElement.value = ''; // Clear the field if the input is not a valid number
    }
  }
}
