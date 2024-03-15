import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base-component';
import { FormBuilder, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { environment } from 'src/environments/environment';
import { MAX_10MB, MAX_1MB, MAX_5MB } from '../../../models/constantes/constantes';
import { IMaster } from 'src/app/models/general';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.sass']
})
export class AttachmentsComponent extends BaseComponent implements OnInit {

  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();
  urlController : string = `${environment.apiUrl}/Attachment`;
  urlSchedule: string = `${this.urlController}/DownloadSchedule`;
  urlStandards: string = `${this.urlController}/DownloadStandards`;
  urlSeia: string = `${this.urlController}/DownloadSeia`;
  infraestructureAttachment?: string = '';

  constructor(private generalService: GeneralService,
    private fb: FormBuilder) {
    super();
    this.form = this.fb.group({
      standars: ['', [Validators.required]],
      standarsFileName: ['', [Validators.required]],
      seia: ['', [Validators.required]],
      seiaFileName: ['', [Validators.required]],
      schedule: ['', [Validators.required]],
      scheduleFileName: ['', [Validators.required]],
      drawings: ['', [Validators.required]],
      drawingsFileName: ['', [Validators.required]],
      deployment: [''],
      deploymentFileName: [''],
      photomontage: [''],
      photomontageFileName: [''],
      preExistingInfrastructure: ['', [Validators.required]],
      preExistingInfrastructureFileName: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 8) {
          this.validateForm();
        }
      });
    
    this.generalService.infraestructureSubject
      .subscribe(x => {
        this.infraestructureAttachment = x?.value1;
        this.f('deployment')?.clearValidators();
        this.f('deploymentFileName')?.clearValidators();
        this.f('photomontage')?.clearValidators();
        this.f('photomontageFileName')?.clearValidators();
        if (this.infraestructureAttachment == 'D') {
          this.f('deployment')?.setValidators([Validators.required]);
          this.f('deploymentFileName')?.setValidators([Validators.required]);
        } else if (this.infraestructureAttachment == 'F') {
          this.f('photomontage')?.setValidators([Validators.required]);
          this.f('photomontageFileName')?.setValidators([Validators.required]);
        }
        this.f('deployment')?.updateValueAndValidity();
        this.f('deploymentFileName')?.updateValueAndValidity();
        this.f('photomontage')?.updateValueAndValidity();
        this.f('photomontageFileName')?.updateValueAndValidity();
        this.form.updateValueAndValidity();
      });
  }

  validateForm() {
    if (this.isValidForm()) {
      this.validatedForm.emit(this.form.value);
    }
  }

  onChangeSchedule(event: any) {

    this.setFileData(event, MAX_5MB, 'schedule')
  }

  onChangeStandars(event: any) {
    this.setFileData(event, MAX_1MB, 'standars')
  }

  onChangeSeia(event: any) {
    this.setFileData(event, MAX_1MB, 'seia')
  }

  onChangeDrawings(event: any) {
    this.setFileData(event, MAX_10MB, 'drawings')
  }

  onChangeDeployment(event: any) {
    this.setFileData(event, MAX_10MB, 'deployment')
  }

  onChangePhotomontage(event: any) {
    this.setFileData(event, MAX_10MB, 'photomontage')
  }

  onChangePreExistingInfrastructure(event: any) {
    this.setFileData(event, MAX_10MB, 'preExistingInfrastructure')
  }

  setFileData(event: any, max_size: number, field: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if(file) {
        if(this.getFileExtension(file) !== 'pdf') {
          event.target.value = '';
          this.form.get(field + "FileName")?.setErrors({isNotPdf : 'Solo se admiten archivos PDF'});
        } else if(file.size > max_size) {
          event.target.value = '';
          const sizeInMB = max_size == MAX_1MB ? 1 :
            max_size == MAX_5MB ? 5 :
            max_size == MAX_10MB ? 10 : 20;
          this.form.get(field + "FileName")?.setErrors({maxSize : `El tamaño del archivo no debe de ser mayor a ${sizeInMB} MB`});
        } else {
          this.form.patchValue({
            [field]: file
          });
        }
      }
    }
  }

  private getFileExtension(file: File) : string {
    const fileName = file.name;
    const pointPosition = fileName.lastIndexOf('.');
    return pointPosition < 0 ? '' : fileName.slice( pointPosition + 1);
  }
}
