import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Project } from 'src/chat21-core/models/projects';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppConfigProvider } from '../app-config';
import { Observable } from 'rxjs';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private SERVER_BASE_URL: string;
  private tiledeskToken: string;

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public http: HttpClient,
    public appStorageService: AppStorageService
  ) {
   
    this.logger.log('[PROJECTS-SERVICE] HELLO !');
  }

  initialize(serverBaseUrl: string) {
    this.logger.log('[TILEDESK-PROJECTS-SERV] - initialize serverBaseUrl', serverBaseUrl);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken')
  }

  public getProjects(): Observable<Project[]> {
    const url = this.SERVER_BASE_URL  + "projects/";
    this.logger.log('[PROJECTS-SERVICE] getProjects - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    
    return this.http.get(url, httpOptions).pipe(map((res: Project[]) => {
        this.logger.log('[PROJECTS-SERVICE] getProjects - RES ', res);
        return res
    }))
  }

  public getProjectById(id: string): Observable<Project> {
    const url = this.SERVER_BASE_URL + 'projects/' + id;
    this.logger.log('[TILEDESK-SERVICE] - GET PROJECT BY ID URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    return this.http.get(url, httpOptions).pipe(map((project: Project) => {
      this.logger.log('[TILEDESK-SERVICE] GET PROJECT BY ID URL - RES ', project);
      return project
    }))
  }

}
