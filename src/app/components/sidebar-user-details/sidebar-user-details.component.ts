import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { skip } from 'rxjs/operators';
import { AppConfigProvider } from 'src/app/services/app-config';
import { EventsService } from 'src/app/services/events-service';
import { tranlatedLanguage } from '../../../chat21-core/utils/constants';
import { avatarPlaceholder, getColorBck } from 'src/chat21-core/utils/utils-user';
import { environment } from 'src/environments/environment';
import { Project } from 'src/chat21-core/models/projects';
import { BRAND_BASE_INFO } from 'src/app/utils/utils-resources';
import { getOSCode } from 'src/app/utils/utils';
@Component({
  selector: 'app-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss'],
})
export class SidebarUserDetailsComponent implements OnInit, OnChanges {
  // HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
  // @Output() onCloseUserDetailsSidebar = new EventEmitter();


  public browserLang: string;
  private logger: LoggerService = LoggerInstance.getInstance()
  chat_lang: string
  flag_url: string;
  photo_profile_URL: string;
  IS_BUSY: boolean;
  IS_AVAILABLE: boolean;
  USER_ROLE: boolean;
  USER_ROLE_LABEL: string;
  profile_name_translated: string;
  SubscriptionPaymentProblem: string;
  user: any
  tiledeskToken: string;
  // project: { _id: string, name: string, type: string, isActiveSubscription: boolean, plan_name: string}
  project: Project;
  _prjct_profile_name: string;

  isVisiblePAY: boolean;
  public_Key: any
  USER_PHOTO_PROFILE_EXIST: boolean = false;
  version: string
  company_name: string = 'Tiledesk'
  DASHBOARD_URL: string;

  selectedStatus: any;
  teammateStatus = [
    { id: 1, name: 'Available', avatar: 'assets/images/teammate-status/avaible.svg', label: "LABEL_AVAILABLE" },
    { id: 2, name: 'Unavailable', avatar: 'assets/images/teammate-status/unavaible.svg', label: "LABEL_NOT_AVAILABLE" },
    { id: 3, name: 'Inactive', avatar: 'assets/images/teammate-status/inactive.svg', label: "LABEL_INACTIVE" },
  ];

  translationsMap: Map<string, string> = new Map();

  docEnabled: boolean = true;
  BRAND_BASE_INFO = BRAND_BASE_INFO;
  
  constructor(
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public imageRepoService: ImageRepoService,
    public appStorageService: AppStorageService,
    private messagingAuthService: MessagingAuthService,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
    public events: EventsService,
    private eRef: ElementRef,

  ) { }

  ngOnInit() {
    this.DASHBOARD_URL = this.appConfigProvider.getConfig().dashboardUrl + '#/project/';
    this.version = environment.version;
    this.subcribeToAuthStateChanged();
    this.listenTocurrentProjectUserUserAvailability$();
    this.listenToCurrentStoredProject();
    this.getOSCODE();
  }

  ngOnChanges() {  }

  subcribeToAuthStateChanged() {
    this.messagingAuthService.BSAuthStateChanged.subscribe((state) => {
     this.logger.log('[SIDEBAR-USER-DETAILS] BSAuthStateChanged ', state)

      if (state === 'online') {
        const storedCurrentUser = this.appStorageService.getItem('currentUser')
        if (storedCurrentUser && storedCurrentUser !== 'undefined') {
          const currentUser = JSON.parse(storedCurrentUser);
          this.logger.log('[SIDEBAR-USER-DETAILS] - subcribeToAuthStateChanged - currentUser ', currentUser)
          if (currentUser) {
            this.user = currentUser
            this.createUserAvatar(this.user);
            this.getCurrentChatLangAndTranslateLabels(this.user);
            this.photo_profile_URL = this.imageRepoService.getImagePhotoUrl(this.user.uid)
            this.logger.log('[SIDEBAR-USER-DETAILS] photo_profile_URL ', this.photo_profile_URL);
            this.checkIfExistPhotoProfile(this.photo_profile_URL)
          }
        } else {
          this.logger.error('[SIDEBAR-USER-DETAILS] currentUser not found in storage ')
        }
      }
    })
  }

