import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigProvider } from '../app-config';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { map, filter } from 'rxjs/operators';
import * as uuid from 'uuid';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CopilotService {

  private SERVER_BASE_URL: string;
  private tiledeskToken: string;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    public http: HttpClient,
    public appStorageService: AppStorageService
  ) {
    this.logger.log('[COPILOT-SERVICE] HELLO !');
  }

  initialize(serverBaseUrl: string) {
    this.logger.log('[COPILOT-SERVICE] - initialize serverBaseUrl', serverBaseUrl);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken')
  }

  public getAll(projectid: string, conversWith: string) {
    const url = this.SERVER_BASE_URL + projectid + "/copilot?request_id=" + conversWith;
    this.logger.log('[COPILOT-SERVICE] getAllSuggestions - URL ', url);
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
      
    return this.http.get(url, httpOptions).pipe(map((res: [any]) => {
        let suggestions = res.filter(el => el !== null).map(el => ({ ...el, _id:  uuid.v4()} ));
        return suggestions
    }))
  }

  public getAllFromQuestion(question: string, projectid: string, conversWith: string) {
    const url = this.SERVER_BASE_URL + projectid + "/copilot?request_id=" + conversWith;
    this.logger.log('[COPILOT-SERVICE] getAllSuggestions - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    const body = {
      text: question
    };
    
    return this.http.post(url, body, httpOptions).pipe(map((res: [any]) => {
        let suggestions = res.filter(el => el !== null).map(el => ({ ...el, _id:  uuid.v4()} ));
        return suggestions
    }))
}
    
}
