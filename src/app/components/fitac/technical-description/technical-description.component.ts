import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base-component';
import { GeneralService } from 'src/app/services/general.service';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { IMaster } from 'src/app/models/general';
import { FitacService } from 'src/app/services/fitac.service';


@Component({
  selector: 'app-technical-description',
  templateUrl: './technical-description.component.html',
  styleUrls: ['./technical-description.component.sass']
})
export class TechnicalDescriptionComponent extends BaseComponent implements OnInit {

  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();
  infraestructureTypes: IMaster[] = [];
  mimicryList: IMaster[] = [];
  zoningItem?: IMaster = {};
  valueHeightMax: number = 0;
  maxBuildingHeight: number = 0;
  minBuildingHeight: number = 0;
  maxAerialLength: number = 0;
  
  showMimicryList: boolean = false;
  showGeneralHeight: boolean = false;
  showWiringFields: boolean = false;
  showRooftopFields: boolean = false;

  rooftopCode: string = '';
  withoutMimicryCode: string = '';

  constructor(private generalService: GeneralService,
    private fitacService: FitacService,
    private fb: FormBuilder) {
      super();
      
      this.form = this.fb.group({
        infraestrutureType: ['', [Validators.required]],
        mimicryType: [''],
        height: [],
        aerialLength: [],
        undergroundLength: [],
        numberNewPosts: [],
        lengthNewChannel: [],
        antennaHeight: [],
        buildingHeight: [],
        service: ['', [Validators.required]],
        rniValue: [],
      });

      this.form.addValidators([this.wiringValidator(), this.rooftopValidator]);
  }

