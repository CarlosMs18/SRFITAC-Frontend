import Swal from 'sweetalert2';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '../base-component';
import { GeneralService } from 'src/app/services/general.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IMaster, IUbigeo } from 'src/app/models/general';
import { FitacService } from 'src/app/services/fitac.service';
import { VALIDATE_DECIMAL } from '../../../models/constantes/constantes';
import { ICoordinatesToConvert } from 'src/app/models/fitac';
import { HttpClient } from '@angular/common/http';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-project-information',
  templateUrl: './project-information.component.html',
  styleUrls: ['./project-information.component.sass']
})
export class ProjectInformationComponent extends BaseComponent implements OnInit {

  departmentList: IUbigeo[] = [];
  ubigeoList: {provinceList: IUbigeo[], districtList: IUbigeo[]}[] = [];
  zoningList: IMaster[] = [];
  validateCoordinatesMessage: string = '';
  validationCoordinatesErrorLength :number = 0;
  validateCoordinatesList : string[] = [];
  coordinatesList : string[] = [];
  @Output() validatedForm: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('radioUTM') radioUTM!: ElementRef<HTMLInputElement>;
  @ViewChild('radioLatLong') radioLatLong!: ElementRef<HTMLInputElement>;
  apiLoaded: boolean = false;
  @ViewChild(GoogleMap, { static: false }) map?: GoogleMap;
  polylines: any[] = [];
  markers: any[] = [];
  loadFileResult: 'B' | 'S' | 'E' | 'NF' = 'B';  //Blank, Success, Error, Not Found
  kmzFileContent: any;
  kmzFile: any;

