import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigProvider } from '../app-config';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { map, filter } from 'rxjs/operators';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CopilotService {

  private apiUrl: string;
  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    public http: HttpClient,
    public appConfigProvider: AppConfigProvider
  ) {
    this.logger.log('[COPILOT-SERVICE] HELLO !');
    this.apiUrl = appConfigProvider.getConfig().apiUrl;
    this.logger.log('[COPILOT-SERVICE] apiUrl ', this.apiUrl);
  }

  public getAll(token: string, projectid: string, conversWith: string) {
      const url = this.apiUrl + projectid + "/copilot?request_id=" + conversWith;
      this.logger.log('[COPILOT-SERVICE] getAllSuggestions - URL ', url);
  
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: token
        })
      };
      
      return this.http.get(url, httpOptions).pipe(map((res: [any]) => {
          let suggestions = res.filter(el => el !== null).map(el => ({ ...el, _id:  uuid.v4()} ));
          this.logger.log('[COPILOT-SERVICE] getCannedResponses - RES ', suggestions);
          return suggestions
      }))
  }

  public getAllFromQuestion(question: string, token: string, projectid: string, conversWith: string) {
    const url = this.apiUrl + projectid + "/copilot?request_id=" + conversWith;
    this.logger.log('[COPILOT-SERVICE] getAllSuggestions - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };

    console.log('questionnnn', question)
    const body = {
      text: question
    };
    
    return this.http.post(url, body, httpOptions).pipe(map((res: [any]) => {
        let suggestions = res.filter(el => el !== null).map(el => ({ ...el, _id:  uuid.v4()} ));
        this.logger.log('[COPILOT-SERVICE] getCannedResponses - RES ', suggestions);
        return suggestions
    }))
}
    
}
