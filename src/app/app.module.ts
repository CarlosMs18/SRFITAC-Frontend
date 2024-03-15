import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { StepperComponent } from './components/general/stepper/stepper.component';
import { GeneralDataComponent } from './components/fitac/general-data/general-data.component';
import { ConsultantsComponent } from './components/fitac/consultants/consultants.component';
import { ProjectInformationComponent } from './components/fitac/project-information/project-information.component';
import { TechnicalDescriptionComponent } from './components/fitac/technical-description/technical-description.component';
import { AdditionalDataComponent } from './components/fitac/additional-data/additional-data.component';
import { AttachmentsComponent } from './components/fitac/attachments/attachments.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnvironmentalComponentsComponent } from './components/fitac/environmental-components/environmental-components.component';
import { EnvironmentalImpactsComponent } from './components/fitac/environmental-impacts/environmental-impacts.component';
import { UrlsInterceptor } from './interceptors/urls.interceptor';
import { SpinnerComponent } from './components/general/spinner/spinner.component';
import { NgxMaskModule } from 'ngx-mask';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    AppComponent,
    StepperComponent,
    SpinnerComponent,
    GeneralDataComponent,
    ConsultantsComponent,
    ProjectInformationComponent,
    TechnicalDescriptionComponent,
    AdditionalDataComponent,
    AttachmentsComponent,
    EnvironmentalComponentsComponent,
    EnvironmentalImpactsComponent,

  ],
  imports: [
    CommonModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    NgxMaskModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: UrlsInterceptor, multi: true },
    { provide : HTTP_INTERCEPTORS, useClass : TokenInterceptor, multi : true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
