import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base-component';
import { GeneralService } from 'src/app/services/general.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMaster } from 'src/app/models/general';
import { MasterService } from 'src/app/services/master.service';

@Component({
  selector: 'app-environmental-components',
  templateUrl: './environmental-components.component.html',
  styleUrls: ['./environmental-components.component.sass']
})
export class EnvironmentalComponentsComponent extends BaseComponent implements OnInit {

  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();

  environmentTypeList: IMaster[] = [];
  componentLists: {list: IMaster[]}[] = [];

  constructor(private generalService: GeneralService,
    private masterService: MasterService,
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
        if(x.environmentTypes?.length){
          this.environmentTypeList = x.environmentTypes;
        }
      });

    this.generalService.loadDataSubject
      .subscribe(x => {
        if (x?.enviromentComponents) {
          this.formsField.clear();
          this.componentLists = [];
          for(let i = 0; i < x.enviromentComponents?.length; i++) {
            this.addItemForm()
              .patchValue(x.enviromentComponents[i]);
            this.environmentChange(i);
            this.formsField.at(i).get('component')
              ?.setValue(x.enviromentComponents[i].component);
          }
        }
      });

    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 5) {
          this.validateForm();
        }
      });
  }

  get formsField(): FormArray {
    return this.f('arrays') as FormArray;
  }

  get forms(): FormGroup[] {
    return this.formsField.controls.map(x => x as FormGroup);
  }

  addItemForm() {
    const form = this.fb.group({
      environment: ['', [Validators.required]],
      component: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });

    this.formsField.push(form);
    this.componentLists.push({list: []});

    return form;
  }

  removeItemForm(index: number) {
    this.formsField.removeAt(index);
    this.componentLists.splice(index, 1);
  }

  environmentChange(index: number) {
    this.formsField.at(index).get('component')?.setValue('');
    const environmentCode: string = this.formsField.at(index).get('environment')?.value;
    this.masterService.listComponents(environmentCode)
      .subscribe(x => {
        this.componentLists[index].list = x;
      });
  }

  validateForm() {
    if (this.isValidForm()) {
      this.validatedForm.emit(this.form.value);
    }
  }
}