  checkIfExistPhotoProfile(imageUrl) {
    this.verifyImageURL(imageUrl, (imageExists) => {
      
      if (imageExists === true) {
        this.USER_PHOTO_PROFILE_EXIST = true;
        this.logger.log('[SIDEBAR-USER-DETAILS] photo_profile_URL IMAGE EXIST ', imageExists)

      } else {
        this.USER_PHOTO_PROFILE_EXIST = false;
        this.logger.log('[SIDEBAR-USER-DETAILS] photo_profile_URL IMAGE EXIST ', imageExists)
      }
    })
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

  // listenOpenUserSidebarEvent() {
  //   this.events.subscribe('userdetailsidebar:opened', (openUserDetailsSidebar) => {
  //     this.logger.log('[SIDEBAR-USER-DETAILS] - listenOpenUserSidebarEvent - openUserDetailsSidebar', openUserDetailsSidebar);
  //   this.HAS_CLICKED_OPEN_USER_DETAIL = true;
  //   });
  // }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    // this.logger.log('[SIDEBAR-USER-DETAILSS-CHAT] clickout event.target)', event.target)
    const clicked_element_id = event.target.id
    if (this.eRef.nativeElement.contains(event.target)) {
      // this.logger.log('[SIDEBAR-USER-DETAILS] clicked inside')
    } else {
      if (!clicked_element_id.startsWith("sidebaravatar")) {
        this.closeUserDetailSidePanel();
      }
      // this.logger.log('[SIDEBAR-USER-DETAILS] clicked outside')

    }
  }

  closeUserDetailSidePanel() {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    // this.logger.log('[SIDEBAR-USER-DETAILS] element', element);
  }


  getCurrentChatLangAndTranslateLabels(currentUser) {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[SIDEBAR-USER-DETAILS] - ngOnInit - currentUser ', currentUser)
    this.logger.log('[SIDEBAR-USER-DETAILS] - ngOnInit - browserLang ', this.browserLang)

    const stored_preferred_lang = localStorage.getItem(currentUser.uid + '_lang');
    this.logger.log('[SIDEBAR-USER-DETAILS] stored_preferred_lang: ', stored_preferred_lang);


    this.chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      this.chat_lang = this.browserLang
      // this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"

      this.logger.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      this.logger.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    } else if (this.browserLang && stored_preferred_lang) {
      this.chat_lang = stored_preferred_lang
      // this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"
      this.logger.log('[SIDEBAR-USER-DETAILS] flag_url: ', this.flag_url);
      this.logger.log('[SIDEBAR-USER-DETAILS] chat_lang: ', this.chat_lang);
    }

    if (tranlatedLanguage.includes(this.chat_lang)) {
      this.logger.log('[SIDEBAR-USER-DETAILS] tranlatedLanguage includes', this.chat_lang, ': ', tranlatedLanguage.includes(this.chat_lang))
      this.translate.use(this.chat_lang);
      this.flag_url = "assets/images/language_flag/" + this.chat_lang + ".png"
    } else {
      this.logger.log('[SIDEBAR-USER-DETAILS] tranlatedLanguage includes', this.chat_lang, ': ', tranlatedLanguage.includes(this.chat_lang))
      this.translate.use('en');
      this.flag_url = "assets/images/language_flag/en.png"
      this.chat_lang = 'en'
    }

