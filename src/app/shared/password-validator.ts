import { Directive } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";

@Directive({
    selector: '[passwordLengthValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: PasswordLengthValidator,
            multi: true
        }
    ]
})

export class PasswordLengthValidator implements Validator {

    validate(control: AbstractControl): { [key: string]: any } {
        if (control && control.value && control.value.length < 6) {
            return { 'lengthLessThanSix': true };
        }
        return null;
    }
}