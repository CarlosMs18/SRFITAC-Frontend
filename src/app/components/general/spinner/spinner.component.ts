import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.sass']
})
export class SpinnerComponent implements OnInit {
  show: Observable<boolean> ;
  isLoadingSubject: BehaviorSubject<boolean>;
  count: number = 0;
  constructor(
    private _mainService:MainService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.show = this.isLoadingSubject.asObservable();
    this._mainService.spinnerEvent.subscribe(
      (show:boolean)=>{
        if (show) {
          this.count++;
        } else {
          this.count--;
        }
        if(this.count>0) {
          this.isLoadingSubject.next(true);
        } else {
          this.isLoadingSubject.next(false);
        }
      }
    )
  }

  ngOnInit(): void {
  }

}
