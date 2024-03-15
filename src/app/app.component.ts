import { Component, HostListener, OnInit } from '@angular/core';
import { GeneralService } from './services/general.service';
import Swal from 'sweetalert2';
import { IAdditionalData, IAttachments, IConsultant, IEnviromentComponent, IEnvironmentalImpact, IFitac, IGeneralData, ILegalRepresentative, IProjectInformation, ITechnicalDescription } from './models/fitac';
import { FitacService } from './services/fitac.service';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  stepNames: string[] = [
    'Datos Generales del Administrado',
    'Consultores Ambientales',
    'Datos del Proyecto',
    'Descripción Técnica',
    'Componentes Ambientales',
    'Impactos Ambientales',
    'Datos Adicionales',
    'Anexos'
  ]
  selectedStep: number = 1;
  data: IFitac = {};
  attachments: IAttachments = {};
  personType: string = '';
  documentType: string = '';
  documentNumber: string = '';
  urlMPV: string = '';
  itemsToResponse: {id: string, name: string, nameInRepository: string}[] = [];

  constructor(private generalService: GeneralService,
    private fitacService: FitacService,
    private activatedRoute: ActivatedRoute,
    private tokenService :TokenService) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe(params => {
        const token = params['token'];

        if (token) {
          this.tokenService.token = token;
          this.fitacService.getAdministeredData()
            .subscribe(x => {
              this.generalService.initialDataSubject.next(x.dataForLists!);
              this.generalService.administeredDataSubject.next(x);
              this.urlMPV = x.dataForLists?.urlMPV ?? 'https://mpv.mtc.gob.pe/';
            });
        }
      });
  }

  sendMessageToParent(data: any) {
    data = {...data, ...{action: 'cerradoFitac'}};
    const mpvWindow = window.parent ?? window.opener;
    mpvWindow.postMessage(data, this.urlMPV);
  }

  cancel() {
    this.sendMessageToParent({canceled: true});
  }

  lastStep() {
    if (this.selectedStep > 1) {
      this.selectedStep --;
    }
  }

  nextStep() {
    this.generalService.validateFormSubject.next(this.selectedStep);
  }

  validatedFormGeneralData($event: {generalData: IGeneralData, legalRepresentative: ILegalRepresentative}) {
    this.selectedStep ++;
    this.data.generalData = $event.generalData;
    this.data.legalRepresentative = $event.legalRepresentative;
  }

  validatedFormConsultans($event: {consultingFirmDocument: string, consultingFirmName: string, consultants: IConsultant[]}) {
    this.selectedStep ++;
    if (this.data.generalData) {
      if ($event.consultingFirmDocument) {
        this.data.generalData.consultingFirmDocument = $event.consultingFirmDocument;
        this.data.generalData.consultingFirmName = $event.consultingFirmName;
      } else {
        this.data.generalData.consultingFirmDocument = '';
        this.data.generalData.consultingFirmName = '';
      }
    }
    this.data.consultants = $event.consultants;
  }

  validatedFormProjectInformation(projectInformation: IProjectInformation) {
    this.selectedStep ++;
    projectInformation.area = !projectInformation.area ? 0 : projectInformation.area;
    projectInformation.perimeter = !projectInformation.perimeter ? 0 : projectInformation.perimeter;
    this.data.projectInformation = projectInformation;
  }

  validatedFormTechnicalDescription(td: ITechnicalDescription) {
    td.height = !td.height ? 0 : td.height;
    td.aerialLength = !td.aerialLength ? 0 : td.aerialLength;
    td.undergroundLength = !td.undergroundLength ? 0 : td.undergroundLength;
    td.numberNewPosts = !td.numberNewPosts ? 0 : td.numberNewPosts;
    td.lengthNewChannel = !td.lengthNewChannel ? 0 : td.lengthNewChannel;
    td.antennaHeight = !td.antennaHeight ? 0 : td.antennaHeight;
    td.buildingHeight = !td.buildingHeight ? 0 : td.buildingHeight;
    td.rniValue = !td.rniValue ? 0 : td.rniValue;

    this.data.technicalDescriptions = [td];
    this.selectedStep ++;
  }

  validatedFormEnvironmentalComponents($event: {arrays: IEnviromentComponent[]}) {
    this.selectedStep ++;
    this.data.enviromentComponents = $event.arrays;
  }

  validatedFormEnvironmentalImpacts($event: {arrays: IEnvironmentalImpact[]}) {
    this.selectedStep ++;
    this.data.environmentalImpacts = $event.arrays;
  }

  validatedFormAdditionalData(additionalData: IAdditionalData) {
    this.selectedStep ++;
    this.data.additionalData = additionalData;
  }

  validatedAttachments(attachments: IAttachments) {
    this.attachments = attachments;

    Swal.fire({
      title: 'Confirmación',
      text: '¿Está seguro de guardar los datos ingresados?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#009ef7',
      cancelButtonColor: '#7E8299'
    }).then(x => {
      if (x.isConfirmed) {
        this.save();
      }
    });
  }

  save() {
    const kmzFile = this.data.projectInformation!.file;
    delete this.data.projectInformation!.file;
    this.fitacService.register(this.data)
    .subscribe((x: any) => {
        const files: File[] = [
          this.attachments.standars!,
          this.attachments.seia!,
          this.attachments.schedule!,
          this.attachments.drawings!,
          this.attachments.deployment!,
          this.attachments.photomontage!,
          this.attachments.preExistingInfrastructure!,
          // this.attachments.veracity!,
          kmzFile!
        ];

        this.fitacService.registerFiles(x.id, files)
          .subscribe((resp: any) => {
            if (resp.items?.length) {
              this.itemsToResponse = resp.items;
              Swal.fire({
                title: 'Proceso Completado',
                html: 'La ficha técnica ha sido creada correctamente.<br>'+
                      'Este formulario se cerrará, pero <b>RECUERDE que debe COMPLETAR el registro de la solicitud en la plataforma MPV</b>.<br><br>'+
                      'Recuerde que las notificaciones se le enviarán al correo registrado en la MPV: <b>' + resp.email + '</b>',
                icon: 'success',
                showCancelButton: false,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#009ef7'
              }).then(ok => {
                this.sendMessageToParent({items: this.itemsToResponse});
              })
            }
          });
      });
      this.data.projectInformation!.file = kmzFile;
  }
}
