import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service'
import { Component, isDevMode, OnInit, ViewChild } from '@angular/core'
import { IonContent, ModalController } from '@ionic/angular'
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router'
// config
import { environment } from '../../../environments/environment'

// models
import { ConversationModel } from 'src/chat21-core/models/conversation'
import { UserModel } from 'src/chat21-core/models/user'

// utils
import {
  isInArray,
  checkPlatformIsMobile,
  presentModal,
  closeModal,
  convertMessage,
  isGroup,
  getParameterValue,
  getDateDifference,
} from '../../../chat21-core/utils/utils'

import { EventsService } from '../../services/events-service'

// services
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service'
import { ChatManager } from 'src/chat21-core/providers/chat-manager'
import { NavProxyService } from '../../services/nav-proxy.service'
import { TiledeskService } from '../../services/tiledesk/tiledesk.service'
import { ConversationDetailPage } from '../conversation-detail/conversation-detail.page'
import { ContactsDirectoryPage } from '../contacts-directory/contacts-directory.page'
import { UnassignedConversationsPage } from '../unassigned-conversations/unassigned-conversations.page'
import { ProfileInfoPage } from '../profile-info/profile-info.page'
import { MessagingAuthService } from 'src/chat21-core/providers/abstract/messagingAuth.service'
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service'
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service'
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service'
import { AppConfigProvider } from '../../services/app-config'
import { Subscription } from 'rxjs'
import { Platform } from '@ionic/angular'
// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service'
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance'
import { NetworkService } from 'src/app/services/network-service/network.service'
import { Subject } from 'rxjs'
import { skip, takeUntil } from 'rxjs/operators'
import { REQUEST_ARCHIVED, TYPE_DIRECT } from 'src/chat21-core/utils/constants';
import { getProjectIdSelectedConversation } from 'src/chat21-core/utils/utils-message';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { Globals } from 'src/app/utils/globals';
import { TriggerEvents } from 'src/app/services/triggerEvents/triggerEvents';
import { MessageModel } from 'src/chat21-core/models/message';
import { Project } from 'src/chat21-core/models/projects';

@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.page.html',
  styleUrls: ['./conversations-list.page.scss'],
})
export class ConversationListPage implements OnInit {
  @ViewChild('ioncontentconvlist', { static: false })
  ionContentConvList: IonContent

  private unsubscribe$: Subject<any> = new Subject<any>()
  private subscriptions: Array<string>
  public tenant: string
  public loggedUserUid: string
  public conversations: Array<ConversationModel> = []
  public archivedConversations: Array<ConversationModel> = []
  public unassignedConversations: Array<ConversationModel> = []
  public uidConvSelected: string
  public conversationSelected: ConversationModel
  public uidReciverFromUrl: string
  public showPlaceholder = true
  public numberOpenConv = 0
  public loadingIsActive = true
  public supportMode: boolean
  public writeto_btn: boolean
  public archived_btn: boolean
  public sound_btn: string
  public convertMessage = convertMessage
  private isShowMenuPage = false
  private logger: LoggerService = LoggerInstance.getInstance()
  translationMapConversation: Map<string, string>
  translationMapHeader: Map<string, string>
  stylesMap: Map<string, string>

  public conversationType = 'active'
  headerTitle: string
  subscription: Subscription

  public UNASSIGNED_CONVS_URL: any
  public PROJECTS_FOR_PANEL_URL: any
  public IFRAME_URL: any
  public hasClickedOpenUnservedConvIframe: boolean = false
  public lastProjectId: string
  public displayNewConvsItem: boolean = true
  public archiveActionNotAllowed: boolean = false

  public isMobile: boolean = false;
  public isInitialized: boolean = false;

