import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IAdministered, IConsultant, ICoordinatesToConvert, ICoordinatesToConvertResponse, IFitac, IGeneralData, IInfraestructureRules } from '../models/fitac';
import { Observable } from 'rxjs';

const API_URL = `${environment.apiUrl}/Fitac`;

@Injectable({
  providedIn: 'root'
})
export class FitacService {

  constructor(private http: HttpClient) { }

  getAdministeredData(): Observable<IAdministered> {
    return this.http.get<IAdministered>(`${API_URL}/AdministratorData`);
  }

  getConsultantData(documentType: string, documentNumber: string): Observable<IConsultant> {
    return this.http.get<IConsultant>(`${API_URL}/GetConsultantData?documentType=${documentType}&documentNumber=${documentNumber}`);
  }

  loadDataFromTemplate(file: File): Observable<IFitac> {
    let form: FormData = new FormData();
    form.append('file', file);

    return this.http.post<IFitac>(`${API_URL}/LoadDataFromTemplate`, form);
  }

  register(data: IFitac) {
    return this.http.post(`${API_URL}/Register`, data);
  }

  registerFiles(id: number, files: File[]) {
    let form: FormData = new FormData();
    files.forEach(el=>{
      form.append('files', el);
    })

    return this.http.post(`${API_URL}/RegisterFiles?id=${id}`, form);
  }

  validateCoordinates(coordinateType: string, coordinates: string) {
    return this.http.post<{validationResult: string[], pointsInPeru: {lat: number, lng: number}[]}>(`${API_URL}/ValidateCoordinates`, { coordinateType: coordinateType, coordinateList: coordinates });
  }

  fileUploadKmz(file : File) : Observable<any>{
    let form: FormData = new FormData();
    form.append('file', file);

    return this.http.post<any>(`${API_URL}/LoadKmzFile`, form);
  }

  updateAdministeredData(data: IGeneralData) {
    return this.http.post<{success: boolean}>(`${API_URL}/UpdateAdministeredData`, data);
  }

  convertCoordinates(coordinates :ICoordinatesToConvert) : Observable<ICoordinatesToConvertResponse[]>{
    return this.http.post<ICoordinatesToConvertResponse[]>(`${API_URL}/ConvertCoordinates`,coordinates);
  }

  getInfraestructureRules(zoningCode: string, infraestructureType: string) {
    return this.http.get<IInfraestructureRules>(`${API_URL}/GetInfraestructureRules?zoningCode=${zoningCode}&infraestructureType=${infraestructureType}`);
  }
}