  ngOnInit(): void {
    this.generalService.initialDataSubject
      .subscribe(x => {
        if(x.infraestructureTypes?.length) {
          this.infraestructureTypes = x.infraestructureTypes;
        }
        this.rooftopCode = x.rooftopCode ?? '';
        this.withoutMimicryCode = x.withoutMimicryCode ?? '';
      });

    this.generalService.loadDataSubject
      .subscribe(x => {
        if (x?.technicalDescriptions) {
          this.form.patchValue(x.technicalDescriptions[0]);
          this.infraestrutureChange(x.technicalDescriptions[0].mimicryType);
        }
      });
    
    this.generalService.zoningSubject
      .subscribe(z => {
        this.zoningItem = z;
        this.infraestrutureChange();
      });
    
    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 4) {
          this.validateForm();
        }
      });
  }

  infraestrutureChange(mimicryType?: string) {
    const infraestrutureType: string = this.f('infraestrutureType')?.value;
    this.f('mimicryType')?.setValue('');
    this.mimicryList = [];

    if (!this.zoningItem?.code || !infraestrutureType) {
      return;
    }
    
    const infraestrutureItem = this.infraestructureTypes.find(x => x.code == infraestrutureType);
    
    this.fitacService.getInfraestructureRules(this.zoningItem?.code, infraestrutureType)
      .subscribe(x => {
        this.mimicryList = x.mimicryTypes;
        if (mimicryType) {
          this.f('mimicryType')?.setValue(mimicryType);
        }
        this.showMimicryList = x.showMimicryList;
        this.showGeneralHeight = x.showGeneralHeight;
        this.showWiringFields = x.showWiringFields;
        this.showRooftopFields = x.showRooftopFields;

        this.updateValidators(infraestrutureItem);
        this.mimicryTypeChange();
      });
    
    this.generalService.infraestructureSubject.next(infraestrutureItem);
  }

  updateValidators(infraestrutureTypeItem?: IMaster) {
    this.f('mimicryType')?.clearValidators();
    this.f('height')?.clearValidators();
    this.f('aerialLength')?.clearValidators();
    this.f('undergroundLength')?.clearValidators();
    this.f('numberNewPosts')?.clearValidators();
    this.f('lengthNewChannel')?.clearValidators();
    this.f('antennaHeight')?.clearValidators();
    this.f('buildingHeight')?.clearValidators();
    this.f('rniValue')?.clearValidators();

    if (this.showMimicryList) {
      this.f('mimicryType')?.addValidators([Validators.required]);
    }

    if (!this.showWiringFields) {
      this.f('rniValue')?.addValidators([Validators.required, Validators.min(0.000001)]);
    }

    if (this.showWiringFields) {
      //Longitud aérea máxima: 2000 en Urbano o Expansión Urbana y 6000 en Rural
      this.maxAerialLength = this.zoningItem?.value1 == '1' ? 2000 : 6000;
      this.f('aerialLength')?.addValidators([Validators.min(0), Validators.max(this.maxAerialLength)]);
      this.f('undergroundLength')?.addValidators([Validators.min(0), Validators.max(4000)]);
      this.f('numberNewPosts')?.addValidators([Validators.min(0)]);
      this.f('lengthNewChannel')?.addValidators([Validators.min(0), Validators.max(4000)]);
    } else if (this.showRooftopFields) {
      this.f('antennaHeight')?.addValidators([Validators.required, Validators.min(0.01)]);
      this.f('buildingHeight')?.addValidators([Validators.required]);
      if (this.zoningItem?.value1 == '1') {
        this.f('antennaHeight')?.addValidators([this.maxHeightValidator()]);
        this.f('buildingHeight')?.addValidators([this.buildingHeightValidator()]);
      } else {
        this.f('buildingHeight')?.addValidators([Validators.min(0.01)]);
      }
    } else if (this.showGeneralHeight) {
      this.f('height')?.addValidators([Validators.required, Validators.min(0.01)]);
      if (infraestrutureTypeItem?.value2 == '1' || (infraestrutureTypeItem?.value2 == 'Z' && this.zoningItem?.value1 == '1')) {
        this.f('height')?.addValidators([this.maxHeightValidator()]);
      }
    }

    this.f('mimicryType')?.updateValueAndValidity();
    this.f('height')?.updateValueAndValidity();
    this.f('aerialLength')?.updateValueAndValidity();
    this.f('undergroundLength')?.updateValueAndValidity();
    this.f('numberNewPosts')?.updateValueAndValidity();
    this.f('lengthNewChannel')?.updateValueAndValidity();
    this.f('antennaHeight')?.updateValueAndValidity();
    this.f('buildingHeight')?.updateValueAndValidity();
    this.f('rniValue')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  wiringValidator(): ValidatorFn {
    const controlNames = ['aerialLength', 'undergroundLength', 'numberNewPosts', 'lengthNewChannel'];
    
    return (form: AbstractControl): {[key: string]: any} | null => {
      if (!this.showWiringFields) {
        return null;
      }
      let hasWiringError = true;
      for(let i in controlNames) {
        const ctrl = form.get(controlNames[i]);
        if (ctrl?.untouched || Number(ctrl?.value > 0)) {
          hasWiringError = false;
          break;
        }
      }
      
      if(hasWiringError) {
        return {'wiring': true};
      }
      
      return null;
    };
  }

  rooftopValidator: ValidatorFn =
    (form : AbstractControl): {[key: string]: any} | null => {
      if (!this.showRooftopFields) {
        return null;
      }
      const antennaHeight = Number(form.get('antennaHeight')?.value);
      const buildingHeight =  Number(form.get('buildingHeight')?.value);
      if (buildingHeight > 0) {
        const ratio = antennaHeight / buildingHeight;
        return ratio > 0.5 ? {'ratio': true} : null;
      }
      return null;
    };

  maxHeightValidator(): ValidatorFn {
    const maxFn = () => this.valueHeightMax;

    return (control: AbstractControl): {[key: string]: any} | null => {
      const maxHeight = maxFn();
      const value = Number(control.value);
      return maxHeight > 0 && value > maxHeight ? { 'max': true } : null;
    };
  }

  buildingHeightValidator() {
    const maxFn = () => this.maxBuildingHeight;
    const minFn = () => this.minBuildingHeight;

    return (control: AbstractControl): {[key: string]: any} | null => {
      const maxHeight = maxFn();
      const minHeight = minFn();
      const value = Number(control.value);

      if (minHeight == 0 && !value) {
        return { 'min0': true };
      } else if (value < minHeight) {
        return { 'minBH': true };
      } else if (maxHeight > 0 && value > maxHeight) {
        return { 'max': true };
      }

      return null;
    };
  }

  mimicryTypeChange() {
    const infraestrutureType: string = this.f('infraestrutureType')?.value;
    const infraestrutureTypeItem = this.infraestructureTypes.find(x => x.code == infraestrutureType);
    
    this.valueHeightMax = 0;
    this.maxBuildingHeight = 24;
    this.minBuildingHeight = 0;

    if (infraestrutureType == this.rooftopCode && this.f('mimicryType')?.value == this.withoutMimicryCode) {
      this.valueHeightMax = 4;
      this.maxBuildingHeight = 0;
      this.minBuildingHeight = 24;
    } else if (infraestrutureTypeItem?.value2 == '1' || (infraestrutureTypeItem?.value2 == 'Z' && this.zoningItem?.value1 == '1')) {
      const valueHeightMax = this.mimicryList.find(x => x.code == this.f('mimicryType')?.value)?.value2;
      this.valueHeightMax = Number(valueHeightMax);
    }
    
    this.f('height')?.updateValueAndValidity();
    this.f('buildingHeight')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  validateForm() {
    if (this.isValidForm()) {
      this.validatedForm.emit(this.form.value);
    }
  }
}
