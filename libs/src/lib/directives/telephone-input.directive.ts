import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTelephoneInput]'
})
export class TelephoneInputDirective {

  private regex: RegExp = new RegExp(/^[0-9()+\s]*$/); // Allow only numbers, +, (), and space
  private maxLength: number = 15;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = this.el.nativeElement;
    let inputValue: string = input.value;

    // Remove characters that don't match the allowed regex
    if (!this.regex.test(inputValue)) {
      inputValue = inputValue.replace(/[^0-9()+\s]/g, '');
    }

    // Limit input length to 15 characters
    if (inputValue.length > this.maxLength) {
      inputValue = inputValue.substring(0, this.maxLength);
    }

    // Set the cleaned input value
    input.value = inputValue;
  }
}
