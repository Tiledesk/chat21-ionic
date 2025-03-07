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
export class TiledeskService {

  // private
  private SERVER_BASE_URL: string;
  private tiledeskToken: string;

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public http: HttpClient,
    public appStorageService: AppStorageService
  ) {}

  initialize(serverBaseUrl: string) {
    this.logger.log('[TILEDESK-SERVICE] - initialize serverBaseUrl', serverBaseUrl);
    this.SERVER_BASE_URL = serverBaseUrl;
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken')
  }


  // CLOSE SUPPORT GROUP
  public closeSupportGroup(projectid: string, supportgroupid: string) {
    const url = this.SERVER_BASE_URL + projectid + '/requests/' + supportgroupid + '/close';
    this.logger.log('[TILEDESK-SERVICE] - closeSupportGroup URL ', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    const body = {
      force: true
    };

    return this.http.put(url, body, httpOptions).pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] - closeSupportGroup - RES ', res);
        return res
    }))
  }

  // ---------------------------------------------
  // @ GET request by id
  // ---------------------------------------------
  public getRequest(request_id: string, project_id: string) {
    const url = this.SERVER_BASE_URL + project_id + '/requests/'+request_id
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD url ', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    return this.http.get(url, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD RES ', res);
      return res
    }))
  }

  public getProjectIdByConvRecipient(conversationWith: string ) {
    const lookupUrl = this.SERVER_BASE_URL + 'requests_util/lookup/id_project/' + conversationWith;

    this.logger.log('[TILEDESK-SERVICE] GET PROJECTID BY CONV RECIPIENT - URL ', lookupUrl);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    return this.http.get(lookupUrl, httpOptions).pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] GET PROJECTID BY CONV RECIPIENT - RES ', res);
        return res
    }))
  }

  public getProjectUsersByProjectId(project_id: string) {
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

  public getAllLeadsActiveWithLimit(project_id: string, limit: number) {
    const url = this.SERVER_BASE_URL + project_id + '/leads?limit=' + limit + '&with_fullname=true';
    this.logger.log('[TILEDESK-SERVICE] - GET ALL ACTIVE LEADS (LIMIT 10000) -  URL', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    return this.http.get(url, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET ALL ACTIVE LEADS (LIMIT 10000) ', res);
      return res
    }))
  }


  // ---------------------------------------------
  // @ Create new project user to get new lead ID
  // ---------------------------------------------
  public createNewProjectUserToGetNewLeadID(project_id: string) {
    const url = this.SERVER_BASE_URL + project_id + '/project_users/'
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    const body = {};
    return this.http.post(url, body, httpOptions).pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', res);
        return res
      }))
  }

  // ---------------------------------------------
  // @ Create new lead 
  // ---------------------------------------------
  public createNewLead(leadid: string, fullname: string, leademail: string, project_id: string) {
    const url = this.SERVER_BASE_URL + project_id + '/leads/'
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD url ', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    const body = { 'lead_id': leadid, 'fullname': fullname, 'email': leademail };
    this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD ', body);

    return this.http.post(url, body, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD RES ', res);
      return res
    }))
  }

  // -------------------------------------------------------------------------------------
  // @ Get all bots of the project (with all=true the response return also the identity bot) 
  // -------------------------------------------------------------------------------------
  public getAllBotByProjectId(project_id: string) {
    const url = this.SERVER_BASE_URL + project_id + '/faq_kb?all=true'
    this.logger.log('[TILEDESK-SERVICE] - GET ALL BOTS BY PROJECT ID - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    return this.http.get(url, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET ALL BOTS BY PROJECT ID - RES ', res);
      return res
    }))
  }

  // -------------------------------------------------------------------------------------
  // @ Get all DEPTS of the project
  // -------------------------------------------------------------------------------------
  public getDeptsByProjectId(project_id: string) {
    const url = this.SERVER_BASE_URL + project_id + '/departments/allstatus';
    this.logger.log('[TILEDESK-SERVICE] - GET DEPTS (ALL STATUS) - URL', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    return this.http.get(url, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - GET DEPTS (ALL STATUS) - RES ', res);
      return res
    }))
  }

  // -----------------------------------------------------------------------------------------
  // @ Create ticket
  // -----------------------------------------------------------------------------------------
  public createInternalRequest(requester_id: string, request_id: string, subject: string, message: string, departmentid: string, participantid: string, ticketpriority: string, project_id: string) {
    const url = this.SERVER_BASE_URL + project_id + '/requests/' + request_id + '/messages'
    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST URL ', url)
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
    // this.logger.log('JOIN FUNCT OPTIONS  ', options);
    let body = {}
    body = { 'sender': requester_id, 'subject': subject, 'text': message, 'departmentid': departmentid, 'channel': { 'name': 'form' }, 'priority': ticketpriority };
    if (participantid !== undefined) {
      body['participants'] = [participantid]
    } else {
      body['participants'] = participantid
    }
    // , 'participants': [participantid]

    this.logger.log('[WS-REQUESTS-SERV] - CREATE INTERNAL REQUEST body ', body);
    return this.http.post(url, body, httpOptions).pipe(map((res: any) => {
      this.logger.log('[TILEDESK-SERVICE] - CREATE NEW LEAD RES ', res);
      return res
    }))
  }

  // -----------------------------------------------------------------------------------------
  // @ Send Email
  // -----------------------------------------------------------------------------------------
  public sendEmail(projectid: string, request_id: string, form: { subject: string, text: string}) {
    const url = this.SERVER_BASE_URL + projectid + '/requests/' + request_id + '/email/send';
    this.logger.log('[TILEDESK-SERVICE] - sendEmail URL ', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };

    const body = form;

    return this.http.post(url, body, httpOptions).pipe(map((res: any) => {
        this.logger.log('[TILEDESK-SERVICE] - sendEmail - RES ', res);
        return res
    }))
  }
  
}
