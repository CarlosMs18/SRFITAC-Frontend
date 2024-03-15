import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDocumentType, IPersonType, IUbigeo } from 'src/app/models/general';
import { GeneralService } from 'src/app/services/general.service';
import { BaseComponent } from '../base-component';
import { environment } from 'src/environments/environment';
import { FitacService } from 'src/app/services/fitac.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-general-data',
  templateUrl: './general-data.component.html',
  styleUrls: ['./general-data.component.sass']
})
export class GeneralDataComponent extends BaseComponent implements OnInit {

  formLR: FormGroup;
  personTypeList: IPersonType[] = [];
  totalDocumentTypeList: IDocumentType[] = [];
  documentTypeList: IDocumentType[] = [];
  departmentList: IUbigeo[] = [];
  provinceList: IUbigeo[] = [];
  districtList: IUbigeo[] = [];
  isLegalEntity: boolean = false;
  documentTypeLRList: IDocumentType[] = [];
  provinceLRList: IUbigeo[] = [];
  districtLRList: IUbigeo[] = [];
  editing: boolean = false;
  templateURL: string = `${environment.apiUrl}/Fitac/DownloadTemplate`;

  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();

  constructor(private generalService: GeneralService,
    private fitacService: FitacService,
    private fb: FormBuilder) {
      super();
      this.form = this.fb.group({
        tefiId: '',
        personType: [{value: '', disabled: true}, [Validators.required]],
        documentType: [{value: '', disabled: true}, [Validators.required]],
        documentNumber: [{value: '', disabled: true}, [Validators.required]],
        name: [{value: '', disabled: true}, [Validators.required]],
        cellphone: [{value: '', disabled: true}, [Validators.required]],
        email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
        department: [{value: '', disabled: true}, [Validators.required]],
        province: [{value: '', disabled: true}, [Validators.required]],
        district: [{value: '', disabled: true}, [Validators.required]],
        address: [{value: '', disabled: true}, [Validators.required]],
        registryOffice: [{value: '', disabled: true}],
        registryEntry: [{value: '', disabled: true}],
      });

      this.formLR = this.fb.group({
        tefiId: '',
        documentType: ['', [Validators.required]],
        documentNumber: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        name: ['', [Validators.required]],
        cellphone: ['', [Validators.required]],
        email: ['', [Validators.required]],
        department: ['', [Validators.required]],
        province: ['', [Validators.required]],
        district: ['', [Validators.required]],
        address: ['', [Validators.required]],
      });
  }

  ngOnInit(): void {
    this.generalService.administeredDataSubject
      .subscribe(x => {
        const lists = x.dataForLists;
        if (lists?.personTypes?.length) {
          this.personTypeList = lists.personTypes!;
          this.totalDocumentTypeList = lists.documentTypes!;
          this.departmentList = lists.deparments!;

          let legalPersonType = this.personTypeList.find(t => t.isLegalEntity)!;
          let naturalPersonType = this.personTypeList.find(t => !t.isLegalEntity)!;
          this.documentTypeLRList = this.totalDocumentTypeList.filter(t => t.personTypeCode == naturalPersonType.code);

          this.f('personType')?.setValue(x.administered?.personType);
          this.personTypeChange();
          this.form.patchValue(x.administered!);
          this.departmentChange();
          this.f('province')?.setValue(x.administered?.province);
          this.provinceChange();
          this.f('district')?.setValue(x.administered?.district);
          this.f('registryOffice')?.setValue(x.registrationOffice);
          this.f('registryEntry')?.setValue(x.registrationEntryNumber);

          if (x.administered?.personType == legalPersonType.code) {
            this.formLR.patchValue(x.legalRepresentative!);
            this.departmentLRChange();
            this.formLR.get('province')?.setValue(x.legalRepresentative?.province);
            this.provinceLRChange();
            this.formLR.get('district')?.setValue(x.legalRepresentative?.district);
        }
        }
      });

    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 1) {
          console.log(step)
          this.validateForm();
        }
      });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      event.target.value = '';
      this.fitacService.loadDataFromTemplate(file)
        .subscribe(x => {
          this.generalService.loadDataSubject.next(x);
          Swal.fire({
            title: '¡Carga exitosa!',
            text: 'Los datos se han extraido del archivo excel y se han colocado en el formulario. Por favor revise los datos en cada pestaña del formulario',
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#009ef7'
          });
        });
    }
  }

  disablePrimaryFields() {
    this.f('personType')?.disable();
    this.f('documentType')?.disable();
    this.f('documentNumber')?.disable();
  }

  editClick() {
    if (!this.editing) {
      this.editing = true;
      this.form.enable();
      this.disablePrimaryFields();
    } else {
      this.form.enable();
      this.fitacService.updateAdministeredData(this.form.value)
        .subscribe(x => {
          if (x.success) {
            this.editing = false;
            this.cancelClick();
          }
        });
      this.disablePrimaryFields();
    }
  }

  cancelClick() {
    this.editing = false;
    this.form.disable();
  }

  personTypeChange() {
    const personTypeCode: string = this.f('personType')?.value;
    const personType = this.personTypeList.find(x => x.code == personTypeCode)!;
    this.isLegalEntity = personType.isLegalEntity!;
    this.documentTypeList = this.totalDocumentTypeList.filter(x => x.personTypeCode == personTypeCode);
    if (this.documentTypeList.length) {
      this.f('documentType')?.setValue(this.documentTypeList[0].code);
    }
    if (this.isLegalEntity) {
      this.f('fatherLastName')?.clearValidators();
      this.f('motherLastName')?.clearValidators();
    } else {
      this.f('fatherLastName')?.setValidators(Validators.required);
      this.f('motherLastName')?.setValidators(Validators.required);
    }
  }

  departmentChange() {
    this.f('province')?.setValue('');
    this.f('district')?.setValue('');
    const departmentId = Number(this.f('department')?.value);

    this.provinceList = [];
    this.districtList = [];
    this.generalService.listProvinces(departmentId)
      .subscribe(x => {
        this.provinceList = x;
      });
  }

  provinceChange() {
    this.f('district')?.setValue('');
    const provinceId = Number(this.f('province')?.value);

    this.districtList = [];
    this.generalService.listDistricts(provinceId)
      .subscribe(x => {
        this.districtList = x;
      });
  }


  departmentLRChange() {
    this.formLR.get('province')?.setValue('');
    this.formLR.get('district')?.setValue('');
    const departmentId = Number(this.formLR.get('department')?.value);

    this.provinceLRList = [];
    this.districtLRList = [];
    this.generalService.listProvinces(departmentId)
      .subscribe(x => {
        this.provinceLRList = x;
      });
  }

  provinceLRChange() {
    this.formLR.get('district')?.setValue('');
    const provinceId = Number(this.formLR.get('province')?.value);

    this.districtLRList = [];
    this.generalService.listDistricts(provinceId)
      .subscribe(x => {
        this.districtLRList = x;
      });
  }

  validateForm() {
    let valid = true;
    if (this.isLegalEntity) {
      valid = this.isValidForm(this.formLR);
    }

    if (!valid) {
      return;
    }

    this.editing = true;
    this.form.enable();

    valid = this.isValidForm() && valid;
    if (valid) {
      const generalData = this.form.value;
      this.editClick();
      this.validatedForm.emit({generalData: generalData, legalRepresentative: this.formLR.value});
    } else {
      this.disablePrimaryFields();
    }
  }
}