  // PROJECT AVAILABILITY INFO: start
  project: Project
  profile_name_translated: string;
  selectedStatus: any;
  teammateStatus = [
    { id: 1, name: 'Available', avatar: 'assets/images/teammate-status/avaible.svg', label: "LABEL_AVAILABLE" },
    { id: 2, name: 'Unavailable', avatar: 'assets/images/teammate-status/unavaible.svg', label: "LABEL_NOT_AVAILABLE" },
    { id: 3, name: 'Inactive', avatar: 'assets/images/teammate-status/inactive.svg', label: "LABEL_INACTIVE" },
  ];
  // PROJECT AVAILABILITY INFO: end

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavProxyService,
    public events: EventsService,
    public modalController: ModalController,
    // public databaseProvider: DatabaseProvider,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public chatManager: ChatManager,
    public messagingAuthService: MessagingAuthService,
    public imageRepoService: ImageRepoService,
    private translateService: CustomTranslateService,
    public tiledeskService: TiledeskService,
    public tiledeskAuthService: TiledeskAuthService,
    public appConfigProvider: AppConfigProvider,
    public platform: Platform,
    public wsService: WebsocketService,
    private g: Globals,
  ) {
    this.checkPlatform();
    this.translations();
    this.listenToAppCompConvsLengthOnInitConvs()
    this.listenToAppIsInitialized()
    this.listenToLogoutEvent()
    this.listenGoOnline()
    this.listenGoOffline()
    this.listenToStorageChange()
    this.listenToSwPostMessage()
    this.listenSupportConvIdHasChanged()
    // this.listenDirectConvIdHasChanged();
    this.listenToCloseConvFromHeaderConversation();
    this.listenToCurrentStoredProject()
    this.listenTocurrentProjectUserUserAvailability$()
  }

  private checkPlatform(){
    if (checkPlatformIsMobile()) {
      this.isMobile = true
      this.logger.log('[CONVS-LIST-PAGE] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
    } else {
      this.isMobile = false
      this.logger.log('[CONVS-LIST-PAGE] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
    }
  }

  private translations(){
    const keysConversation = ['CLOSED', 'Resolve']
    const keysHeader = ['ProPlanTrial', 'FreePlan', 'PaydPlanNamePro', 'PaydPlanNameEnterprise']

    this.translationMapConversation = this.translateService.translateLanguage( keysConversation )
    this.translationMapHeader = this.translateService.translateLanguage( keysHeader )
    
  }

  listenSupportConvIdHasChanged() {
    this.events.subscribe('supportconvid:haschanged', (IDConv) => {
      // console.log('[CONVS-LIST-PAGE] - listen To convid:haschanged - convId', IDConv);
      if (IDConv) {
        // const conversationSelected = this.conversations.find(item => item.uid === convId);
        // this.onConversationSelected(conversationSelected)
        this.setUidConvSelected(IDConv, 'active')
      }
      if (!IDConv) {
        this.logger.log('[CONVS-LIST-PAGE] - listen To convid:haschanged - is the page without conv select',)

        const chatTabCount = +localStorage.getItem('tabCount')
        this.logger.log('[CONVS-LIST-PAGE] - listen To convid:haschanged - chatTabCount ',chatTabCount,)
        if (chatTabCount && chatTabCount > 0) {
          this.logger.log('[CONVS-LIST-PAGE] - listen To convid:haschanged - the chat is already open ',chatTabCount)
          if (checkPlatformIsMobile()) {
            this.logger.log('[CONVS-LIST-PAGE] - the chat is in mobile mode ',checkPlatformIsMobile())
            this.events.publish('noparams:mobile', true)
          }
        }
      }
    })
  }

  // listenDirectConvIdHasChanged() {
  //   this.events.subscribe('directconvid:haschanged', (contact_id) => {
  //     // console.log('[CONVS-LIST-PAGE] - listen To directconvid:haschanged - contact_id', contact_id);
  //     if (contact_id) {
  //       this.uidConvSelected = contact_id
  //     }
  //   });
  // }

  // -----------------------------------------------
  // @ Lifehooks
  // -----------------------------------------------
  ngOnInit() {
    this.getAppConfigToHideDiplayBtns()
    
  }

  ngOnChanges() {
    this.getConversationListHeight()
  }

  getConversationListHeight() {
    var scrollbar2element = document.getElementById('scrollbar2')
    this.logger.log('[CONVS-LIST-PAGE] getConversationListHeight scrollbar2element', scrollbar2element)
  }

  getAppConfigToHideDiplayBtns() {
    const appConfig = this.appConfigProvider.getConfig()
    // console.log('[CONVS-LIST-PAGE] - appConfig ', appConfig)
    this.supportMode = this.g.supportMode;
    this.archived_btn =  getParameterValue('archivedButton', appConfig)
    this.writeto_btn =  getParameterValue('writeToButton', appConfig)
    this.logger.debug('[CONVS-LIST-PAGE] parameters supportMode/archived_btn/writeto_btn', this.supportMode, this.archived_btn, this.writeto_btn)


    const sound_status = localStorage.getItem('dshbrd----sound')
    if(sound_status && sound_status !== 'undefined'){
      this.sound_btn = sound_status
    } else {
      this.sound_btn = 'enabled'
    }


  }

  ionViewWillEnter() {
    this.logger.log('Called ionViewDidEnter')
    this.logger.log('[CONVS-LIST-PAGE] ionViewWillEnter uidConvSelected',this.uidConvSelected )
    this.listnerStart()
    // exit from app with hardware back button
    this.subscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp()
    })
  }

  // unsubscribe backButton.subscribe method to not use from other page
  ionViewWillLeave() {
    this.logger.log('Called ionViewWillLeave')
    this.subscription.unsubscribe()
  }

  ionViewDidEnter() { }

  getLastProjectId(projectid: string) {
    this.logger.log('[CONVS-LIST-PAGE] - GET LAST PROJECT ID', projectid)
    this.lastProjectId = projectid
  }

  openUnsevedConversationIframe(event:{event: string, data: ConversationModel[]}) {
    this.logger.log('[CONVS-LIST-PAGE] openUnsevedConversationIframe ', event)
    this.hasClickedOpenUnservedConvIframe = true
    // if(event && event.data){
    //   this.conversationType = 'unassigned'
    //   this.unassignedConversations = event.data
      
    //   const keys = ['UnassignedConversations']
    //   // const keys = ['History'];

    //   this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0])
    // }
    this.logger.log('[CONVS-LIST-PAGE] - HAS CLIKED OPEN UNSERVED REQUEST IFRAME',this.hasClickedOpenUnservedConvIframe )
    const DASHBOARD_BASE_URL = this.appConfigProvider.getConfig().dashboardUrl
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
    // http://localhost:4204/#/projects-for-panel
    this.PROJECTS_FOR_PANEL_URL = DASHBOARD_BASE_URL + '#/projects-for-panel'
    this.UNASSIGNED_CONVS_URL = DASHBOARD_BASE_URL + '#/project/' + this.lastProjectId + '/unserved-request-for-panel'

    if (event.event === 'pinbtn') {
      this.IFRAME_URL = this.PROJECTS_FOR_PANEL_URL + '?token='+ tiledeskToken
    } else {
      this.IFRAME_URL = this.UNASSIGNED_CONVS_URL + '?token='+ tiledeskToken
    }
    this.logger.log('[CONVS-LIST-PAGE] - HAS CLIKED OPEN UNSERVED REQUEST IFRAME > UNASSIGNED CONVS URL',this.UNASSIGNED_CONVS_URL )
    this.openUnassignedConversations(this.IFRAME_URL, event)


  }

  // ---------------------------------------------------------
  // Opens the Unassigned Conversations iframe
  // ---------------------------------------------------------
  openUnassignedConversations(IFRAME_URL: string, event) {
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, UnassignedConversationsPage, {
        iframe_URL: IFRAME_URL,
        callerBtn: event,
      })
    } else {
      this.navService.push(UnassignedConversationsPage, {
        iframe_URL: IFRAME_URL,
        callerBtn: event,
      })
    }
  }

  _closeContactsDirectory() {
    try {
      closeModal(this.modalController)
    } catch (err) {
      this.logger.error( '[CONVS-LIST-PAGE] closeContactsDirectory -> error:', err)
    }
  }

  listenToSwPostMessage() {
    this.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick - CALLED: ')
    const that = this
    if (navigator && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', function (event) {
        that.logger.log('[CONVS-LIST-PAGE] FIREBASE-NOTIFICATION  listenToNotificationCLick - Received a message from service worker event data: ', event.data)
        that.logger.log('[CONVS-LIST-PAGE] FIREBASE-NOTIFICATION  listenToNotificationCLick - Received a message from service worker event data data: ', event.data['data'] )
        that.logger.log('[CONVS-LIST-PAGE] FIREBASE-NOTIFICATION  listenToNotificationCLick - Received a message from service worker event data data typeof: ', typeof event.data['data'] )
        let uidConvSelected = ''
        if (event.data && event.data['conversWith']) {
          uidConvSelected = event.data['conversWith']
        } else {
          that.logger.log('[CONVS-LIST-PAGE] FIREBASE-NOTIFICATION  listenToNotificationCLick - DIFFERENT MSG',)
          return
        }

        that.logger.log('[CONVS-LIST-PAGE] FIREBASE-NOTIFICATION  listenToNotificationCLick - Received a message from service worker event dataObjct uidConvSelected: ', uidConvSelected )
        that.logger.log('[CONVS-LIST-PAGE] FIREBASE-NOTIFICATION  listenToNotificationCLick - Received a message from service worker that.conversations: ', that.conversations)
        const conversationSelected = that.conversations.find((item) => item.uid === uidConvSelected)
        if (conversationSelected) {
          that.conversationSelected = conversationSelected
          that.logger.log('[CONVS-LIST-PAGE] listenToNotificationCLick- Received a message from service worker event conversationSelected: ', that.conversationSelected )
          that.navigateByUrl('active', uidConvSelected)
        }
      })
    }
  }

  private listnerStart() {
    const that = this
    this.chatManager.BSStart.pipe(takeUntil(that.unsubscribe$)).subscribe((data: any) => {
        this.logger.log('[CONVS-LIST-PAGE] - BSStart SUBSCR DATA - Current user *****', data)
        if (data) {
          that.initialize()
        }
    },(error) => {
        this.logger.error('[CONVS-LIST-PAGE] - BSStart SUBSCR - ERROR: ', error)
    },() => {
        this.logger.log('[CONVS-LIST-PAGE] - BSStart SUBSCR * COMPLETE *')
    })
  }

  

  // ------------------------------------------------------------------ //
  // Init convrsation handler
  // ------------------------------------------------------------------ //
  initConversationsHandler() {
    // this.conversations = this.manageStoredConversations()
    // this.manageStoredConversations()
    this.conversations = this.conversationsHandlerService.conversations
    this.logger.log('[CONVS-LIST-PAGE] - CONVERSATIONS ', this.conversations.length, this.conversations)
    // save conversationHandler in chatManager
    this.chatManager.setConversationsHandler(this.conversationsHandlerService)
    this.showPlaceholder = false
  }

  // private manageStoredConversations() {
  //   let conversationsStored = []
  //   if(this.appStorageService.getItem('conversations')){
  //     conversationsStored = JSON.parse(this.appStorageService.getItem('conversations'))
  //     if(conversationsStored && conversationsStored.length > 0) {
  //       // this.conversationsHandlerService.conversations = conversationsStored
  //       this.logger.log('[CONVS-LIST-PAGE] retrive conversations from storage --> ', conversationsStored.length)
  //       this.events.publish('appcompSubscribeToConvs:loadingIsActive', false);
  //       this.conversations.push(...conversationsStored)
  //     }
  //   }
  //   // this.conversations = this.conversationsHandlerService.conversations
  // }

  initArchivedConversationsHandler() {
    
    this.archivedConversationsHandlerService.subscribeToConversations(() => {
      this.logger.log('[CONVS-LIST-PAGE]-CONVS - conversations archived length ',this.archivedConversations.length)
    })

    this.archivedConversations = this.archivedConversationsHandlerService.archivedConversations
    this.logger.log('[CONVS-LIST-PAGE] archived conversation',this.archivedConversations )

    // save archivedConversationsHandlerService in chatManager
    this.chatManager.setArchivedConversationsHandler(
      this.archivedConversationsHandlerService,
    )

    this.logger.log('[CONVS-LIST-PAGE]-CONVS SubscribeToConversations - conversations archived length ', this.archivedConversations.length )
    if (!this.archivedConversations || this.archivedConversations.length === 0 ) {
      this.loadingIsActive = false
    }
  }

  // ----------------------------------------------------------------------------------------------------
  // To display "No conversation yet" MESSAGE in conversazion list
  // this.loadingIsActive is set to false only if on init there are not conversation
  // otherwise loadingIsActive remains set to true and the message "No conversation yet" is not displayed
  // to fix this
  // - for the direct conversation
  // ----------------------------------------------------------------------------------------------------
  listenToAppCompConvsLengthOnInitConvs() {
    this.events.subscribe( 'appcompSubscribeToConvs:loadingIsActive', (loadingIsActive) => {
      this.logger.log( '[CONVS-LIST-PAGE]-CONVS loadingIsActive', loadingIsActive)
      if (loadingIsActive === false) {
        this.loadingIsActive = false
      }
    })
  }

  listenToAppIsInitialized(){
    this.events.subscribe( 'appComp:appIsInitialized', (isInitialized) => {
      this.logger.log( '[CONVS-LIST-PAGE]-CONVS isInitialized', isInitialized)
      this.isInitialized = isInitialized
    })
  }

  listenGoOnline() {
    this.events.subscribe('go:online', (goonline) => {
      this.logger.info('[CONVS-LIST-PAGE] - listen To go:online - goonline',goonline)
      // this.events.unsubscribe('profileInfoButtonClick:logout')
      if (goonline === true) {
        this.displayNewConvsItem = true
      }
    })
  }

  listenGoOffline() {
    this.events.subscribe('go:offline', (offline) => {
      this.logger.info('[CONVS-LIST-PAGE] - listen To go:offline - offline',offline)
      // this.events.unsubscribe('profileInfoButtonClick:logout')
      if (offline === true) {
        this.displayNewConvsItem = false
      }
    })
  }

  listenToLogoutEvent() {
    this.events.subscribe('profileInfoButtonClick:logout', (hasclickedlogout) => {
        this.logger.info('[CONVS-LIST-PAGE] - listenToLogoutEvent - hasclickedlogout',hasclickedlogout)

        this.conversations = []
        this.conversationsHandlerService.conversations = []
        this.uidConvSelected = null

        this.logger.log('[CONVS-LIST-PAGE] - listenToLogoutEvent - CONVERSATIONS ', this.conversations )
        this.logger.log('[CONVS-LIST-PAGE] - listenToLogoutEvent - uidConvSelected ', this.uidConvSelected )
        if (hasclickedlogout === true) {
          this.loadingIsActive = false
        }
    })
  }

  listenToStorageChange(){
    this.events.subscribe('storage:sound', value => this.sound_btn = value)
  }

  listenToCurrentStoredProject() {
    this.events.subscribe('storage:last_project', projectObjct => {
      if (projectObjct && projectObjct !== 'undefined') {
        // console.log('[CONVS-LIST-PAGE] - GET STORED PROJECT ', projectObjct)

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
            this.profile_name_translated = this.translationMapHeader.get('ProPlanTrial');
          } else if (this.project.trialExpired === true) {
             this.profile_name_translated = this.translationMapHeader.get('FreePlan');
          }
        } else if (this.project.profile.type === 'payment' && this.project.profile.name === 'pro') {
          this.profile_name_translated = this.translationMapHeader.get('PaydPlanNamePro');
        } else if (this.project.profile.type === 'payment' && this.project.profile.name === 'enterprise') {
          this.profile_name_translated = this.translationMapHeader.get('PaydPlanNameEnterprise');
        }
      }
    })
  }

  listenTocurrentProjectUserUserAvailability$() {
    this.wsService.currentProjectUserAvailability$.pipe(skip(1)).subscribe((projectUser) => {
        this.logger.log('[CONVS-LIST-PAGE] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

        if (projectUser) {
          if (projectUser['user_available'] === false && projectUser['profileStatus'] === 'inactive') {
            // console.log('teammateStatus ', this.teammateStatus) 
            this.selectedStatus = this.teammateStatus[2].id;
            this.logger.debug('[CONVS-LIST-PAGE] - PROFILE_STATUS selected option', this.teammateStatus[2].name);
            this.teammateStatus = this.teammateStatus.slice(0)
          } else if (projectUser['user_available'] === false && (projectUser['profileStatus'] === '' || !projectUser['profileStatus'])) {
            this.selectedStatus = this.teammateStatus[1].id;
            this.logger.debug('[CONVS-LIST-PAGE] - PROFILE_STATUS selected option', this.teammateStatus[1].name);
            this.teammateStatus = this.teammateStatus.slice(0)
          } else if (projectUser['user_available'] === true && (projectUser['profileStatus'] === '' || !projectUser['profileStatus'])) {
            this.selectedStatus = this.teammateStatus[0].id
            this.teammateStatus = this.teammateStatus.slice(0)
            this.logger.debug('[CONVS-LIST-PAGE] - PROFILE_STATUS selected option', this.teammateStatus[0].name);
          }
          // this.IS_BUSY = projectUser['isBusy']
          // this.USER_ROLE = projectUser['role']
          // this.translateUserRole(this.USER_ROLE)
        }

      }, (error) => {
        this.logger.error('[CONVS-LIST-PAGE] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[CONVS-LIST-PAGE] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }

  // ------------------------------------------------------------------
  //  SUBSCRIPTIONS
  // ------------------------------------------------------------------
  initSubscriptions() {
    this.logger.log('[CONVS-LIST-PAGE] - CALLING - initSubscriptions ')
    let key = ''

    key = 'loggedUser:logout'
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key)
      this.events.subscribe(key, this.subscribeLoggedUserLogout)
    }

    // key = 'readAllMessages';
    // if (!isInArray(key, this.subscriptions)) {
    //   this.subscriptions.push(key);
    //   this.events.subscribe(key, this.readAllMessages);
    // }

    key = 'profileInfoButtonClick:changed'
    if (!isInArray(key, this.subscriptions)) {
      this.subscriptions.push(key)
      this.events.subscribe(key, this.subscribeProfileInfoButtonClicked)
    }

    // this.conversationsHandlerService.readAllMessages.subscribe((conversationId: string) => {
    //   this.logger.log('[CONVS-LIST-PAGE] ***** readAllMessages *****', conversationId);
    //   this.readAllMessages(conversationId);
    // });

    this.conversationsHandlerService.conversationAdded.subscribe((conversation: ConversationModel) => {
        // this.logger.log('[CONVS-LIST-PAGE] ***** conversationsAdded *****', conversation);
        // that.conversationsChanged(conversations);
        if (conversation) {
          this.onImageLoaded(conversation)
          this.onConversationLoaded(conversation)
          // conversation.is_new && this.isInitialized? this.segmentNewConversationAdded(conversation) : null;
        }
    })

    this.conversationsHandlerService.conversationChanged.subscribe((conversation: ConversationModel) => {
        this.logger.log('[CONVS-LIST-PAGE] ***** subscribeConversationChanged *****', conversation);
        // that.conversationsChanged(conversations)
        if (conversation) {
          this.onImageLoaded(conversation)
          this.onConversationLoaded(conversation)
        }
    })

    this.conversationsHandlerService.conversationRemoved.subscribe((conversation: ConversationModel) => {
        this.logger.log('[CONVS-LIST-PAGE] ***** conversationsRemoved *****',conversation)
    })

    this.archivedConversationsHandlerService.archivedConversationAdded.subscribe((conversation: ConversationModel) => {
        this.logger.log('[CONVS-LIST-PAGE] ***** archivedConversationAdded *****',conversation)
        // that.conversationsChanged(conversations);
        if (conversation) {
          this.onImageLoaded(conversation)
          this.onConversationLoaded(conversation)
        }
    })
  }

  // ------------------------------------------------------------------------------------
  // @ SUBSCRIBE TO LOGGED USER LOGOUT ??????????? SEEMS NOT USED ?????????????????
  // ------------------------------------------------------------------------------------
  subscribeLoggedUserLogout = () => {
    this.conversations = []
    this.uidConvSelected = null
    this.logger.log('[CONVS-LIST-PAGE] - subscribeLoggedUserLogout conversations ',this.conversations)
    this.logger.log('[CONVS-LIST-PAGE] - subscribeLoggedUserLogout uidConvSelected ',this.uidConvSelected)
  }

  /**
   * ::: subscribeProfileInfoButtonClicked :::
   * evento richiamato quando si seleziona bottone profile-info-modal
   */
  subscribeProfileInfoButtonClicked = (event: string) => {
    this.logger.log('[CONVS-LIST-PAGE] ************** subscribeProfileInfoButtonClicked: ', event)
    if (event === 'displayArchived') {
      this.initArchivedConversationsHandler()
      // this.openArchivedConversationsModal()
      this.conversationType = 'archived'

      // let storedArchivedConv = localStorage.getItem('activeConversationSelected');
      const keys = ['LABEL_ARCHIVED']
      // const keys = ['History'];

      this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0])
    } else if (event === 'displayContact') {
      this.conversationType = 'archived'
      const keys = ['LABEL_CONTACTS']
      this.headerTitle = this.translateService.translateLanguage(keys).get(keys[0])
    }
  }

  onBackButtonFN(event) {
    this.conversationType = 'active'

    // let storedActiveConv = localStorage.getItem('activeConversationSelected');
    // // console.log('ConversationListPage - storedActiveConv: ', storedActiveConv);
    // if (storedActiveConv) {
    //   let storedActiveConvObjct = JSON.parse(storedActiveConv)
    //   console.log('ConversationListPage - storedActiveConv Objct: ', storedActiveConvObjct);
    //   this.navigateByUrl('active', storedActiveConvObjct.uid)
    // } else {
    //   // da implementare se nn c'è stata nessuna conv attive selezionata
    // }
  }

  // ------------------------------------------------------------------//
  // END SUBSCRIPTIONS
  // ------------------------------------------------------------------//

  // :: handler degli eventi in output per i componenti delle modali
  // ::::: vedi ARCHIVED-CONVERSATION-LIST --> MODALE
  // initHandlerEventEmitter() {
  //   this.onConversationSelectedHandler.subscribe(conversation => {
  //     console.log('ConversationListPage - onversaation selectedddd', conversation)
  //     this.onConversationSelected(conversation)
  //   })

  //   this.onImageLoadedHandler.subscribe(conversation => {
  //     this.onImageLoaded(conversation)
  //   })

  //   this.onConversationLoadedHandler.subscribe(conversation => {
  //     this.onConversationLoaded(conversation)
  //   })
  // }

  // ------------------------------------------------------------------//
  // BEGIN FUNCTIONS
  // ------------------------------------------------------------------//
  /**
   * ::: initialize :::
   */
  initialize() {
    const appconfig = this.appConfigProvider.getConfig()
    this.tenant = appconfig.firebaseConfig.tenant
    this.logger.log('[CONVS-LIST-PAGE] - initialize -> firebaseConfig tenant ',this.tenant)

    if (this.tiledeskAuthService.getCurrentUser()) {
      this.loggedUserUid = this.tiledeskAuthService.getCurrentUser().uid
    }
    this.subscriptions = []
    this.initConversationsHandler()
    this.initVariables()
    this.initSubscriptions()

    // this.initHandlerEventEmitter();
  }

  /**
   * ::: initVariables :::
   * al caricamento della pagina:
   * setto BUILD_VERSION prendendo il valore da PACKAGE
   * recupero conversationWith -
   * se vengo da dettaglio conversazione o da users con conversazione attiva ???? sarà sempre undefined da spostare in ionViewDidEnter
   * recupero tenant
   * imposto recipient se esiste nei parametri passati nell'url
   * imposto uidConvSelected recuperando id ultima conversazione aperta dallo storage
   */
  // --------------------------------------------------------
  // It only works on BSStart.subscribe! it is useful or can be eliminated
  // --------------------------------------------------------
  initVariables() {
    this.logger.log('[CONVS-LIST-PAGE] uidReciverFromUrl:: ' + this.uidReciverFromUrl)
    this.logger.log('[CONVS-LIST-PAGE] loggedUserUid:: ' + this.loggedUserUid)
    this.logger.log('[CONVS-LIST-PAGE] tenant:: ' + this.tenant)
    if (this.route.component['name'] !== 'ConversationListPage') {
      if (this.route && this.route.snapshot && this.route.snapshot.firstChild) {
        const IDConv = this.route.snapshot.firstChild.paramMap.get('IDConv')
        const convType = this.route.snapshot.firstChild.paramMap.get('Convtype')
        this.logger.log('[CONVS-LIST-PAGE] conversationWith 2: ', IDConv)
        if (IDConv) {
          this.setUidConvSelected(IDConv, convType)
        } else {
          this.logger.log('[CONVS-LIST-PAGE] conversationWith 2 (else): ',IDConv)
        }
      }
    }
  }

  /**
   * ::: setUidConvSelected :::
   */
  setUidConvSelected(uidConvSelected: string, conversationType?: string) {
    this.logger.log('[CONVS-LIST-PAGE] setuidCOnvSelected', uidConvSelected, conversationType)
    this.uidConvSelected = uidConvSelected
    // this.conversationsHandlerService.uidConvSelected = uidConvSelected;
    if (uidConvSelected) {
      let conversationSelected
      if (conversationType === 'active') {
        conversationSelected = this.conversations.find((item) => item.uid === this.uidConvSelected)
      } else if (conversationType === 'archived') { 
        conversationSelected = this.archivedConversations.find((item) => item.uid === this.uidConvSelected)
      } else if (conversationType === 'unassigned') { 
        conversationSelected = this.unassignedConversations.find((item) => item.uid === this.uidConvSelected)
      }
      if (conversationSelected) {
        this.logger.log('[CONVS-LIST-PAGE] conversationSelected', conversationSelected)
        this.logger.log('[CONVS-LIST-PAGE] the conversation ', this.conversationSelected, ' has already been loaded')
        this.conversationSelected = conversationSelected
        this.logger.log('[CONVS-LIST-PAGE] setUidConvSelected: ', this.conversationSelected)
        conversationType === 'active'? this.conversationsHandlerService.uidConvSelected = conversationSelected.uid : this.archivedConversationsHandlerService.uidConvSelected = conversationSelected.uid
      }
    }
  }

  onConversationSelected(conversation: ConversationModel) {
    this.logger.log('onConversationSelected conversation', conversation)
    if (conversation.archived) {
      this.navigateByUrl('archived', conversation.uid)
      this.archivedConversationsHandlerService.uidConvSelected = conversation.uid
      this.logger.log('[CONVS-LIST-PAGE] onConversationSelected archived conversation.uid ', conversation.uid,
      )
    } else {
      this.navigateByUrl('active', conversation.uid)
      this.conversationsHandlerService.uidConvSelected = conversation.uid
      this.logger.log('[CONVS-LIST-PAGE] onConversationSelected active conversation.uid ', conversation.uid)
      this.events.publish('convList:onConversationSelected', conversation)
    }
  }

  onImageLoaded(conversation: any) {
    // this.logger.log('[CONVS-LIST-PAGE] onImageLoaded', conversation)
    let conversation_with_fullname = conversation.sender_fullname
    let conversation_with = conversation.sender
    if (conversation.sender === this.loggedUserUid) {
      conversation_with = conversation.recipient
      conversation_with_fullname = conversation.recipient_fullname
    } else if (isGroup(conversation)) {
      // conversation_with_fullname = conv.sender_fullname;
      // conv.last_message_text = conv.last_message_text;
      conversation_with = conversation.recipient
      conversation_with_fullname = conversation.recipient_fullname
    }
    if (!conversation_with.startsWith('support-group')) {
      conversation.image = this.imageRepoService.getImagePhotoUrl(conversation_with)
    }
  }

  onConversationLoaded(conversation: ConversationModel) {
    this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded ', conversation)
    // this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded is new? ', conversation.is_new)
    // if (conversation.is_new === false) {
    //   this.ionContentConvList.scrollToTop(0);
    // }

    const keys = ['YOU', 'SENT_AN_IMAGE', 'SENT_AN_ATTACHMENT']
    const translationMap = this.translateService.translateLanguage(keys)
    // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the convesations list

    var regex = /<br\s*[\/]?>/gi
    if (conversation ) { //&& conversation.last_message_text
      conversation.last_message_text = conversation.last_message_text.replace(regex, '',)

      //FIX-BUG: 'YOU: YOU: YOU: text' on last-message-text in conversation-list
      if (conversation.sender === this.loggedUserUid && !conversation.last_message_text.includes(': ')) {
        // this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded', conversation)

        if (conversation.type !== 'image' && conversation.type !== 'file') {
          conversation.last_message_text = translationMap.get('YOU') + ': ' + conversation.last_message_text
        } else if (conversation.type === 'image') {
          // this.logger.log('[CONVS-LIST-PAGE] HAS SENT AN IMAGE');
          // this.logger.log("[CONVS-LIST-PAGE] translationMap.get('YOU')")
          const SENT_AN_IMAGE = (conversation['last_message_text'] = translationMap.get('SENT_AN_IMAGE'))

          conversation.last_message_text = translationMap.get('YOU') + ': ' + SENT_AN_IMAGE
        } else if (conversation.type === 'file') {
          // this.logger.log('[CONVS-LIST-PAGE] HAS SENT FILE')
          const SENT_AN_ATTACHMENT = (conversation['last_message_text'] = translationMap.get('SENT_AN_ATTACHMENT'))
          conversation.last_message_text = translationMap.get('YOU') + ': ' + SENT_AN_ATTACHMENT
        }
      } else {
        if (conversation.type === 'image') {
          // this.logger.log('[CONVS-LIST-PAGE] HAS SENT AN IMAGE');
          // this.logger.log("[CONVS-LIST-PAGE] translationMap.get('YOU')")
          const SENT_AN_IMAGE = (conversation['last_message_text'] = translationMap.get('SENT_AN_IMAGE'))

          conversation.last_message_text = SENT_AN_IMAGE
        } else if (conversation.type === 'file') {
          // this.logger.log('[CONVS-LIST-PAGE] HAS SENT FILE')
          const SENT_AN_ATTACHMENT = (conversation['last_message_text'] = translationMap.get('SENT_AN_ATTACHMENT'))
          conversation.last_message_text = SENT_AN_ATTACHMENT
        }
      }
    }
    
    if(conversation.attributes && conversation.attributes['projectId']){
      let project = localStorage.getItem(conversation.attributes['projectId'])
      if(project){
        project = JSON.parse(project)
        conversation.attributes.project_name = project['name']
      }
    }else if(conversation.attributes){
      const projectId = getProjectIdSelectedConversation(conversation.uid)
      let project = localStorage.getItem(projectId)
      if(project){
        project = JSON.parse(project)
        conversation.attributes.projectId = project['_id']
        conversation.attributes.project_name = project['name']
      }
    }

  }

  // isMarkdownLink(last_message_text) {
  //   this.logger.log('[CONVS-LIST-PAGE] isMarkdownLink 1')
  //   var regex = /^(^|[\n\r])\s*1\.\s.*\s+1\.\s$/
  //   let matchRegex = false
  //   if (regex.test(last_message_text)) {
  //     this.logger.log('[CONVS-LIST-PAGE] isMarkdownLink 2')
  //     matchRegex = true
  //     return matchRegex
  //   }
  // }

  private getUUidConversation(uid): string{
    const conversationWith_segments = uid.split('-')
    // Removes the last element of the array if is = to the separator
    if (conversationWith_segments[conversationWith_segments.length - 1] === '') {
      conversationWith_segments.pop()
    }

    this.logger.log('[CONVS-LIST] - getUUidConversation conversationWith_segments ', conversationWith_segments, conversationWith_segments.length)
    let mini_uid = ''

    if (conversationWith_segments.length === 4) {
      mini_uid = conversationWith_segments[conversationWith_segments.length -1].substr(0,5)
      this.logger.log('[CONVS-LIST] - getUUidConversation mini_uid segment===4', mini_uid)
    } else {
      this.logger.log('[CONVS-LIST] - else  getUUidConversation segment<4 ', mini_uid)
      mini_uid = conversationWith_segments[conversationWith_segments.length -1].substr(-5)
    }

    return mini_uid
  }

  navigateByUrl(converationType: string, uidConvSelected: string) {

    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl uidConvSelected: ', uidConvSelected)

    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.uidConvSelected ', this.uidConvSelected)

    this.setUidConvSelected(uidConvSelected, converationType)
    if (checkPlatformIsMobile()) {
      this.logger.log('[CONVS-LIST-PAGE] checkPlatformIsMobile(): ', checkPlatformIsMobile())
      this.logger.log('[CONVS-LIST-PAGE] DESKTOP (window < 768)', this.navService)
      this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.conversationSelected conversation_with_fullname ', this.conversationSelected)
      let pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType
      this.logger.log('[CONVS-LIST-PAGE] pageURL', pageUrl)
        // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29').replace( /#/g, "%23" ), {replaceUrl: true})
    } else {
      this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.conversationSelected conversation_with_fullname ', this.conversationSelected)
      this.logger.log('[CONVS-LIST-PAGE] checkPlatformIsMobile(): ', checkPlatformIsMobile())
      this.logger.log('[CONVS-LIST-PAGE] MOBILE (window >= 768) ', this.navService)
      let pageUrl = 'conversation-detail/' + this.uidConvSelected
      if (this.conversationSelected && this.conversationSelected.conversation_with_fullname) {
        pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType
      }
      this.logger.log('[CONVS-LIST-PAGE] setUidConvSelected navigateByUrl--->: ', pageUrl)
      // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29').replace( /#/g, "%23" ), {replaceUrl: true})
    }
  }

  // ---------------------------------------------------------
  // Opens the list of contacts for direct convs
  // ---------------------------------------------------------
  openContactsDirectory(event: any) {
    this.logger.log('[CONVS-LIST-PAGE] openContactsDirectory')
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ContactsDirectoryPage, { isMobile: this.isMobile })
    } else {
      this.navService.push(ContactsDirectoryPage, { isMobile: this.isMobile })
    }
  }

  closeContactsDirectory() {
    try {
      closeModal(this.modalController)
    } catch (err) {
      this.logger.error(
        '[CONVS-LIST-PAGE] closeContactsDirectory -> error:',
        err,
      )
    }
  }

  // ---------------------------------------------------------
  // Opens logged user profile modal
  // ---------------------------------------------------------
  openProfileInfo(event: any) {
    const TOKEN = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CONVS-LIST-PAGE] open ProfileInfoPage TOKEN ', TOKEN)
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ProfileInfoPage, { token: TOKEN, selectedStatus: this.selectedStatus, project: this.project, profile_name_translated: this.profile_name_translated })
    } else {
      this.navService.push(ProfileInfoPage, { token: TOKEN, selectedStatus: this.selectedStatus, project: this.project, profile_name_translated: this.profile_name_translated })
    }
  }

  onSoundChange(event: string){
    if(event && event !== undefined){
      localStorage.setItem('dshbrd----sound', event)
      this.sound_btn = event
    }
  }

  listenToCloseConvFromHeaderConversation() {
    this.events.subscribe('conversation:closed', (convId) => {
      this.logger.log('[CONVS-LIST-PAGE] hasclosedconversation  convId', convId)

      const conversation = this.conversations.find(
        (conv) => conv.uid === convId,
      )
      this.logger.log('[CONVS-LIST-PAGE] hasclosedconversation  conversation', conversation)
      this.onCloseConversation(conversation)
    })
  }

  onJoinConversation(conversation: ConversationModel){
    this.logger.log('[CONVS-LIST-PAGE] onJoinConversation  conversation', conversation)
  }

  // ----------------------------------------------------------------------------------------------
  // onCloseConversation
  // https://github.com/chat21/chat21-cloud-functions/blob/master/docs/api.md#delete-a-conversation
  // ----------------------------------------------------------------------------------------------
  onCloseConversation(conversation: ConversationModel) {
    this.logger.log('[CONVS-LIST-PAGE] onCloseConversation  conversation', conversation)

    // -------------------------------------------------------------------------------------
    // Fix the display of the message "No conversation yet" when a conversation is archived
    // but there are others in the list (happens when loadingIsActive is set to false because
    // when is called the initConversationsHandler method there is not conversations)
    // -------------------------------------------------------------------------------------
    this.loadingIsActive = false
    // console.log('CONVS - CONV-LIST-PAGE onCloseConversation CONVS: ', conversation)
    this.logger.log('[CONVS-LIST-PAGE] onCloseConversation loadingIsActive: ', this.loadingIsActive)
    if (conversation) {
      const conversationId = conversation.uid

      this.logger.log('[CONVS-LIST-PAGE] onCloseConversation conversationId: ', conversationId)

      const conversationWith_segments = conversationId.split('-')
      this.logger.log('[CONVS-LIST-PAGE] - conversationId_segments: ',conversationWith_segments)

      // Removes the last element of the array if is = to the separator
      if (conversationWith_segments[conversationWith_segments.length - 1] === '') {
        conversationWith_segments.pop()
      }

      if (conversationWith_segments.length === 4) {
        const lastArrayElement = conversationWith_segments[conversationWith_segments.length - 1]
        this.logger.log('[CONVS-LIST-PAGE] - lastArrayElement ',lastArrayElement)
        this.logger.log('[CONVS-LIST-PAGE] - lastArrayElement length',lastArrayElement.length)
        // if (lastArrayElement.length !== 32) {
        //   conversationWith_segments.pop()
        // }
      }

      if (conversationId.startsWith('support-group')) {
        let project_id = ''
        if (conversationWith_segments.length === 4) {
          project_id = conversationWith_segments[2]
          this.archiveSupportGroupConv(project_id,conversationId)
        } else {
          this.getProjectIdByConversationWith(conversationId)
        }
      } else {
        this.conversationsHandlerService.archiveConversation(conversationId)
      }
    }
  }

  getProjectIdByConversationWith(conversationId: string) {
    this.tiledeskService.getProjectIdByConvRecipient(conversationId).subscribe((res) => {
      this.logger.log('[CONVS-LIST-PAGE] - GET PROJECTID BY CONV RECIPIENT RES',res)

      if (res) {
        const project_id = res.id_project
        this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTID BY CONV RECIPIENT  project_id',project_id)
        this.archiveSupportGroupConv(project_id,conversationId)
      }
    },(error) => {
      this.logger.error('[CONVS-LIST-PAGE] - GET PROJECTID BY CONV RECIPIENT - ERROR  ',error)
    },() => {
      this.logger.log('[CONVS-LIST-PAGE] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
    })
  }

  archiveSupportGroupConv(project_id, conversationId) {
    this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation projectId: ',project_id)
    this.tiledeskService.closeSupportGroup(project_id, conversationId).subscribe((res) => {
      this.archiveActionNotAllowed = false
      this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup RES',res)
      if(res.status === REQUEST_ARCHIVED)
        this.conversationsHandlerService.archiveConversation(conversationId)
    },(error) => {
      this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  ',error)
      this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  error.error.msg ',error.error.msg)
      this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  error.status ',error.status)
      if (error.error.msg === 'you dont belong to the project.') {
        this.archiveActionNotAllowed = true
      }
      this.conversationsHandlerService.archiveConversation(conversationId)
    },() => {
      this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup * COMPLETE *')
      this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation (closeSupportGroup) ID ',this.uidConvSelected, conversationId)
      this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation (closeSupportGroup) CONVS LENGHT ',this.conversations.length)
      this.events.publish('conversationhasbeenclosed', conversationId)
      if(conversationId === this.uidConvSelected){
        this.navigateByUrl('archived', conversationId)
      }
    })
  }

  onCloseAlert($event) {
    this.logger.log('[CONVS-LIST-PAGE] - onCloseAlert ', $event)
    this.archiveActionNotAllowed = false
  }

  public generateFake(count: number): Array<number> {
    const indexes = []
    for (let i = 0; i < count; i++) {
      indexes.push(i)
    }
    return indexes
  }

  private segmentNewConversationAdded(conversation: ConversationModel){
    let user = this.tiledeskAuthService.getCurrentUser()
    if(window['analytics']){
      try {
        window['analytics'].page("Chat List Conversations Page, Agent added to conversation", {});
      } catch (err) {
        this.logger.error('Event:Agent added to conversation [page] error', err);
      }
  
      try {
        window['analytics'].identify(user.uid, {
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          logins: 5,
        });
      } catch (err) {
        this.logger.error('Event:Agent added to conversation [identify] error', err);
      }
  
      try {
        window['analytics'].track('Agent added to conversation', {
          "username": user.firstname + ' ' + user.lastname,
          "userId": user.uid,
          "conversation_id": conversation.uid,
          "channel_type": conversation.channel_type,
          "conversation_with": conversation.conversation_with,
          "project_id":(conversation.channel_type !== TYPE_DIRECT)? conversation.uid.split('-')[2]: null,
          "project_name":(conversation.channel_type !== TYPE_DIRECT && conversation.attributes && conversation.attributes.departmentId)? conversation.attributes.departmentId: null,
        },
        {
          "context": {
            "groupId": (conversation.channel_type !== TYPE_DIRECT)? conversation.uid.split('-')[2]: null
          }
        });
      } catch (err) {
        this.logger.error('Event:Agent added to conversation [track] error', err);
      }
  
      if(conversation.channel_type !== TYPE_DIRECT){
        try {
          window['analytics'].group(conversation.uid.split('-')[2], {
            name: (conversation.attributes && conversation.attributes.project_name)? conversation.attributes.project_name : null,
            // plan: projectProfileName,
          });
        } catch (err) {
          this.logger.error('Event:Agent added to conversation [group] error', err);
        }
      }
    }
  }

}
