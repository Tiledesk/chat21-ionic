import { environment } from 'src/environments/environment';
import { AppConfigProvider } from 'src/app/services/app-config';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';

// services
import { NavProxyService } from '../../services/nav-proxy.service';
import { ChatManager } from 'src/chat21-core/providers/chat-manager';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
// import { EventsService } from '../../services/events-service';

// models
import { UserModel } from 'src/chat21-core/models/user';

// utils
import { EventsService } from 'src/app/services/events-service';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { checkPlatformIsMobile, setLastDateWithLabels } from 'src/chat21-core/utils/utils';
import { Project } from 'src/chat21-core/models/projects';
import { getOSCode } from 'src/app/utils/utils';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.page.html',
  styleUrls: ['./profile-info.page.scss'],
})
export class ProfileInfoPage implements OnInit {
  
  loggedUser: UserModel;
  version: string;
  itemAvatar: any;

  public translationsMap: Map<string, string>;
  private logger: LoggerService = LoggerInstance.getInstance();

  isMobile: boolean = false;
  private subscriptions = [];
  borderColor = '#2d323e';
  fontColor = '#949494';
  
  @Input() selectedStatus: number;
  @Input() profile_name_translated: string;
  @Input() token: string;
  @Input() project: Project;

  isVisiblePAY: boolean;
  teammateStatus = [
    { id: 1, name: 'Available', avatar: 'assets/images/teammate-status/avaible.svg', label: "LABEL_AVAILABLE" },
    { id: 2, name: 'Unavailable', avatar: 'assets/images/teammate-status/unavaible.svg', label: "LABEL_NOT_AVAILABLE" },
    { id: 3, name: 'Inactive', avatar: 'assets/images/teammate-status/inactive.svg', label: "LABEL_INACTIVE" },
  ];

  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    private chatManager: ChatManager,
    private translateService: CustomTranslateService,
    public presenceService: PresenceService,
    public events: EventsService,
    private imageRepo: ImageRepoService,
    public renderer: Renderer2,
    public wsService: WebsocketService,
    public appConfigProvider: AppConfigProvider,
  ) { }

  /** */
  ngOnInit() {
    this.version = environment.version;
    this.translations();

    if (checkPlatformIsMobile()) {
      this.isMobile = true
      // this.openInfoConversation = false; // indica se è aperto il box info conversazione
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
    } else {
      this.isMobile = false
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
      // this.openInfoConversation = true;
    }
    
  }

  /** */
  ionViewDidEnter() {
    this.initialize();
  }

  /** */
  ionViewWillLeave() {
    this.unsubescribeAll();
  }

  /** */
  initialize() {
    this.setUser();
    this.getOSCODE();
    this.setSubscriptions();
  }

  /** */
  private setUser() {
    // width and height NON sono obbligatori
    this.loggedUser = this.chatManager.getCurrentUser();
    if (this.loggedUser) {
      this.itemAvatar = {
        imageurl: this.imageRepo.getImagePhotoUrl(this.loggedUser.uid),
        avatar: this.loggedUser.avatar,
        color: this.loggedUser.color,
        online: this.loggedUser.online,
        lastConnection: this.loggedUser.lastConnection,
        status: '',
        width: '100px',
        height: '100px'
      };
    }
  }


  /** */
  public translations() {
    const keys = [
      'LABEL_AVAILABLE',
      'LABEL_NOT_AVAILABLE',
      'LABEL_INACTIVE',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_TO',
      'LABEL_LAST_ACCESS',
      'ARRAY_DAYS',
      'LABEL_IS_WRITING',
      'LABEL_LOGOUT'

    ];
    this.translationsMap = this.translateService.translateLanguage(keys);

    this.teammateStatus.forEach(element => {
      element.label = this.translationsMap.get(element.label)
    });
  }


  /** */
  private setSubscriptions() {
    this.presenceService.userIsOnline(this.loggedUser.uid);
    this.presenceService.lastOnlineForUser(this.loggedUser.uid);


    const subscribeBSIsOnline = this.presenceService.BSIsOnline.subscribe((data: any) => {
      this.logger.log('[PROFILE-INFO-PAGE] setSubscriptions $ubscribe to BSIsOnline - data', data);
      if (data) {
        const userId = data.uid;
        const isOnline = data.isOnline;
        if (this.loggedUser.uid === userId) {
          this.userIsOnLine(userId, isOnline);
        }
      }
    });

    const subscribeBSLastOnline = this.presenceService.BSLastOnline.subscribe((data: any) => {
      this.logger.log('[PROFILE-INFO-PAGE] setSubscriptions $ubscribe to BSLastOnline - data', data);
      if (data) {
        const userId = data.uid;
        const timestamp = data.lastOnline;
        if (this.loggedUser.uid === userId) {
          this.userLastConnection(userId, timestamp);
        }
      }
    });


  }


  userIsOnLine = (userId: string, isOnline: boolean) => {
    this.logger.log('[PROFILE-INFO-PAGE] userIsOnLine - userId ', userId, ' - isOnline ', isOnline);
    this.itemAvatar.online = isOnline;
    if (isOnline) {
      this.itemAvatar.status = this.translationsMap.get('LABEL_AVAILABLE');
    } else {
      this.itemAvatar.status = this.translationsMap.get('LABEL_NOT_AVAILABLE');
    }
  }


  userLastConnection = (userId: string, timestamp: string) => {
    this.logger.log('[PROFILE-INFO-PAGE] userLastConnection - userId ', userId, ' - timestamp ', timestamp);
    if (timestamp && timestamp !== '') {
      const lastConnectionDate = setLastDateWithLabels(this.translationsMap, timestamp);
      this.itemAvatar.lastConnection = lastConnectionDate;
      if (!this.itemAvatar.online) {
        this.itemAvatar.status = lastConnectionDate;
      }
    }
  }

  onClickArchivedConversation() {
    this.onClose().then(() => {
      this.events.publish('profileInfoButtonClick:changed', 'displayArchived');
    })
  }


  /** */
  private unsubescribeAll() {
    this.logger.log('unsubescribeAll: ', this.subscriptions);
    this.subscriptions.forEach((subscription: any) => {
      this.logger.log('unsubescribe: ', subscription);
      // this.events.unsubscribe(subscription, null);
    });
    this.subscriptions = [];
  }

  /** */
  async onClose() {
    const isModalOpened = await this.modalController.getTop();
    if (isModalOpened) {
      this.modalController.dismiss({ confirmed: true });
    } else {
      this.navService.pop();
    }
  }

  /** */
  public onLogout() {
    // this.authService.logout();
    this.onClose()
    // pubblico evento
    this.events.publish('profileInfoButtonClick:logout', true);
  }

  changeAvailabilityStateInUserDetailsSidebar(selectedStatusID) {
    this.logger.log('[PROFILE-INFO-PAGE] - changeAvailabilityState projectid', this.project._id, ' available 1: ', selectedStatusID);
    
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

    this.wsService.updateCurrentUserAvailability(this.token, this.project._id, IS_AVAILABLE, profilestatus).subscribe((projectUser: any) => {

        this.logger.log('[PROFILE-INFO-PAGE] - PROJECT-USER UPDATED ', projectUser)

      }, (error) => {
        this.logger.error('[PROFILE-INFO-PAGE] - PROJECT-USER UPDATED - ERROR  ', error);

      }, () => {
        this.logger.log('[PROFILE-INFO-PAGE] - PROJECT-USER UPDATED  * COMPLETE *');

    });

  }

  getOSCODE() {
    let public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[PROFILE-INFO-PAGE] AppConfigService getAppConfig public_Key', public_Key);
    this.isVisiblePAY = getOSCode("PAY", public_Key);
  }

  copyLoggedUserUID() {

    if(!this.isMobile){
      var copyText = document.createElement("input");
      copyText.setAttribute("type", "text");
      copyText.setAttribute("value", this.loggedUser.uid);

      document.body.appendChild(copyText);
      copyText.select();
      copyText.setSelectionRange(0, 99999); /*For mobile devices*/
      document.execCommand("copy");
      this.logger.log("Copied the text: " + copyText.value);
      const tootipElem = <HTMLElement>document.querySelector('.chat-tooltip');
      this.renderer.appendChild(tootipElem, this.renderer.createText('Copied!'))
    }else{
      navigator.clipboard.writeText(this.loggedUser.uid)
    }
    
  }
}
