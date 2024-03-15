import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { BaseComponent } from '../base-component';
import { IDocumentType } from 'src/app/models/general';
import { FitacService } from 'src/app/services/fitac.service';

@Component({
  selector: 'app-consultants',
  templateUrl: './consultants.component.html',
  styleUrls: ['./consultants.component.sass']
})
export class ConsultantsComponent extends BaseComponent implements OnInit {
  documentTypeList: IDocumentType[] = [];
  checkedConsulting: boolean = false;
  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();

  constructor(private generalService: GeneralService,
    private fitacService: FitacService,
    private fb: FormBuilder) {
      super();
      this.form = this.fb.group({
        consultingFirmDocument: [{value: '', disabled: true}, [Validators.required]],
        consultingFirmName: [{value: '', disabled: true}, [Validators.required]],
        consultants: this.fb.array([])
      });
  }

  ngOnInit(): void {
    this.form.reset();
    this.generalService.initialDataSubject
      .subscribe(x => {
        if (x?.documentTypes?.length) {
          const legalPersonType = x.personTypes?.find(x => !x.isLegalEntity);
          this.documentTypeList = x.documentTypes;
          this.documentTypeList = this.documentTypeList.filter(x =>  x.personTypeCode == legalPersonType?.code);
          this.addConsultant();
        }
      });
    this.generalService.loadDataSubject
      .subscribe(x => {
        if(x.generalData?.consultingFirmDocument){
          this.form.patchValue(x?.generalData)
          this.form.get('consultingFirmDocument')?.enable()
          this.form.get('consultingFirmName')?.enable()
          this.checkedConsulting  = true;
        }
        if (x?.consultants) {
          this.consultantsField.clear();
          for(let i = 0; i < x.consultants?.length; i++) {
            if (x.consultants[i].name) {
              x.consultants[i].found = true;
            } else {
              x.consultants[i].found = false;
            }

            this.addConsultant()
              .patchValue({...{searched: true, lastDocumentSearched: x.consultants[i].documentNumber}, ...x.consultants[i]});
          }
        }
      });

    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 2) {
          this.validateForm();
        }
      });
  }

  enabledCompany(event: any) {
    const enabled: boolean = event.target.checked;
    if (enabled) {
      this.f('consultingFirmDocument')?.enable();
      this.f('consultingFirmName')?.enable();
    } else {
      this.f('consultingFirmDocument')?.disable();
      this.f('consultingFirmName')?.disable();
      this.f('consultingFirmDocument')?.setValue('');
      this.f('consultingFirmName')?.setValue('')
    }
  }

  get consultantsField(): FormArray {
    return this.f('consultants') as FormArray;
  }

  get consultantForms(): FormGroup[] {
    return this.consultantsField.controls.map(x => x as FormGroup);
  }

  addConsultant() {
    const form = this.fb.group({
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      searched: false,
      lastDocumentSearched: '',
      name: ['', [Validators.required]],
      tuitionNumber: ['', [Validators.required]],
      found: false,
    });

    if (this.documentTypeList?.length > 0) {
      form.get('documentType')?.setValue(this.documentTypeList[0].code!);
    }
    this.consultantsField.push(form);
    return form;
  }

  removeConsultant(index: number) {
    this.consultantsField.removeAt(index);
  }

  changeDocumentType(form: FormGroup) {
    form.patchValue({
      searched: false,
      lastDocumentSearched: '',
      name: '',
      tuitionNumber: '',
      found: false
    });
  }

  changeDocument(form: FormGroup) {
    if (form.get('lastDocumentSearched')?.value && form.get('lastDocumentSearched')?.value != form.get('documentNumber')?.value) {
      this.changeDocumentType(form);
    }
  }

  searchConsultant(form: FormGroup) {
    if (!form.get('documentType')?.valid || !form.get('documentNumber')?.valid) {
      form.get('documentType')?.markAsTouched();
      form.get('documentNumber')?.markAsTouched();
      return;
    }

    const documentType = form.get('documentType')?.value;
    const documentNumber = form.get('documentNumber')?.value;

    this.fitacService.getConsultantData(documentType, documentNumber)
    .subscribe({ next: x => {
      form.get('searched')?.setValue(true);
      form.get('found')?.setValue(x.found);
      form.get('name')?.setValue(x.name);
      form.get('tuitionNumber')?.setValue(x.tuitionNumber);
    }, error: err => {
      form.get('searched')?.setValue(true);
      form.get('found')?.setValue(false);
      form.get('name')?.setValue('');
      form.get('tuitionNumber')?.setValue('');
    }});

    form.get('lastDocumentSearched')?.setValue(documentNumber);
  }

  validateForm() {
    if (this.isValidForm()) {
      this.validatedForm.emit(this.form.value);
    }
  }

}
