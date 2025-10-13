import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { AppConfigProvider } from '../app-config';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { Globals } from 'src/app/utils/globals';
import { getParameterByName, getParameterValue, stringToBoolean } from 'src/chat21-core/utils/utils';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalSettingsService {

  globals: Globals;
  el: ElementRef;
  obsSettingsService: BehaviorSubject<boolean>;
  private logger: LoggerService = LoggerInstance.getInstance()

  constructor(
      public http: HttpClient,
      private appStorageService: AppStorageService,
      // private settingsService: SettingsService,
      public appConfigService: AppConfigProvider
  ) {
      this.obsSettingsService = new BehaviorSubject<boolean>(null);
  }

   /**
     * load paramiters
     * 0 - imposto globals con i valori di default
     * 3 - richiamo setParameters per il settaggio dei parametri
     */
   initParamiters(globals: Globals, el: ElementRef) {
    const that = this;
    this.globals = globals;
    this.el = el;

    /**
    * SETTING LOCAL DEFAULT:
    * set the default globals parameters
    */
    this.globals.initDefafultParameters();

    /**SET TENANT parameter */
    this.globals.tenant = this.appConfigService.getConfig().firebaseConfig.tenant
    /**SET LOGLEVEL parameter */
    this.globals.logLevel = this.appConfigService.getConfig().logLevel
    /**SET PERSISTENCE parameter */
    this.globals.persistence = this.appConfigService.getConfig().authPersistence
     /**SET SUPPORTMODE parameter */
     this.globals.supportMode = getParameterValue('supportMode', this.appConfigService.getConfig());
    /** INIT STORAGE SERVICE */
    this.appStorageService.initialize(environment.storage_prefix, this.globals.persistence, '')
    /** INIT FILEUPLOADACCEPT parameter */
    this.globals.fileUploadAccept = this.appConfigService.getConfig().fileUploadAccept;
    /** LOAD PARAMETERS 
     * set parameters in globals
    */
   this.setParameters()
   }


   /**
   * 3: setParameters
   * imposto i parametri secondo il seguente ordine:
   * D: imposto i parametri recuperati dallo storage in global
   * E: imposto i parametri recuperati da url parameters in global
  */
  setParameters() {
    this.logger.debug('[GLOBAL-SET] ***** setParameters ***** ')
    this.setVariableFromStorage(this.globals);
    this.setVariablesFromUrlParameters(this.globals);
    this.logger.debug('[GLOBAL-SET] ***** END SET PARAMETERS *****');
    this.obsSettingsService.next(true);
  }


  /**
   * D: setVariableFromStorage
   * recupero il dictionary global dal local storage
   * aggiorno tutti i valori di globals
   * @param globals
  */
  setVariableFromStorage(globals: Globals) {
    this.logger.debug('[GLOBAL-SET] setVariableFromStorage :::::::: SET VARIABLE ---------->', Object.keys(globals));
    for (const key of Object.keys(globals)) {
        const val = this.appStorageService.getItem(key);
        // this.logger.debug('[GLOBAL-SET] setVariableFromStorage SET globals KEY ---------->', key);
        // this.logger.debug('[GLOBAL-SET] setVariableFromStorage SET globals VAL ---------->', val);
        if (val && val !== null) {
            // globals.setParameter(key, val);
            globals[key] = stringToBoolean(val);
        }
        // this.logger.debug('[GLOBAL-SET] setVariableFromStorage SET globals == ---------->', globals);
    } 
  }

  /**
  * E: setVariableFromUrlParameters
  */
  setVariablesFromUrlParameters(globals: Globals) {
    this.logger.debug('[GLOBAL-SET] setVariablesFromUrlParameters: ');
    const windowContext = globals.windowContext;
    let TEMP: any;
    TEMP = getParameterByName(windowContext, 'tiledesk_tenant');
    if (TEMP) {
        globals.tenant = stringToBoolean(TEMP);
    }

    TEMP = getParameterByName(windowContext, 'tiledesk_supportMode');
    if (TEMP) {
        globals.supportMode = stringToBoolean(TEMP);
    }

    TEMP = getParameterByName(windowContext, 'tiledesk_lang');
    if (TEMP) {
        globals.lang = stringToBoolean(TEMP);
    }

    TEMP = getParameterByName(windowContext, 'tiledesk_persistence');
    if (TEMP) {
        globals.persistence = TEMP;
    }

    TEMP = getParameterByName(windowContext, 'jwt');
    if (TEMP) {
        globals.jwt = TEMP;
    }

    TEMP = getParameterByName(windowContext, 'tiledesk_logLevel');
    if (TEMP) {
        globals.logLevel = TEMP;
    }

    TEMP = getParameterByName(windowContext, 'tiledesk_projectID');
    if (TEMP) {
        globals.projectID = TEMP;
    }

}
}
