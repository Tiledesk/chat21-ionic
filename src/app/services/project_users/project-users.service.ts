import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectUser } from 'src/chat21-core/models/projectUsers';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

@Injectable({
  providedIn: 'root'
})
export class ProjectUsersService {

  private SERVER_BASE_URL: string;
  private tiledeskToken: string;

  private logger: LoggerService = LoggerInstance.getInstance();
  constructor(
      public http: HttpClient,
      public appStorageService: AppStorageService
  ) {}
  
  initialize(serverBaseUrl: string) {
    this.logger.log('[TILEDESK-PROJECT_USERS-SERV] - initialize serverBaseUrl', serverBaseUrl);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken')
  }

  public getProjectUsersByProjectId(project_id: string): Observable<ProjectUser[]> {
    const url = this.SERVER_BASE_URL + project_id + '/project_users/';
    this.logger.log('[TILEDESK-SERVICE] - GET PROJECT-USER URL', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    return this.http.get(url, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET PROJECT-USER RES ', res);
      return res
    }))
  }

  public getProjectUserByProjectId(project_id:  string): Promise<ProjectUser> {
    const url = this.SERVER_BASE_URL + project_id + '/project_users/me';
    this.logger.log('[TILEDESK-SERVICE]- GET PROJECT-USER BY USER-ID - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    return this.http.get(url, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET PROJECT-USER RES ', res);
      return res[0]
    })).toPromise();
  }

}
