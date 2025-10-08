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
import { getOSCode } from 'src/app/utils/utils';

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
  isVisibleAPP: boolean;
  isVisibleANA: boolean;
  isVisibleACT: boolean;
  isVisibleMON: boolean;
  isVisibleCNT: boolean;
  isVisibleKNB: boolean;
  photo_profile_URL: string;
  project_id: string;
  DASHBOARD_URL: string;
  // HAS_CLICKED_OPEN_USER_DETAIL: boolean = false
  public translationMap: Map<string, string>;
  public_Key: any;
  conversations_lbl: string;
  contacts_lbl: string;
  apps_lbl: string;
  analytics_lbl: string;
  activities_lbl: string;
  history_lbl: string;
  settings_lbl: string;
  countClickOnOpenUserDetailSidebar: number = 0
  USER_PHOTO_PROFILE_EXIST: boolean;
  currentUser: any;
  dashboard_home_url: string;
  dashboard_knb_url: string;
  dashboard_bots_url: string;
  dashboard_convs_url: string;
  dashboard_contacts_url: string;
  dashboard_app_url: string;
  dashboard_analytics_url: string;
  dashboard_activities_url: string;
  dashboard_history_url: string;
  dashboard_settings_url: string;
  tiledesk_url: string;
  LOGOS_ITEMS = LOGOS_ITEMS;
  BRAND_BASE_INFO = BRAND_BASE_INFO;
  constructor(
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    public appConfig: AppConfigProvider,
    private translateService: CustomTranslateService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
    private translate: TranslateService,
    public events: EventsService,

  ) { }

  ngOnInit() {
    this.tiledesk_url = BRAND_BASE_INFO['COMPANY_SITE_URL'] as string
    
    this.DASHBOARD_URL = this.appConfig.getConfig().dashboardUrl + '#/project/';
    this.getStoredProjectAndUserRole()
    this.subcribeToAuthStateChanged()
    this.listenTocurrentProjectUserUserAvailability$()
    this.getOSCODE();
    this.getCurrentChatLangAndTranslateLabels();
  }


  getStoredProjectAndUserRole() {
    this.events.subscribe('storage:last_project',project =>{
      this.logger.log('[SIDEBAR] stored_project ', project)
      if (project && project !== 'undefined') {
        this.project_id = project.id_project.id
        this.USER_ROLE = project.role;
        this.buildURLs(this.USER_ROLE)
      }
    })
  }

  buildURLs(USER_ROLE) {
    this.dashboard_home_url = this.DASHBOARD_URL + this.project_id + '/home'
    this.dashboard_knb_url = this.DASHBOARD_URL + this.project_id + '/knowledge-bases'
    this.dashboard_bots_url = this.DASHBOARD_URL + this.project_id + '/bots'
    this.dashboard_convs_url = this.DASHBOARD_URL + this.project_id + '/wsrequests'
    this.dashboard_contacts_url = this.DASHBOARD_URL + this.project_id + '/contacts'
    this.dashboard_app_url = this.DASHBOARD_URL + this.project_id + '/app-store'
    this.dashboard_analytics_url = this.DASHBOARD_URL + this.project_id + '/analytics'
    this.dashboard_activities_url = this.DASHBOARD_URL + this.project_id + '/activities'
    this.dashboard_history_url = this.DASHBOARD_URL + this.project_id + '/history'
    this.dashboard_settings_url = ''
    if (USER_ROLE !== 'agent') {
      this.dashboard_settings_url = this.DASHBOARD_URL + this.project_id + '/widget-set-up'
    } else if (USER_ROLE === 'agent') {
      this.dashboard_settings_url = this.DASHBOARD_URL + this.project_id + '/cannedresponses'
    }
    this.tiledesk_url = 'https://www.tiledesk.com'

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
    this.isVisibleAPP = getOSCode("APP", this.public_Key);
    this.isVisibleMON = getOSCode("MON", this.public_Key);
    this.isVisibleCNT = getOSCode("CNT", this.public_Key);
    this.isVisibleKNB = getOSCode("KNB", this.public_Key);
    
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

  goToHome() {
    let url = this.DASHBOARD_URL + this.project_id + '/home'
    this.dashboard_home_url = url;
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToBots() {
    let url = this.DASHBOARD_URL + this.project_id + '/bots/my-chatbots/all'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToConversations() {
    let url = this.DASHBOARD_URL + this.project_id + '/wsrequests'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToContacts() {
    let url = this.DASHBOARD_URL + this.project_id + '/contacts'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToAppStore() {
    let url = this.DASHBOARD_URL + this.project_id + '/app-store'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToAnalytics() {
    let url = this.DASHBOARD_URL + this.project_id + '/analytics'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToActivities() {
    let url = this.DASHBOARD_URL + this.project_id + '/activities'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToHistory() {
    let url = this.DASHBOARD_URL + this.project_id + '/history'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToWidgetSetUpOrToCannedResponses() {
    if (this.USER_ROLE !== 'agent') {
      this.goToWidgetSetUp()
    } else if (this.USER_ROLE === 'agent') {
      this.goToSettings_CannedResponses()
    }
  }

  goToWidgetSetUp() {
    let url = this.DASHBOARD_URL + this.project_id + '/widget-set-up'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToSettings_CannedResponses() {
    let url = this.DASHBOARD_URL + this.project_id + '/cannedresponses'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }



  public translations() {
    const keys = [
      'LABEL_AVAILABLE',
      'LABEL_NOT_AVAILABLE',
      'LABEL_BUSY',
      'VIEW_ALL_CONVERSATIONS',
      'CONVERSATIONS_IN_QUEUE',
      'CONVERSATION_IN_QUEUE',
      'NO_CONVERSATION_IN_QUEUE',
      'PINNED_PROJECT',
      'CHANGE_PINNED_PROJECT',
      "CHANGE_TO_YOUR_STATUS_TO_AVAILABLE",
      "CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE"
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }


  changeAvailabilityState(IS_AVAILABLE) {

  }













}




