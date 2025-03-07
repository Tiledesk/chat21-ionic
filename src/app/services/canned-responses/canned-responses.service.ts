import { Injectable } from '@angular/core';
import { AppConfigProvider } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CannedResponsesService {

  private SERVER_BASE_URL: string;
  private tiledeskToken: string;

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public http: HttpClient,
    public appStorageService: AppStorageService
  ) {
    this.logger.log('[CANNED-RESPONSES-SERVICE] HELLO !');
  }

  initialize(serverBaseUrl: string) {
    this.logger.log('[CANNED-RESPONSES-SERVICE] - initialize serverBaseUrl', serverBaseUrl);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken')
  }


  public getAll(projectid: string) {
    const url = this.SERVER_BASE_URL + projectid + "/canned/";
    this.logger.log('[CANNED-RESPONSES-SERVICE] getCannedResponses - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    
    return this.http.get(url, httpOptions).pipe(map((res: any) => {
        this.logger.log('[CANNED-RESPONSES-SERVICE] getCannedResponses - RES ', res);
        return res
    }))
  }

  // -------------------------------------------------------------------------------------
  // @ Create - Save (POST) new canned response
  // -------------------------------------------------------------------------------------
  public add(projectid: string, title: string, message: string) {
    const url =  this.SERVER_BASE_URL  + projectid + '/canned/'
    this.logger.log('[TILEDESK-SERVICE] - CREATE CANNED-RES - URL', url); 
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    const body = {
      title: title,
      text: message
    }

    return this.http.post(url, JSON.stringify(body), httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE CANNED-RES - RES ', res);
      return res
    }))
      
  }

  public edit(projectid: string, canned: any){
    const cannedResponsesURL = this.SERVER_BASE_URL + projectid + "/canned/"+ canned._id;
    this.logger.log('[CANNED-RESPONSES-SERVICE] editCannedResponses - URL ', cannedResponsesURL);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    const body = {
      title: canned.title,
      text: canned.text
    }

    return this.http.put(cannedResponsesURL, body, httpOptions).pipe(map((res: any) => {
        this.logger.log('[CANNED-RESPONSES-SERVICE] editCannedResponses - RES ', res);
        return res
    }))
  }

  public delete(projectid: string, cannedID: string){
    const cannedResponsesURL = this.SERVER_BASE_URL + projectid + "/canned/"+cannedID;
    this.logger.log('[CANNED-RESPONSES-SERVICE] deleteCannedResponses - URL ', cannedResponsesURL);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    return this.http.delete(cannedResponsesURL, httpOptions).pipe(map((res: any) => {
        this.logger.log('[CANNED-RESPONSES-SERVICE] deleteCannedResponses - RES ', res);
        return res
    }))
  }

}
