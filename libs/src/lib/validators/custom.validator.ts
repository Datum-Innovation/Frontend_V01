// no-spaces.validator.ts
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value as string;

    if (value && value.trim().length < minLength) {
      return { 'minLength': { requiredLength: minLength, actualLength: value.trim().length } };
    }

    return null;
  };
}
