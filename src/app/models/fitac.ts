import { IInitialData, IMaster } from "./general";

export interface IFitac {
    generalData?: IGeneralData;
    legalRepresentative?: ILegalRepresentative;
    consultants?: IConsultant[];
    projectInformation?: IProjectInformation;
    technicalDescriptions?: ITechnicalDescription[];
    enviromentComponents?: IEnviromentComponent[];
    environmentalImpacts?: IEnvironmentalImpact[];
    additionalData?: IAdditionalData;
    // attachments?: IAttachments;
}

export interface IGeneralData {
    tefiId?: string;
    personType?: string;
    documentType?: string;
    documentNumber?: string;
    fatherLastName?: string;
    motherLastName?: string;
    name?: string;
    cellphone?: string;
    email?: string;
    department?: string;
    province?: string;
    district?: string;
    address?: string;
    registryOffice?: string;
    registryEntry?: string;
    consultingFirmDocument? :string;
    consultingFirmName? : string;
}

export interface ILegalRepresentative {
    tefiId?: string;
    documentType?: string;
    documentNumber?: string;
    fatherLastName?: string;
    motherLastName?: string;
    name?: string;
    department?: string;
    province?: string;
    district?: string;
    address?: string;
}

export interface IConsultant {
    tefiId?: string;
    documentType?: string;
    documentNumber?: string;
    tuitionNumber?: string;
    lastName?: string;
    name?: string;
    found?: boolean;
}

export interface IProjectInformation {
    projectName?: string;
    locations?: {
        department?: string;
        province?: string;
        district?: string;
    }[];
    registerType?: string;
    file?: File;
    coordinatesType?: string;
    coordinates?: string[];
    coordinatesText?: string;
    zoning?: string;
    zoningSource?: string;
    area?: number;
    perimeter?: number;
    startDate?: Date;
    budget?: string;
    lifetime?: number;
}

export interface ITechnicalDescription {
    infraestrutureType?: string;
    mimicryType?: string;
    height?: number;
    aerialLength?: number;
    undergroundLength?: number;
    numberNewPosts?: number;
    lengthNewChannel?: number;
    antennaHeight?: number;
    buildingHeight?: number;
    service?: string;
    rniValue?: number;
}

export interface IEnviromentComponent {
    environment?: string;
    component?: string;
    description?: string;
}

export interface IEnvironmentalImpact {
    stage?: string;
    activities?: string;
    component?: string;
    description?: string;
    preventiveMeasures?: string;
}

export interface IAdditionalData {
    principalResources?: string;
    socialMeasures?: string;
    disseminationMechanisms?: string;
    operationNumber?: string;
    operationDate?: string;
}

export interface IAttachments {
    schedule?: File;
    standars?: File;
    seia?: File;
    drawings?: File;
    deployment?: File;
    photomontage?: File;
    preExistingInfrastructure?: File;
    veracity? : File;
}

export interface IPerson {
    tefiId?: string;
    personType?: string;
    documentType?: string;
    documentNumber?: string;
    fatherLastName?: string;
    motherLastName?: string;
    name?: string;
    cellphone?: string;
    email?: string;
    department?: number;
    departmentName?: string;
    province?: number;
    provinceName?: string;
    district?: number;
    districtName?: string;
    address?: string;
}

export interface IAdministered {
    administered?: IPerson;
    registrationOffice?: string;
    registrationEntryNumber?: string;
    legalRepresentative?: IPerson;
    dataForLists?: IInitialData;
}

export interface ICoordinatesToConvert {
  coordinates : string,
  convertTo : string,
}

export interface ICoordinatesToConvertResponse {
  coordinate : string,
  errorMessage : string,
}

export interface IInfraestructureRules {
    mimicryTypes: IMaster[];
    showMimicryList: boolean;
    showGeneralHeight: boolean;
    showWiringFields: boolean;
    showRooftopFields: boolean;
}
