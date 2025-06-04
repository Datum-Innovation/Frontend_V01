import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDateFormat]'
})
export class DateFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const input = this.el.nativeElement.value;
    this.el.nativeElement.value = this.formatDate(input);
  }

  private formatDate(value: string): string {
    if (!value) return value;

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    // Format the date
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }

    return value;
  }
}
