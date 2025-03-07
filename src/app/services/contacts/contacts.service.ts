import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

// import {FIREBASESTORAGE_BASE_URL_IMAGE} from 'src/chat21-core/utils/constants'
// models
import { UserModel } from 'src/chat21-core/models/user';

// utils
import { avatarPlaceholder,  getColorBck} from 'src/chat21-core/utils/utils-user';
import { AppConfigProvider } from '../app-config';
import { map } from 'rxjs/operators';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';

@Injectable({
  providedIn: 'root'
})

export class ContactsService {

  // BehaviorSubjects
  BScontacts: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>(null);
  BScontactDetail: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(null);

  // private
  private SERVER_BASE_URL: string;
  private tiledeskToken: string;

  private contacts: UserModel[];
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


  /** */
  public loadContactsFromUrl() {
    const url = this.SERVER_BASE_URL + 'chat21/contacts';
    this.logger.log('[CONTACT-SERVICE] loadContactsFromUrl urlRemoteContacts', url)
    // if (this.urlRemoteContacts.startsWith('http') && token) {
    const that = this;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.tiledeskToken
      })
    };
      
    this.contacts = [];
    this.http.get<any[]>(url, httpOptions).subscribe(users => {
      this.logger.log('[CONTACT-SERVICE] loadContactsFromUrl users ', users);
      users.forEach(user => {
        const member = that.createCompleteUser(user);
        that.contacts.push(member);
      });
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
      this.BScontacts.next(this.contacts);
    }, error => {
      this.logger.error('[CONTACT-SERVICE] loadContactsFromUrl ERROR ', error);
    });
    // }
  }



  // public _loadContactDetail(token: string, uid: string) {
  //   this.contacts = [];
  //   console.log('loadContactDetail:: uid ', uid);
  //   const urlRemoteContactDetail = this.urlRemoteContacts + '/' + uid;
  //   if (urlRemoteContactDetail.startsWith('http') && token) {
  //     const that = this;
  //     const httpOptions = {
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/json',
  //         Authorization: token
  //       })
  //     };
  //     const postData = {
  //     };
  //     console.log('INFO-CONTENT-COMP (contact-service) loadContactDetail:: url ', urlRemoteContactDetail);
  //     this.http
  //       .get<any>(urlRemoteContactDetail, httpOptions)
  //       .subscribe(user => {
  //         console.log('INFO-CONTENT-COMP (contact-service) loadContactDetail:: data ', user);
  //         const member = that.createCompleteUser(user);
  //         this.BScontactDetail.next(member);
  //       }, error => {
  //         console.log('urlRemoreContactDetail:: error ', error);
  //       });
  //   }
  // }

  /**
  * 
  * @param token
  * @param uid
  */
  public loadContactDetail(uid: string) {
    this.contacts = [];
    const url = this.SERVER_BASE_URL + 'chat21/contacts/' + uid;
    this.logger.log('[CONTACT-SERVICE] - loadContactDetail - uid ', uid);
    // if (urlRemoteContactDetail.startsWith('http') && token) {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.tiledeskToken
        })
      };
      // const postData = {};
      this.logger.log('[CONTACT-SERVICE] - loadContactDetail  url ', url);
      return this.http.get(url, httpOptions).pipe(map((res: any) => {
          this.logger.log('[CONTACT-SERVICE] - loadContactDetail - loadContactDetail RES ', res);
          if (res.uid) {
            let user = this.createCompleteUser(res)
            return user
          }
        }))

    // }
  }


  /**
   * createCompleteUser
   * @param user
   */
  private createCompleteUser(user: any): UserModel {
    this.logger.log('[CONTACT-SERVICE] - createCompleteUser !!!  ');
    const member = new UserModel(user.uid);
    try {
      const uid = user.uid;
      const firstname = user.firstname ? user.firstname : '';
      const lastname = user.lastname ? user.lastname : '';
      const email = user.email ? user.email : '';
      const fullname = (firstname + ' ' + lastname).trim();
      const avatar = avatarPlaceholder(fullname);
      const color = getColorBck(fullname);
      // const imageurl = getImageUrlThumbFromFirebasestorage(user.uid, this.FIREBASESTORAGE_BASE_URL_IMAGE, this.urlStorageBucket);
      member.uid = uid;
      member.email = email;
      member.firstname = firstname;
      member.lastname = lastname;
      member.fullname = fullname;
      // member.imageurl = imageurl;
      member.avatar = avatar;
      member.color = color;
      this.logger.log('CONTACT-SERVICE] - createCompleteUser member', member);
    } catch (err) {
      this.logger.error('CONTACT-SERVICE] - createCompleteUser - ERROR ' , err);
    }
    return member;
  }

}
