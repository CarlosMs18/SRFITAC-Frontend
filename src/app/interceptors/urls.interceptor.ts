import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, finalize, Observable, throwError} from 'rxjs';
import { MainService } from 'src/app/services/main.service';
import Swal from 'sweetalert2';


@Injectable()
export class UrlsInterceptor implements HttpInterceptor {

  constructor(
    private mainService: MainService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.mainService.showSpinner()

    return next.handle(request).pipe(
      catchError(err => {
        Swal.fire({
          title: 'Mensaje',
          text: err.error.Message,
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonColor: '#009ef7',
          heightAuto: false
        });
        return throwError(() => {});
      }),
      finalize(()=>{
        this.mainService.hideSpinner()
      })
    );
  }



}
