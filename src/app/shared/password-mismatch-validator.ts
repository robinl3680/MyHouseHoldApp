import { Directive } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";

@Directive({
    selector: '[passwordLMisMatchValidator]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: PasswordMisMatchValidator,
            multi: true
        }
    ]
})

export class PasswordMisMatchValidator implements Validator {

    validate(control: AbstractControl): { [key: string]: any } {
        if (control && control.value && control.value !== control.parent.value['password']) {
            return { 'passwordMismatch': true };
        }
        return null;
    }
}