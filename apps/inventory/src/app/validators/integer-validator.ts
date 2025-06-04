import { AbstractControl, ValidatorFn } from '@angular/forms';

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isValid = Number.isInteger(control.value);
    return isValid ? null : { 'notInteger': { value: control.value } };
  };
}
