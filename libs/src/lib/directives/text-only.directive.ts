import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTextOnly]'
})
export class TextOnlyDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const input = this.el.nativeElement as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-Z ]/g, ''); // Replace numbers and special characters
    event.preventDefault();
  }
}