    this.translateLabels()
  }

  translateLabels() {
    let keys= [
      'EditProfile',
      'LABEL_BUSY',
      'LABEL_LOGOUT',
      'SubscriptionPaymentProblem',
      'ThePlanHasExpired',
      "LABEL_AVAILABLE",
      "LABEL_NOT_AVAILABLE",
      "LABEL_INACTIVE"
    ]

    this.translate.get(keys).subscribe((text: string) => {

      this.translationsMap.set('LABEL_AVAILABLE',text['LABEL_AVAILABLE'])
                          .set('LABEL_NOT_AVAILABLE', text['LABEL_NOT_AVAILABLE'] )
                          .set('LABEL_INACTIVE', text['LABEL_INACTIVE'])
                          .set('EditProfile', text['EditProfile'])
                          .set('LABEL_BUSY', text['LABEL_BUSY'])
                          .set('LABEL_LOGOUT', text['LABEL_LOGOUT'])
                          .set('SubscriptionPaymentProblem', text['SubscriptionPaymentProblem'])
                          .set('ThePlanHasExpired', text['ThePlanHasExpired'])

      this.teammateStatus.forEach(element => {
        element.label = this.translationsMap.get(element.label)
      });
      
    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[SIDEBAR-USER-DETAILS] AppConfigService getAppConfig public_Key', this.public_Key);
    this.logger.log('[SIDEBAR-USER-DETAILS] AppConfigService getAppConfig', this.appConfigProvider.getConfig());
    
    this.isVisiblePAY = getOSCode("PAY", this.public_Key);
  }

  listenToCurrentStoredProject() {
    this.events.subscribe('storage:last_project', projectObjct => {
      if (projectObjct && projectObjct !== 'undefined') {
        // this.logger.log('[SIDEBAR-USER-DETAILS] - GET STORED PROJECT ', projectObjct)

        //TODO: recuperare info da root e non da id_project
        this.project = {
          _id: projectObjct['id_project']['_id'],
          name: projectObjct['id_project']['name'],
          profile: projectObjct['id_project']['profile'],
          isActiveSubscription: projectObjct['id_project']['isActiveSubscription'],
          trialExpired: projectObjct['id_project']['trialExpired']
        }
      
        if (this.project.profile.type === 'free') {

          if (this.project.trialExpired === false) {
            this.getProPlanTrialTranslation();
          } else if (this.project.trialExpired === true) {
            this.getFreePlanTranslation();
          }
        } else if (this.project.profile.type === 'payment' && this.project.profile.name === 'pro') {
          this.getProPlanTranslation();
        } else if (this.project.profile.type === 'payment' && this.project.profile.name === 'enterprise') {
          this.getEnterprisePlanTranslation();
        }
      }
    })

    try {
      this.tiledeskToken = this.appStorageService.getItem('tiledeskToken');
      // this.logger.log('[SIDEBAR-USER-DETAILS] - GET STORED TOKEN ', this.tiledeskToken)
    } catch (err) {
      this.logger.error('[SIDEBAR-USER-DETAILS] - GET STORED TOKEN ', err)
    }
  }


  getProPlanTrialTranslation() {
    this.translate.get('ProPlanTrial').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  getFreePlanTranslation() {
    this.translate.get('FreePlan').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  getProPlanTranslation() {
    this.translate.get('PaydPlanNamePro').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  getEnterprisePlanTranslation() {
    this.translate.get('PaydPlanNameEnterprise').subscribe((text: string) => {
        this.profile_name_translated = text
      });
  }

  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$.pipe(skip(1)).subscribe((projectUser) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

        if (projectUser) {
          if (projectUser['user_available'] === false && projectUser['profileStatus'] === 'inactive') {
            // this.logger.log('teammateStatus ', this.teammateStatus) 
            this.selectedStatus = this.teammateStatus[2].id;
            this.logger.debug('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[2].name);
            this.teammateStatus = this.teammateStatus.slice(0)
          } else if (projectUser['user_available'] === false && (projectUser['profileStatus'] === '' || !projectUser['profileStatus'])) {
            this.selectedStatus = this.teammateStatus[1].id;
            this.logger.debug('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[1].name);
            this.teammateStatus = this.teammateStatus.slice(0)
          } else if (projectUser['user_available'] === true && (projectUser['profileStatus'] === '' || !projectUser['profileStatus'])) {
            this.selectedStatus = this.teammateStatus[0].id
            this.teammateStatus = this.teammateStatus.slice(0)
            this.logger.debug('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[0].name);
          }
          this.IS_BUSY = projectUser['isBusy']
          this.USER_ROLE = projectUser['role']
          this.translateUserRole(this.USER_ROLE)
        }

      }, (error) => {
        this.logger.error('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }

  translateUserRole(role) {
    this.translate.get(role).subscribe((text: string) => {
        this.USER_ROLE_LABEL = text
    });
  }

  changeAvailabilityStateInUserDetailsSidebar(selectedStatusID) {
    this.logger.log('[SIDEBAR-USER-DETAILS] - changeAvailabilityState projectid', this.project._id, ' available 1: ', selectedStatusID);
    
    let IS_AVAILABLE = null
    let profilestatus = ''
    if (selectedStatusID === 1) {
      IS_AVAILABLE = true
    } else if (selectedStatusID === 2) {
      IS_AVAILABLE = false
    } else if (selectedStatusID === 3) {
      IS_AVAILABLE = false
      profilestatus = 'inactive'
    }

    this.wsService.updateCurrentUserAvailability(this.tiledeskToken, this.project._id, IS_AVAILABLE, profilestatus).subscribe((projectUser: any) => {

        this.logger.log('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED ', projectUser)

      }, (error) => {
        this.logger.error('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED - ERROR  ', error);

      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - PROJECT-USER UPDATED  * COMPLETE *');

      });
  }

  goToUserProfile() {
    let url = this.DASHBOARD_URL + this.project._id + '/user-profile'
    const myWindow = window.open(url, '_self');
    myWindow.focus();
  }

  goToHelpCenter() {
    const url = "https://gethelp.tiledesk.com/"
    window.open(url, '_blank');
  }

  public onLogout() {
    this.closeUserDetailSidePanel()
    this.events.publish('profileInfoButtonClick:logout', true);
  }


}
