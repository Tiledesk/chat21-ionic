import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class Globals {

  windowContext;
  
  supportMode: boolean;
  tenant: string;
  logLevel: string
  persistence: string;
  lang: string;
  jwt: string;
  fileUploadAccept: string;
  projectID: string;

  constructor(
  ) { }


  /**
   * 1: initParameters
   */
  initDefafultParameters() {

    let wContext: any = window;
    // this.parameters['windowContext'] = windowContext;
    this.windowContext = wContext;

    this.supportMode = true
    this.tenant = 'tilechat'
    this.logLevel = 'ERROR'
    this.persistence = 'local';
    this.lang = 'en'
    this.fileUploadAccept = 'image/*,.pdf,.txt'
    this.projectID = null;

  }




  

}