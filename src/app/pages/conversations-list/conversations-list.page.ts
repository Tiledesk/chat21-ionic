import { Chat21HttpService } from 'src/chat21-core/providers/native/chat21http.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service'
import { Component, OnInit, ViewChild } from '@angular/core'
import { IonContent, ModalController } from '@ionic/angular'
import { ActivatedRoute, Router } from '@angular/router'
// config

// models
import { ConversationModel } from 'src/chat21-core/models/conversation'

// utils
import {
  isInArray,
  checkPlatformIsMobile,
  presentModal,
  closeModal,
  convertMessage,
  isGroup,
} from '../../../chat21-core/utils/utils'

import { EventsService } from '../../services/events-service'

// services
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service'
import { ChatManager } from 'src/chat21-core/providers/chat-manager'
import { NavProxyService } from '../../services/nav-proxy.service'
import { TiledeskService } from '../../services/tiledesk/tiledesk.service'
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
import { takeUntil } from 'rxjs/operators'

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
  public uidConvSelected: string
  public conversationSelected: ConversationModel
  public uidReciverFromUrl: string
  public numberOpenConv = 0
  public loadingIsActive = true
  public supportMode: boolean
  public writeto_btn: boolean
  public archived_btn: boolean
  public sound_btn: string
  public convertMessage = convertMessage
  private logger: LoggerService = LoggerInstance.getInstance()
  translationMapConversation: Map<string, string>
  stylesMap: Map<string, string>

  public conversationType = 'active'
  headerTitle: string
  subscription: Subscription

  public UNASSIGNED_CONVS_URL: any
  public PROJECTS_FOR_PANEL_URL: any
  public IFRAME_URL: any
  public hasClickedOpenUnservedConvIframe: boolean = false
  public lastProjectId: string
  public isOnline: boolean = true
  public checkInternet: boolean

  public displayNewConvsItem: boolean = true
  public archiveActionNotAllowed: boolean = false

  tooltipOptions = {
    'show-delay': 1500,
    'tooltip-class': 'chat-tooltip',
    theme: 'light',
    shadow: false,
    'hide-delay-mobile': 0,
    hideDelayAfterClick: 3000,
    'hide-delay': 200,
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavProxyService,
    public events: EventsService,
    public modalController: ModalController,
    // public databaseProvider: DatabaseProvider,
    public chat21HttpService: Chat21HttpService,
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
    private networkService: NetworkService  ) {
    this.listenToAppCompConvsLengthOnInitConvs()
    this.listenToLogoutEvent()
    this.listenGoOnline()
    this.listenGoOffline()
    this.listenToStorageChange()
    this.listenToSwPostMessage()
    this.listenSupportConvIdHasChanged()
    // this.listenDirectConvIdHasChanged();
    this.listenToCloseConvFromHeaderConversation()
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
    this.watchToConnectionStatus()
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
    this.supportMode = null
    if (appConfig && appConfig.supportMode === true || appConfig.supportMode === 'true') {
      this.supportMode = true;
    } else if (appConfig && appConfig.supportMode === false || appConfig.supportMode === 'false') {
      this.supportMode = false
    }
    this.archived_btn = null
    if (appConfig && appConfig.archivedButton === true || appConfig.archivedButton === 'true') {
      this.archived_btn = true;
    } else if (appConfig && appConfig.archivedButton === false || appConfig.archivedButton === 'false') {
      this.archived_btn = false;
    }
    this.writeto_btn = null
    if (appConfig && appConfig.writeToButton === true || appConfig.writeToButton === 'true') {
      this.writeto_btn = true;
    } else if (appConfig && appConfig.writeToButton === false || appConfig.writeToButton === 'false') {
      this.writeto_btn = false;
    }


    const sound_status = localStorage.getItem('dshbrd----sound')
    if(sound_status && sound_status !== 'undefined'){
      this.sound_btn = sound_status
    } else {
      this.sound_btn = 'enabled'
    }


  }

  watchToConnectionStatus() {
    this.networkService.checkInternetFunc().subscribe((isOnline) => {
      this.checkInternet = isOnline
      this.logger.log('[ION-LIST-CONVS-COMP] - watchToConnectionStatus - isOnline', this.checkInternet)

      // checking internet connection
      if (this.checkInternet == true) {
        this.isOnline = true
      } else {
        this.isOnline = false
      }
    })
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

  openUnsevedConversationIframe(event) {
    this.logger.log('[CONVS-LIST-PAGE] openUnsevedConversationIframe ', event)
    this.hasClickedOpenUnservedConvIframe = true
    this.logger.log('[CONVS-LIST-PAGE] - HAS CLIKED OPEN UNSERVED REQUEST IFRAME',this.hasClickedOpenUnservedConvIframe )
    const DASHBOARD_BASE_URL = this.appConfigProvider.getConfig().dashboardUrl
    // http://localhost:4204/#/projects-for-panel
    this.PROJECTS_FOR_PANEL_URL = DASHBOARD_BASE_URL + '#/projects-for-panel'
    this.UNASSIGNED_CONVS_URL = DASHBOARD_BASE_URL + '#/project/' + this.lastProjectId + '/unserved-request-for-panel'

    if (event === 'pinbtn') {
      this.IFRAME_URL = this.PROJECTS_FOR_PANEL_URL
    } else {
      this.IFRAME_URL = this.UNASSIGNED_CONVS_URL
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
    this.chat21HttpService.getLastConversations(this.loggedUserUid).then(conversations => {
      this.logger.info('initialize FROM [APP-COMP] - [APP-COMP]-CONVS - INIT CONV CONVS', conversations)
      this.conversations = this.chat21HttpService.conversations
      this.conversationsHandlerService.conversations = this.chat21HttpService.conversations
      if (!conversations || conversations.length === 0) {
        this.logger.debug('[APP-COMP]-CONVS - INIT CONV CONVS 2', conversations)
        this.events.publish('appcompSubscribeToConvs:loadingIsActive', false);
      }
    }).then(()=> {
      //subscribe to add/change/delete events
      this.conversationsHandlerService.subscribeToConversations(null, ()=>{})
      //update local Conversations Array in storage
      this.chat21HttpService.setConversationsLocalStorage()
      // save conversationHandler in chatManager
      this.chatManager.setConversationsHandler(this.conversationsHandlerService)
    })
  }

  initArchivedConversationsHandler() {
    const keysConversation = ['CLOSED', 'Resolve']
    this.translationMapConversation = this.translateService.translateLanguage( keysConversation )

    this.chat21HttpService.getLastArchivedConversations(this.loggedUserUid).then((conversations)=> {
      this.logger.log('[CONVS-LIST-PAGE]-CONVS SubscribeToConversations - conversations archived length ', this.archivedConversations.length )
      this.archivedConversations = this.chat21HttpService.archivedConversations
      if (!conversations || conversations.length === 0 ) {
        this.loadingIsActive = false
      }
    }).then(()=> {
      //subscrive to add/change/delete events
      this.archivedConversationsHandlerService.subscribeToConversations(() => {});
      // save archivedConversationsHandlerService in chatManager
      this.chatManager.setArchivedConversationsHandler(this.archivedConversationsHandlerService)
    })
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
        this.chat21HttpService.conversations = []
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
        this.logger.log('[CONVS-LIST-PAGE] ***** conversationsAdded *****', conversation);
        // that.conversationsChanged(conversations);
        if (conversation) {
          this.onImageLoaded(conversation)
          this.onConversationLoaded(conversation)
        }
    })

    this.conversationsHandlerService.conversationChanged.subscribe((conversation: ConversationModel) => {
        // this.logger.log('[CONVS-LIST-PAGE] ***** subscribeConversationChanged *****', conversation);
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

  subscribeLoggedUserLogout = () => {
    this.conversations = []
    this.uidConvSelected = null
    this.logger.log('[CONVS-LIST-PAGE] - subscribeLoggedUserLogout conversations ',this.conversations)
    this.logger.log('[CONVS-LIST-PAGE] - subscribeLoggedUserLogout uidConvSelected ',this.uidConvSelected)
  }

  // ------------------------------------------------------------------------------------
  // @ SUBSCRIBE TO CONVERSATION CHANGED  ??????????? SEEMS NOT USED ?????????????????
  // ------------------------------------------------------------------------------------
  conversationsChanged = (conversations: ConversationModel[]) => {
    this.numberOpenConv = this.chat21HttpService.countIsNew()
    this.logger.log('[CONVS-LIST-PAGE] - conversationsChanged - NUMB OF CONVERSATIONS: ',this.numberOpenConv)
    // console.log('conversationsChanged »»»»»»»»» uidConvSelected', that.conversations[0], that.uidConvSelected);
    if (this.uidConvSelected && !this.conversationSelected) {
      const conversationSelected = this.conversations.find((item) => item.uid === this.uidConvSelected)
      if (conversationSelected) {
        this.conversationSelected = conversationSelected
        this.setUidConvSelected(this.uidConvSelected)
      }
    }
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
  }

  // ------------------------------------------------------------------//
  // END SUBSCRIPTIONS
  // ------------------------------------------------------------------//

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
          this.uidConvSelected = IDConv
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
    this.logger.log('[CONVS-LIST-PAGE] setuidCOnvSelected', uidConvSelected, this.conversations)
    this.uidConvSelected = uidConvSelected
    this.chat21HttpService.uidConvSelected = uidConvSelected
    if (uidConvSelected) {
      let conversationSelected
      if (conversationType === 'active') {
        conversationSelected = this.conversations.find((item) => item.uid === this.uidConvSelected)
      } else if (conversationType === 'archived') { 
        conversationSelected = this.archivedConversations.find((item) => item.uid === this.uidConvSelected)
      }
      if (conversationSelected) {
        this.logger.log('[CONVS-LIST-PAGE] conversationSelected', conversationSelected)
        this.logger.log('[CONVS-LIST-PAGE] the conversation ', this.conversationSelected, ' has already been loaded')
        this.conversationSelected = conversationSelected
        this.logger.log('[CONVS-LIST-PAGE] setUidConvSelected: ', this.conversationSelected)
      }
    }
  }

  onConversationSelected(conversation: ConversationModel) {
    this.logger.log('onConversationSelected conversation', conversation)
    this.chat21HttpService.uidConvSelected = conversation.uid
    if (conversation.archived) {
      this.navigateByUrl('archived', conversation.uid)
      // this.archivedConversationsHandlerService.uidConvSelected = conversation.uid
      this.logger.log('[CONVS-LIST-PAGE] onConversationSelected archived conversation.uid ', conversation.uid,
      )
    } else {
      this.navigateByUrl('active', conversation.uid)
      // this.conversationsHandlerService.uidConvSelected = conversation.uid
      this.logger.log('[CONVS-LIST-PAGE] onConversationSelected active conversation.uid ', conversation.uid)
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
    // this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded ', conversation)
    // this.logger.log('[CONVS-LIST-PAGE] onConversationLoaded is new? ', conversation.is_new)
    // if (conversation.is_new === false) {
    //   this.ionContentConvList.scrollToTop(0);
    // }

    const keys = ['YOU', 'SENT_AN_IMAGE', 'SENT_AN_ATTACHMENT']
    const translationMap = this.translateService.translateLanguage(keys)
    // Fixes the bug: if a snippet of code is pasted and sent it is not displayed correctly in the convesations list

    var regex = /<br\s*[\/]?>/gi
    if (conversation && conversation.last_message_text) {
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

  navigateByUrl(converationType: string, uidConvSelected: string) {

    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl uidConvSelected: ', uidConvSelected)

    this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.uidConvSelected ', this.uidConvSelected)

    this.setUidConvSelected(uidConvSelected, converationType)
    if (checkPlatformIsMobile()) {
      this.logger.log('[CONVS-LIST-PAGE] checkPlatformIsMobile(): ', checkPlatformIsMobile())
      this.logger.log('[CONVS-LIST-PAGE] DESKTOP (window < 768)', this.navService)
      this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.conversationSelected conversation_with_fullname ', this.conversationSelected.conversation_with_fullname)
      let pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType
      this.logger.log('[CONVS-LIST-PAGE] pageURL', pageUrl)
        // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29'))
    } else {
      this.logger.log('[CONVS-LIST-PAGE] navigateByUrl this.conversationSelected conversation_with_fullname ', this.conversationSelected.conversation_with_fullname)
      this.logger.log('[CONVS-LIST-PAGE] checkPlatformIsMobile(): ', checkPlatformIsMobile())
      this.logger.log('[CONVS-LIST-PAGE] MOBILE (window >= 768) ', this.navService)
      let pageUrl = 'conversation-detail/' + this.uidConvSelected
      if (this.conversationSelected && this.conversationSelected.conversation_with_fullname) {
        pageUrl = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname + '/' + converationType
      }
      this.logger.log('[CONVS-LIST-PAGE] setUidConvSelected navigateByUrl--->: ', pageUrl)
      // replace(/\(/g, '%28').replace(/\)/g, '%29') -> used for the encoder of any round brackets
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29'))
    }
  }

  // ---------------------------------------------------------
  // Opens the list of contacts for direct convs
  // ---------------------------------------------------------
  openContactsDirectory(event: any) {
    const TOKEN = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CONVS-LIST-PAGE] openContactsDirectory', TOKEN)
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ContactsDirectoryPage, {
        token: TOKEN,
      })
    } else {
      this.navService.push(ContactsDirectoryPage, { token: TOKEN })
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
    const TOKEN = this.messagingAuthService.getToken()
    this.logger.log('[CONVS-LIST-PAGE] open ProfileInfoPage TOKEN ', TOKEN)
    if (checkPlatformIsMobile()) {
      presentModal(this.modalController, ProfileInfoPage, { token: TOKEN })
    } else {
      this.navService.push(ProfileInfoPage, { token: TOKEN })
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

          const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
          this.archiveSupportGroupConv(tiledeskToken,project_id,conversationId,)
        } else {
          this.getProjectIdByConversationWith(conversationId)
        }
      } else {
        this.conversationsHandlerService.archiveConversation(conversationId)
      }
    }
  }

  getProjectIdByConversationWith(conversationId: string) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService.getProjectIdByConvRecipient(tiledeskToken, conversationId).subscribe((res) => {
      this.logger.log('[CONVS-LIST-PAGE] - GET PROJECTID BY CONV RECIPIENT RES',res)

      if (res) {
        const project_id = res.id_project
        this.logger.log('[INFO-CONTENT-COMP] - GET PROJECTID BY CONV RECIPIENT  project_id',project_id)
        this.archiveSupportGroupConv(tiledeskToken,project_id,conversationId)
      }
    },(error) => {
      this.logger.error('[CONVS-LIST-PAGE] - GET PROJECTID BY CONV RECIPIENT - ERROR  ',error)
    },() => {
      this.logger.log('[CONVS-LIST-PAGE] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
    })
  }

  archiveSupportGroupConv(tiledeskToken, project_id, conversationId) {
    this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation projectId: ',project_id)
    this.tiledeskService.closeSupportGroup(tiledeskToken, project_id, conversationId).subscribe((res) => {
      this.archiveActionNotAllowed = false
      this.logger.log('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup RES',res)
    },(error) => {
      this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  ',error)
      this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  error.error.msg ',error.error.msg)
      this.logger.error('[CONVS-LIST-PAGE] - onCloseConversation closeSupportGroup - ERROR  error.status ',error.status)
      if (error.error.msg === 'you dont belong to the project.') {
        this.archiveActionNotAllowed = true
      }
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

  // ------------------------------------------------------------------
  // !!! Not used methods !!!
  // ------------------------------------------------------------------

  // /**
  //  * ::: openArchivedConversationsPage :::
  //  * Open the archived conversations page
  //  * (metodo richiamato da html)
  //  */
  // openArchivedConversationsPage() {
  //   this.logger.log('[CONVS-LIST-PAGE] openArchivedConversationsPage');
  // }

  // // info page
  // returnCloseInfoPage() {
  //   this.logger.log('[CONVS-LIST-PAGE] returnCloseInfoPage');
  //   // this.isShowMenuPage = false;
  //   this.initialize();

  // }

  // private navigatePage() {
  //   this.logger.log('[CONVS-LIST-PAGE] navigatePage:: >>>> conversationSelected ', this.conversationSelected);
  //   let urlPage = 'detail/';
  //   if (this.conversationSelected) {
  //     // urlPage = 'conversation-detail/' + this.uidConvSelected;
  //     urlPage = 'conversation-detail/' + this.uidConvSelected + '/' + this.conversationSelected.conversation_with_fullname;
  //     // this.openDetailsWithState(this.conversationSelected);
  //   }
  //   // else {
  //   //   this.router.navigateByUrl('detail');
  //   // }

  //   const navigationExtras: NavigationExtras = {
  //     state: {
  //       conversationSelected: this.conversationSelected
  //     }
  //   };
  //   this.navService.openPage(urlPage, ConversationDetailPage, navigationExtras);
  // }

  // openDetailsWithState(conversationSelected) {
  //   console.log('openDetailsWithState:: >>>> conversationSelected ', conversationSelected);
  //   let navigationExtras: NavigationExtras = {
  //     state: {
  //       conversationSelected: conversationSelected
  //     }
  //   };
  //   this.router.navigate(['conversation-detail/' + this.uidConvSelected], navigationExtras);
  // }

  // /**
  //  * ::: subscribeLoggedUserLogin :::
  //  * effettuato il login:
  //  * 1 - imposto loggedUser
  //  * 2 - dismetto modale
  //  * 3 - inizializzo elenco conversazioni
  //  */
  // subscribeLoggedUserLogin = (user: any) => {
  //   console.log('3 ************** subscribeLoggedUserLogin', user);
  //   this.loggedUser = user;
  //   try {
  //     closeModal(this.modalController);
  //   } catch (err) {
  //     console.error('-> error:', err);
  //   }
  //   this.initialize();
  // }

  /**
   * ::: conversationsChanged :::
   * evento richiamato su add, change, remove dell'elenco delle conversazioni
   * 1 - aggiorno elenco conversazioni
   * 2 - aggiorno il conto delle nuove conversazioni
   * 4 - se esiste un uidReciverFromUrl (passato nell'url)
   *    e se esiste una conversazione con lo stesso id di uidReciverFromUrl
   *    imposto questa come conversazione attiva (operazione da fare una sola volta al caricamento delle conversazioni)
   *    e la carico nella pagina di dettaglio e azzero la variabile uidReciverFromUrl!!!
   * 5 - altrimenti se esiste una conversazione con lo stesso id della conversazione attiva
   *    e la pagina di dettaglio è vuota (placeholder), carico la conversazione attiva (uidConvSelected) nella pagina di dettaglio
   *    (operazione da fare una sola volta al caricamento delle conversazioni)
   */

  // ------------------------------------------------------------------------------------
  // ::: readAllMessages :::  ??????????? SEEMS NOT USED ?????????????????
  // when all chat messages are displayed,
  // that is when in the conversation detail I go to the bottom of the page,
  // the readAllMessages event is triggered and is intercepted in the conversation list
  // and modify the current conversation by bringing is_new to false
  // ------------------------------------------------------------------------------------
  // readAllMessages = (uid: string) => {
  //   this.logger.log('[CONVS-LIST-PAGE] readAllMessages', uid);
  //   const conversationSelected = this.conversations.find(item => item.uid === this.uidConvSelected);
  //   if (conversationSelected) {
  //     conversationSelected.is_new = false;
  //     conversationSelected.status = '0';
  //     conversationSelected.selected = true;
  //   }
  // }
}
