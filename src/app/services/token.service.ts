import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private _token :string = '';
  constructor() { }

  set token(value : string){
    this._token = value;
  }

  get token(): string{
    return this._token;
  }
}
