import { FormGroup } from "@angular/forms";

export class BaseComponent {
    form: FormGroup = new FormGroup({});
    f = (name: string, frm: FormGroup = this.form) => frm.get(name);

    hasError(controlName: string, errorName: string = '', f: FormGroup = this.form) {
        const field = this.f(controlName, f);
        if (!field) { return false; }
        if (errorName) {
            return field.hasError(errorName) && (field.touched || field.dirty);
        }
        return field.invalid && (field.touched || field.dirty);
    }

    isValidForm(f: FormGroup = this.form) {
        f.markAllAsTouched();
        f.updateValueAndValidity();

        return f.valid;
    }
}
