import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IInitialData, IMaster, IUbigeo } from '../models/general';
import { IAdministered, IFitac, IPerson } from '../models/fitac';

const API_USERS_URL = `${environment.apiUrl}/GeneralData`;

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  administeredDataSubject = new BehaviorSubject<IAdministered>({});
  loadDataSubject = new BehaviorSubject<IFitac>({});
  initialDataSubject = new BehaviorSubject<IInitialData>({});
  validateFormSubject = new BehaviorSubject<number>(-1);
  zoningSubject = new Subject<IMaster|undefined>();
  infraestructureSubject = new Subject<IMaster|undefined>();

  constructor(private http: HttpClient) { }

  getInitialData(): Observable<IInitialData> {
    return this.http.get<IInitialData>(`${API_USERS_URL}/InitialData`);
  }

  listProvinces(departmentId: number): Observable<IUbigeo[]> {
    return this.http.get<IUbigeo[]>(`${API_USERS_URL}/ListProvinces/${departmentId}`);
  }

  listDistricts(provinceId: number): Observable<IUbigeo[]> {
    return this.http.get<IUbigeo[]>(`${API_USERS_URL}/ListDistricts/${provinceId}`);
  }

  personInformation(documentType: string, documentNumber: string): Observable<IPerson> {
    return this.http.get<IPerson>(`${API_USERS_URL}/PersonInformation?documentType=${documentType}&documentNumber=${documentNumber}`);
  }
}
