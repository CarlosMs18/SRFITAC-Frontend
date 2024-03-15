import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base-component';
import { FormBuilder, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-additional-data',
  templateUrl: './additional-data.component.html',
  styleUrls: ['./additional-data.component.sass']
})
export class AdditionalDataComponent extends BaseComponent implements OnInit {
  
  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();

  constructor(private generalService: GeneralService,
      private fb: FormBuilder) {
    super();
    this.form = this.fb.group({
      principalResources: ['', [Validators.required]],
      socialMeasures: ['', [Validators.required]],
      disseminationMechanisms: ['', [Validators.required]],
      operationNumber: [''],
      operationDate: [''],
    });
}

  ngOnInit(): void {
    this.generalService.loadDataSubject
      .subscribe(x => {
        if (x?.additionalData) {
          this.form.reset();
          this.form.patchValue(x.additionalData);
        }
      });
    
    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 7) {
          this.validateForm();
        }
      });
  }

  validateForm() {
    if (this.isValidForm()) {
      this.validatedForm.emit(this.form.value);
    }
  }

}
