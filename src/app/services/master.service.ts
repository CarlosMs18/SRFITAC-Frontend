import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IMaster } from '../models/general';

const API_USERS_URL = `${environment.apiUrl}/Master`;

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(private http: HttpClient) { }

  listMimicryTypes(infraestructureType: string): Observable<IMaster[]> {
    return this.http.get<IMaster[]>(`${API_USERS_URL}/ListMimicryTypes?infraestructureType=${infraestructureType}`);
  }

  listComponents(environment: string): Observable<IMaster[]> {
    return this.http.get<IMaster[]>(`${API_USERS_URL}/ListComponents?environment=${environment}`);
  }
}
