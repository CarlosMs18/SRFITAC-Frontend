import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  public spinnerEvent :  EventEmitter<boolean> = new EventEmitter();
  constructor() { }

  showSpinner() {
    this.spinnerEvent.emit(true);
  }

  hideSpinner() {
    this.spinnerEvent.emit(false);
  }

}
