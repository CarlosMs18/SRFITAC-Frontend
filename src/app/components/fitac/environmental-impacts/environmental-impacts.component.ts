import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base-component';
import { GeneralService } from 'src/app/services/general.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMaster } from 'src/app/models/general';

@Component({
  selector: 'app-environmental-impacts',
  templateUrl: './environmental-impacts.component.html',
  styleUrls: ['./environmental-impacts.component.sass']
})
export class EnvironmentalImpactsComponent extends BaseComponent implements OnInit {

  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();

  public stagesList : IMaster[] = [];
  public impactComponentsList : IMaster[] = [];

  constructor(private generalService: GeneralService,
    private fb: FormBuilder) {
      super();
      this.form = this.fb.group({
        arrays: this.fb.array([])
      });
  }

  ngOnInit(): void {
    this.addItemForm();

    this.generalService.initialDataSubject
      .subscribe(x => {
        if(x.impactComponents?.length){
          this.impactComponentsList = x.impactComponents;
        }
        if(x.stages?.length){
          this.stagesList = x.stages;
        }
      });

    this.generalService.loadDataSubject
      .subscribe(x => {
        if(x?.environmentalImpacts){
          this.formsField.clear();
          for(let i = 0; i < x.environmentalImpacts?.length ; i++){
            this.addItemForm()
            .patchValue(x.environmentalImpacts[i]);
          }
        }
      });

    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 6) {
          this.validateForm();
        }
      });
  }

  get formsField(): FormArray {
    return this.f('arrays') as FormArray;
  }

  get enviromentalImpactsForm(): FormGroup[] {
    return this.formsField.controls.map(x => x as FormGroup);
  }

  addItemForm() {
    const form = this.fb.group({
      stage: ['', [Validators.required]],
      activities: ['', [Validators.required]],
      component: ['', [Validators.required]],
      description: ['', [Validators.required]],
      preventiveMeasures: ['', [Validators.required]],
    });

    this.formsField.push(form);

    return form;
  }

  removeItemForm(index: number) {
    this.formsField.removeAt(index);
  }

  validateForm() {
    if (this.isValidForm()) {
      this.validatedForm.emit(this.form.value);
    }
  }

}
