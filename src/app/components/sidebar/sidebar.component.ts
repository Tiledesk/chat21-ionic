import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigProvider } from 'src/app/services/app-config';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from 'src/app/services/events-service';
import { tranlatedLanguage } from '../../../chat21-core/utils/constants';

// utils
import { avatarPlaceholder, getColorBck } from 'src/chat21-core/utils/utils-user';
import { BRAND_BASE_INFO, LOGOS_ITEMS } from 'src/app/utils/utils-resources';
import { getOSCode, hasRole } from 'src/app/utils/utils';
import { PERMISSIONS } from 'src/app/utils/permissions.constants';
import { ProjectUser } from 'src/chat21-core/models/projectUsers';
import { ProjectUsersService } from 'src/app/services/project_users/project-users.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  private logger: LoggerService = LoggerInstance.getInstance();

  USER_ROLE: string = 'agent'
  SIDEBAR_IS_SMALL = true
  IS_AVAILABLE: boolean = false;
  IS_INACTIVE: boolean = true;
  IS_BUSY: boolean; 
  // isVisibleAPP: boolean;
  isVisibleANA: boolean;
  isVisibleACT: boolean;
  isVisibleMON: boolean;
  isVisibleCNT: boolean;
  isVisibleKNB: boolean;
  photo_profile_URL: string;
  project_id: string;
  DASHBOARD_URL: string;
  // HAS_CLICKED_OPEN_USER_DETAIL: boolean = false
  public translationsMap: Map<string, string>;
  public_Key: any;
  conversations_lbl: string;
  whatsappbroadcast_lbl: string;
  contacts_lbl: string;
  apps_lbl: string;
  analytics_lbl: string;
  activities_lbl: string;
  history_lbl: string;
  settings_lbl: string;
  countClickOnOpenUserDetailSidebar: number = 0
  USER_PHOTO_PROFILE_EXIST: boolean;
  currentUser: any;
  URLS: { [key: string]: string} = {};

  public projectUser: ProjectUser;
  public roles: { [key: string]: boolean }

  LOGOS_ITEMS = LOGOS_ITEMS;
  BRAND_BASE_INFO = BRAND_BASE_INFO;
  PERMISSIONS = PERMISSIONS;
  constructor(
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    public appConfig: AppConfigProvider,
    private translateService: CustomTranslateService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
    private translate: TranslateService,
    public projectUsersService: ProjectUsersService,
    public events: EventsService,

  ) { }

  ngOnInit() {
    this.URLS.TILEDESK = BRAND_BASE_INFO['COMPANY_SITE_URL'] as string
    
    this.DASHBOARD_URL = this.appConfig.getConfig().dashboardUrl + '#/project/';
    this.getStoredProjectAndUserRole()
    this.subcribeToAuthStateChanged()
    this.listenTocurrentProjectUserUserAvailability$()
    this.getOSCODE();
    this.getCurrentChatLangAndTranslateLabels();
  }


  getStoredProjectAndUserRole() {
    this.events.subscribe('storage:last_project',async (project) =>{
      this.logger.log('[SIDEBAR] stored_project ', project)
      if (project && project !== 'undefined') {
        this.project_id = project.id_project.id
        this.USER_ROLE = project.role;
        this.buildURLs(this.USER_ROLE)
        this.projectUser = await this.projectUsersService.getProjectUserByProjectId(project.id_project.id)
        this.roles = this.checkRoles()
        this.logger.log('[SIDEBAR] roles ', this.roles)
      }
    })
  }

  buildURLs(USER_ROLE) {
    const base = this.DASHBOARD_URL + this.project_id;

    this.URLS = {
      HOME: `${base}/home`,
      KNOWLEDGEBASE: `${base}/knowledge-bases`,
      BOTS: `${base}/bots`,
      MONITOR: `${base}/wsrequests`,
      WHATSAPP: `${base}/automations`,
      CONTACTS: `${base}/contacts`,
      APPSTORE: `${base}/app-store`,
      ANALYTICS: `${base}/analytics`,
      ACTIVITIES: `${base}/activities`,
      HISTORY: `${base}/history`,
      SETTINGS: USER_ROLE !== 'agent' ? `${base}/widget-set-up` : `${base}/cannedresponses`,
      TILEDESK: 'https://www.tiledesk.com'
    };

  }

  subcribeToAuthStateChanged() {
    this.messagingAuthService.BSAuthStateChanged.subscribe((state) => {
      this.logger.log('[SIDEBAR] BSAuthStateChanged ', state)

      if (state === 'online') {
        const storedCurrentUser = this.appStorageService.getItem('currentUser');
        this.logger.log('[SIDEBAR] storedCurrentUser ', storedCurrentUser)

        if (storedCurrentUser && storedCurrentUser !== 'undefined') {
          this.currentUser = JSON.parse(storedCurrentUser);
          this.logger.log('[SIDEBAR] subcribeToAuthStateChanged currentUser ', this.currentUser)
          if (this.currentUser) {
            this.createUserAvatar(this.currentUser)
            this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(this.currentUser.uid)
            this.logger.log('[SIDEBAR] photo_profile_URL ', this.photo_profile_URL)
            this.checkIfExistPhotoProfile(this.photo_profile_URL)
            this.checkAndRemoveDashboardForegroundCount()
          }
        } else {
          this.logger.error('[SIDEBAR] BSAuthStateChanged current user not found in storage')
        }
      }
    })
  }

  checkIfExistPhotoProfile(imageUrl) {
    this.verifyImageURL(imageUrl, (imageExists) => {

      if (imageExists === true) {
        this.USER_PHOTO_PROFILE_EXIST = true;
        this.logger.log('[SIDEBAR] photo_profile_URL IMAGE EXIST ', imageExists)

      } else {
        this.USER_PHOTO_PROFILE_EXIST = false;
        this.logger.log('[SIDEBAR] photo_profile_URL IMAGE EXIST ', imageExists)
      }
    })
  }

  checkAndRemoveDashboardForegroundCount(){
    try {
      const dashboardForegroundCount = localStorage.getItem('dshbrd----foregroundcount')
      this.logger.log('[SIDEBAR] - THERE IS DASHBOARD FOREGROUND COUNT', dashboardForegroundCount)
      if (dashboardForegroundCount && dashboardForegroundCount !== 'undefined') {
        localStorage.setItem('dshbrd----foregroundcount', '0')
      }
    } catch (err) {
      this.logger.error('Get local storage dshbrd----foregroundcount ', err)
    }
  }

  createUserAvatar(currentUser) {
    this.logger.log('[SIDEBAR] - createProjectUserAvatar ', currentUser)
    let fullname = ''
    if (currentUser && currentUser.firstname && currentUser.lastname) {
      fullname = currentUser.firstname + ' ' + currentUser.lastname
      currentUser['fullname_initial'] = avatarPlaceholder(fullname)
      currentUser['fillColour'] = getColorBck(fullname)
    } else if (currentUser && currentUser.firstname) {
      fullname = currentUser.firstname
      currentUser['fullname_initial'] = avatarPlaceholder(fullname)
      currentUser['fillColour'] = getColorBck(fullname)
    } else {
      currentUser['fullname_initial'] = 'N/A'
      currentUser['fillColour'] = 'rgb(98, 100, 167)'
    }
  }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  getCurrentChatLangAndTranslateLabels() {
    const browserLang = this.translate.getBrowserLang();

    const storedCurrentUser = this.appStorageService.getItem('currentUser')
    this.logger.log('[SIDEBAR] - ngOnInit - storedCurrentUser ', storedCurrentUser)


    if (storedCurrentUser && storedCurrentUser !== 'undefined') {
      const currentUser = JSON.parse(storedCurrentUser);
      this.logger.log('[SIDEBAR] - ngOnInit - currentUser ', currentUser)
      this.logger.log('[SIDEBAR] - ngOnInit - browserLang ', browserLang)
      let currentUserId = ''
      if (currentUser) {
        currentUserId = currentUser.uid
        this.logger.log('[SIDEBAR] - ngOnInit - getCurrentChatLangAndTranslateLabels - currentUserId ', currentUserId)
      }

      const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
      this.logger.log('[SIDEBAR] stored_preferred_lang: ', stored_preferred_lang);

      let chat_lang = '';
      if (browserLang && !stored_preferred_lang) {
        chat_lang = browserLang
        this.logger.log('[SIDEBAR] chat_lang: ', chat_lang);
      } else if (browserLang && stored_preferred_lang) {
        chat_lang = stored_preferred_lang
        this.logger.log('[SIDEBAR] chat_lang: ', chat_lang);
      }
      if (tranlatedLanguage.includes(chat_lang)) {
        this.logger.log('[SIDEBAR] tranlatedLanguage includes', chat_lang, ': ', tranlatedLanguage.includes(chat_lang))
        this.translate.use(chat_lang);
      } else {
        this.logger.log('[SIDEBAR] tranlatedLanguage includes', chat_lang, ': ', tranlatedLanguage.includes(chat_lang))
        this.translate.use('en');
      }
    } else {
      this.logger.error('[SIDEBAR] - ngOnInit - currentUser not found in storage ')
    }
    this.translateLabels()
    this.translations()
  }


  translateLabels() {
    const keys= [
      'Conversations',
      'LABEL_CONTACTS',
      'Apps',
      'Analytics',
      'Activities',
      'History',
      'Settings'
    ]

    this.translate.get(keys).subscribe((text: string) => {
      this.conversations_lbl = text['Conversations'];
      this.whatsappbroadcast_lbl = text['WhatsAppBroadcasts']
      this.contacts_lbl = text['LABEL_CONTACTS']
      this.apps_lbl = text['Apps']
      this.analytics_lbl = text['Analytics']
      this.activities_lbl = text['Activities']
      this.history_lbl = text['History']
      this.settings_lbl = text['Settings']
      
    });
  }

  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    
    this.isVisibleANA = getOSCode("ANA", this.public_Key);
    this.isVisibleACT = getOSCode("ACT", this.public_Key);
    this.isVisibleMON = getOSCode("MON", this.public_Key);
    this.isVisibleCNT = getOSCode("CNT", this.public_Key);
    this.isVisibleKNB = getOSCode("KNB", this.public_Key);

  }


  checkRoles(): { [key: string]: boolean } {
      const permissionKeys = [
        'HOME_READ',
        'KB_READ',
        'FLOWS_READ',
        'INBOX_READ',
        'AUTOMATIONSLOG_READ',
        'LEADS_READ',
        'ANALYTICS_READ',
        'ACTIVITIES_READ',
        'HISTORY_READ',
        'PROJECTSETTINGS_GENERAL_READ',
        'PROJECTSETTINGS_DEVELOPER_READ',
        'PROJECTSETTINGS_SMARTASSIGNMENT_READ',
        'PROJECTSETTINGS_NOTIFICATION_READ',
        'PROJECTSETTINGS_SECURITY_READ',
        'PROJECTSETTINGS_BANNED_READ',
        'PROJECTSETTINGS_ADVANCED_READ'
      ] as const;
  
      const roles: { [key: string]: boolean } = {};
      for (const key of permissionKeys) {
        const permission = PERMISSIONS[key];
        roles[permission] = hasRole(this.projectUser, permission);
      }


      let settingRoleKEys = [
        'PROJECTSETTINGS_GENERAL_READ',
        'PROJECTSETTINGS_DEVELOPER_READ',
        'PROJECTSETTINGS_SMARTASSIGNMENT_READ',
        'PROJECTSETTINGS_NOTIFICATION_READ',
        'PROJECTSETTINGS_SECURITY_READ',
        'PROJECTSETTINGS_BANNED_READ',
        'PROJECTSETTINGS_ADVANCED_READ'
      ] as const;
      roles[PERMISSIONS.SETTINGS_READ] = settingRoleKEys.some(settingKey => roles[PERMISSIONS[settingKey]]);
  
      return roles;
  
    }

  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$.subscribe((data) => {
      this.logger.log('[SIDEBAR] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', data);

      if (data !== null) {
        if (data['user_available'] === false && data['profileStatus'] === "inactive") {
            this.IS_AVAILABLE = false;
            this.IS_INACTIVE = true;
            // console.log('[SIDEBAR] - GET WS CURRENT-USER - data - IS_INACTIVE ' , this.IS_INACTIVE) 
        } else if (data['user_available'] === false && (data['profileStatus'] === '' || !data['profileStatus'] )) {
            this.IS_AVAILABLE = false;
            this.IS_INACTIVE = false;
            // console.log('[SIDEBAR] - GET WS CURRENT-USER - data - IS_AVAILABLE ' , this.IS_AVAILABLE) 
        } else if (data['user_available'] === true && (data['profileStatus'] === '' || !data['profileStatus'])) {
            this.IS_AVAILABLE = true;
            this.IS_INACTIVE = false;
            // console.log('[SIDEBAR] - GET WS CURRENT-USER - data - IS_AVAILABLE ' , this.IS_AVAILABLE) 
        }
      }

    }, (error) => {
      this.logger.error('[SIDEBAR] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
    }, () => {
      this.logger.log('[SIDEBAR] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
    })
  }

  openUserDetailSidePanel() {
    this.countClickOnOpenUserDetailSidebar++
    this.logger.log('[SIDEBAR-CHAT] countClickOnOpenUserDetailSidebar', this.countClickOnOpenUserDetailSidebar)
    this.logger.log('[SIDEBAR-CHAT] OPEN UESER DTLS SIDE PANEL')
    const elSidebarUserDtls = <HTMLElement>document.querySelector('#user-details');
    this.logger.log('[SIDEBAR] OPEN USER DTLS SIDE PANEL elSidebarUserDtls ', elSidebarUserDtls)

  
    if (elSidebarUserDtls && this.countClickOnOpenUserDetailSidebar === 1) {
      elSidebarUserDtls.classList.add("active");
    }
    if (elSidebarUserDtls && this.countClickOnOpenUserDetailSidebar > 1) {
      if (elSidebarUserDtls.classList.contains('active')) {
        this.logger.log('[SIDEBAR-CHAT] elSidebarUserDtls contains class ACTIVE', elSidebarUserDtls)
        elSidebarUserDtls.classList.remove("active");
      } else if (!elSidebarUserDtls.classList.contains('active')) {
        this.logger.log('[SIDEBAR-CHAT] elSidebarUserDtls NOT contains class ACTIVE', elSidebarUserDtls)
        elSidebarUserDtls.classList.add("active");
      }
    }
  }

  public translations() {
    const keys = [
      'Monitor',
      'Flows',
      'Knowledgebases',
      'WhatsAppBroadcasts',
      'LABEL_CONTACTS',
      'Apps',
      'Analytics',
      'Activities',
      'History',
      'Settings'
    ];
    this.translationsMap = this.translateService.translateLanguage(keys);
  }


  changeAvailabilityState(IS_AVAILABLE) {

  }













}




