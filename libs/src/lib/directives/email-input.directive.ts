import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appEmailInput]'
})
export class EmailInputDirective {

  private regex: RegExp = new RegExp(/^[a-zA-Z0-9._%+-@]*$/); // Allow only valid email characters

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = this.el.nativeElement;
    let inputValue: string = input.value;

    // Remove characters that don't match the allowed regex
    if (!this.regex.test(inputValue)) {
      inputValue = inputValue.replace(/[^a-zA-Z0-9._%+-@]/g, '');
    }

    // Set the cleaned input value
    input.value = inputValue;
  }
}