  constructor(private generalService: GeneralService,
    private fitacService: FitacService,
    private fb: FormBuilder,
    private httpClient: HttpClient) {
      super();
      this.form = this.fb.group({
        projectName: ['', [Validators.required]],
        locations: this.fb.array([]),
        registerType: ['FILE'],
        file: [''],
        coordinatesType: ['UTM'],
        coordinates: [''],
        zoning: ['', [Validators.required]],
        zoningSource: [''],
        area: ['', Validators.compose([
           Validators.min(0),
           Validators.pattern(VALIDATE_DECIMAL)])
          ],
        perimeter: ['', Validators.compose([
          Validators.min(0),
          Validators.pattern(VALIDATE_DECIMAL)])
         ],
        startDate: ['', [Validators.required, this.futureValidator]],
        budget:[1, Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.pattern(VALIDATE_DECIMAL)])
         ],
        lifetime: [0, Validators.compose([
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(VALIDATE_DECIMAL)])
         ],
      });
  }

  ngOnInit(): void {
    this.addLocation();

    this.generalService.initialDataSubject
      .subscribe(x => {
        if (!this.apiLoaded && x.googleApiKey) {
          this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${x.googleApiKey}`, 'callback')
            .subscribe(() => this.apiLoaded = true);
        }
        
        if (x?.deparments?.length) {
          this.departmentList = x.deparments!;
        }

        if (x?.zoningTypes?.length) {
          this.zoningList = x.zoningTypes;
        }
      });

    this.generalService.loadDataSubject
      .subscribe(x => {
        this.locationsField.clear();
        if (x?.projectInformation) {
          this.form.patchValue(x.projectInformation);
          if (x.projectInformation.coordinates) {
            this.form.get('registerType')?.setValue('MANUAL');
            this.form.get('coordinatesType')?.setValue('GEO');
          }
          if (x.projectInformation.locations) {
            for(let i = 0; i < x.projectInformation.locations.length; i++) {
              const f = this.addLocation();
              f?.get('department')?.setValue(x.projectInformation.locations[i].department ?? '');
              this.departmentChange(i);
              f?.get('province')?.setValue(x.projectInformation.locations[i].province ?? '');
              this.provinceChange(i);
              f?.get('district')?.setValue(x.projectInformation.locations[i].district ?? '');
            }
          } else {
            this.addLocation();
          }
        } else {
          this.addLocation();
        }
      });

    this.generalService.validateFormSubject
      .subscribe(step => {
        if (step == 3) {
          this.validateForm();
        }
      });
  }

  updateMapClick() {
    const coordinateType = this.f('coordinatesType')?.value;
    this.fitacService.validateCoordinates(coordinateType, this.f('coordinates')?.value)
      .subscribe(x => {
        if (x.validationResult.length > 0) {
          this.validateCoordinatesList = x.validationResult;
          this.validateCoordinatesMessage = x.validationResult[0];
          this.validationCoordinatesErrorLength = x.validationResult.length - 1;
        }
        this.updateMap(x.pointsInPeru);
      });
  }

  updateMap(points: {lat: number, lng: number}[]) {
    if (points?.length > 0) {
      this.markers = points.map(p => { return { position: p }});
      this.polylines = [{ path: points, options: { strokeColor: '#bf0909' } }];
  
      const bounds = new google.maps.LatLngBounds();
      points.forEach(position => {
        bounds.extend(new google.maps.LatLng(position.lat, position.lng));
      });
      this.map?.fitBounds(bounds);
      
      if (this.map && ((this.map.getZoom() ?? 0) > 18)) {
        this.map!.googleMap!.setZoom(18);
      }
    } else {
      this.markers = [];
      this.polylines = [];
      this.map!.googleMap!.setCenter({lat: -9.4481521, lng: -77.3990204});
      this.map!.googleMap!.setZoom(5.5);
    }
  }

  get locationsField(): FormArray {
    return this.f('locations') as FormArray;
  }

  get locationForms(): FormGroup[] {
    return this.locationsField.controls.map(x => x as FormGroup);
  }

  addLocation() {
    const fieldArrayLocation  = this.locationForms[this.locationsField.length -1];
    if(fieldArrayLocation?.status == "INVALID"){
      fieldArrayLocation.markAllAsTouched();
       return;
    }
    const form = this.fb.group({
      department: ['', [Validators.required]],
      province: ['', [Validators.required]],
      district: ['', [Validators.required]],
    });

    this.locationsField.push(form);
    this.ubigeoList.push({provinceList: [], districtList: []});
    return form;
  }

  removeLocation() {
    this.locationsField.removeAt(this.locationsField.length - 1);
    this.ubigeoList.pop();
  }

  departmentChange(index: number) {
    const f = this.locationForms[index];
    f.get('province')?.setValue('');
    f.get('district')?.setValue('');
    const departmentId = Number(f.get('department')?.value);

    this.ubigeoList[index].provinceList = [];
    this.ubigeoList[index].districtList = [];
    this.generalService.listProvinces(departmentId)
      .subscribe(x => {
        this.ubigeoList[index].provinceList = x;
      });
  }

  provinceChange(index: number) {
    const f = this.locationForms[index];
    f.get('district')?.setValue('');
    const provinceId = Number(f.get('province')?.value);

    this.ubigeoList[index].districtList = [];
    this.generalService.listDistricts(provinceId)
      .subscribe(x => {
        this.ubigeoList[index].districtList = x;
      });
  }

  registerTypeChange() {
    if (this.f('registerType')?.value == 'FILE') {
      this.f('coordinates')?.clearValidators();
    } else {
      this.f('coordinates')?.setValidators([Validators.required]);
    }
    this.f('coordinates')?.updateValueAndValidity();
  }

  validateForm() {
    this.validateCoordinatesMessage = '';
    if (this.f('registerType')?.value == 'FILE' && this.loadFileResult == 'B') {
      this.loadFileResult = 'NF';
    }
    if (this.isValidForm()) {
      if (this.f('registerType')?.value == 'FILE') {
        if (this.loadFileResult == 'S') {
          this.validatedForm.emit({...this.form.value, ...{file: this.kmzFile}});  //enviar el archivo
        }
      } else {
        const coordinateType = this.f('coordinatesType')?.value;  // "GEO" : "UTM";
        this.fitacService.validateCoordinates(coordinateType, this.f('coordinates')?.value)
          .subscribe(x => {
            if (x.validationResult.length > 0) {
              this.validateCoordinatesList = x.validationResult;
              this.validateCoordinatesMessage = x.validationResult[0];
              this.validationCoordinatesErrorLength = x.validationResult.length - 1;
            } else {
              this.validatedForm.emit(this.form.value);
            }
          });
      }
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.loadFileResult = 'B';
      const file = event.target.files[0];
      event.target.value = "";
      this.fitacService.fileUploadKmz(file)
        .subscribe({
          next: x => {
            this.kmzFile = file;
            this.kmzFileContent = x;
            this.loadFileResult = 'S';
            this.updateMap2(x);
          },
          error: () => {
            this.loadFileResult = 'E';
            this.updateMap2([]);
          }
        });
    }
  }

  
  updateMap2(data: any) {
    if (data?.points?.length > 0 || data?.polylines?.length > 0) {
      this.markers = data.points.map((p: any) => { return { position: p }});
      this.polylines = data.polylines;
      this.polylines.forEach(x => x.options = { strokeColor: '#bf0909' });
  
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(data.minPoint.lat, data.minPoint.lng));
      bounds.extend(new google.maps.LatLng(data.maxPoint.lat, data.maxPoint.lng));
      this.map!.fitBounds(bounds);
      
      if (this.map && ((this.map.getZoom() ?? 0) > 18)) {
        this.map!.googleMap!.setZoom(18);
      }
    } else {
      this.markers = [];
      this.polylines = [];
      this.map!.googleMap!.setCenter({lat: -9.4481521, lng: -77.3990204});
      this.map!.googleMap!.setZoom(5.5);
    }
  }

  futureValidator(control : FormControl){
    const inputDate = new Date(control.value);
    inputDate.setMinutes(inputDate.getMinutes() + inputDate.getTimezoneOffset());
    return inputDate <= new Date() ? {'futureDate': true} : null
  }

  changeZoning() {
    const zoningItem = this.zoningList.find(x => x.code == this.f('zoning')?.value);
    this.generalService.zoningSubject.next(zoningItem);
  }

  showErrorsCoordinatesComplete(){
      const messageWithLineBreak = this.validateCoordinatesList
        .map(x => `<li>${x}</li>`)
        .join("<br>")
      Swal.fire({
        title : 'Se encontró los siguientes errores',
        html : `<div class="text-start"><ol>${messageWithLineBreak}</ol></div>`,
        icon : 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor : '#bf0909',
        })
  }

  onCoordinatesTextChanges(event : any){
    if(event.target.value || event.target.value == "" ){
      this.validateCoordinatesMessage = "";
      this.validateCoordinatesList = [];
    }

  }

  onChangeCoordinatesType(){
    if(this.form.get('coordinates')?.value.trim().length > 0){
      this.validateCoordinatesList = [];
      this.validateCoordinatesMessage = "";
      this.validationCoordinatesErrorLength = 0;

      const dataToConvert : ICoordinatesToConvert = {
        coordinates  : this.form.get('coordinates')?.value,
        convertTo : this.f('coordinatesType')?.value
      }

      this.fitacService.convertCoordinates(dataToConvert)
        .subscribe(x => {
          this.coordinatesList = x.map(x => x.coordinate);
          this.form.patchValue({
            "coordinates": this.coordinatesList.join("\n")
          });

        this.validateCoordinatesList = x.filter(x => x.errorMessage)
          .map(x => x.errorMessage);

        if (this.validateCoordinatesList.length > 0) {
          this.validateCoordinatesList = this.validateCoordinatesList;
          this.validateCoordinatesMessage = this.validateCoordinatesList[0];
          this.validationCoordinatesErrorLength = this.validateCoordinatesList.length - 1;
        } 
      })
    }
  }
}
