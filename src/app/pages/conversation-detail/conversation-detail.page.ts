import { ProjectPlanUtils } from './../../utils/project-utils';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import {
  ModalController,
  ToastController,
  Platform,
  ActionSheetController,
  IonContent,
} from '@ionic/angular'

// models
import { UserModel } from 'src/chat21-core/models/user'
import { MessageModel } from 'src/chat21-core/models/message'
import { ConversationModel } from 'src/chat21-core/models/conversation'
import { GroupModel } from 'src/chat21-core/models/group'

// services
import { ChatManager } from 'src/chat21-core/providers/chat-manager'
import { AppConfigProvider } from '../../services/app-config'

import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service'
import { TypingService } from 'src/chat21-core/providers/abstract/typing.service'
import { ConversationHandlerBuilderService } from 'src/chat21-core/providers/abstract/conversation-handler-builder.service'
import { GroupsHandlerService } from 'src/chat21-core/providers/abstract/groups-handler.service'
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service'
import { ConversationsHandlerService } from 'src/chat21-core/providers/abstract/conversations-handler.service'
import { ArchivedConversationsHandlerService } from 'src/chat21-core/providers/abstract/archivedconversations-handler.service'
import { ConversationHandlerService } from 'src/chat21-core/providers/abstract/conversation-handler.service'
import { ContactsService } from 'src/app/services/contacts/contacts.service'
import { CannedResponsesService } from '../../services/canned-responses/canned-responses.service'
import {checkAcceptedFile, getDateDifference} from 'src/chat21-core/utils/utils'
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service'
import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service'
import { CreateCannedResponsePage } from 'src/app/modals/create-canned-response/create-canned-response.page'
// utils
import {
  TYPE_MSG_TEXT,
  MESSAGE_TYPE_INFO,
  MESSAGE_TYPE_MINE,
  MESSAGE_TYPE_OTHERS,
  TYPE_DIRECT,
  TYPE_MSG_EMAIL,
  TYPE_MSG_FORM,
  CHANNEL_TYPE,
  INFO_MESSAGE_TYPE,
  TYPE_GROUP
} from 'src/chat21-core/utils/constants'
import {
  checkPlatformIsMobile,
  checkWindowWidthIsLessThan991px,
  setConversationAvatar,
  setChannelType,
} from '../../../chat21-core/utils/utils'
import {
  getProjectIdSelectedConversation,
  infoMessageType,
  isFirstMessage,
  isInfo,
  isMine,
  messageType,
} from 'src/chat21-core/utils/utils-message'

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service'
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance'

import { Observable, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { TiledeskService } from '../../services/tiledesk/tiledesk.service'
import { NetworkService } from '../../services/network-service/network.service'
import { EventsService } from '../../services/events-service'
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { Project } from 'src/chat21-core/models/projects';
import { Globals } from 'src/app/utils/globals';
import { ProjectService } from 'src/app/services/projects/project.service';

@Component({
  selector: 'app-conversation-detail',
  templateUrl: './conversation-detail.page.html',
  styleUrls: ['./conversation-detail.page.scss'],
})
export class ConversationDetailPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('ionContentChatArea', { static: false })
  ionContentChatArea: IonContent
  @ViewChild('rowMessageTextArea', { static: false }) rowTextArea: ElementRef
  @ViewChild('noCannedTitle', { static: false }) noCannedTitle: ElementRef


  // @ViewChild('info_content', { static: false }) info_content_child : InfoContentComponent;

  showButtonToBottom = false // indica lo stato del pulsante per scrollare la chat (showed/hidden)
  NUM_BADGES = 0 // numero di messaggi non letti
  COLOR_GREEN = '#24d066' // colore presence active da spostare nelle costanti
  COLOR_RED = '#db4437' // colore presence none da spostare nelle costanti

  private unsubscribe$: Subject<any> = new Subject<any>()
  private subscriptions: Array<any>
  public tenant: string;
  public loggedUser: UserModel
  public conversationWith: string
  public conversationWithFullname: string
  public messages: Array<MessageModel> = []
  public groupDetail: GroupModel
  public messageSelected: any
  public channelType: string
  public lastConnectionDate: string
  public showMessageWelcome: boolean
  public openInfoConversation = false
  public isMobile = false
  public isLessThan991px = false // nk added

  public heightMessageTextArea = ''
  public translationsMap: Map<string, string> = new Map()
  public translationsHeaderMap: Map<string, string> = new Map()
  public translationsContentMap: Map<string, string> = new Map()
  public translationsInfoConversationMap: Map<string, string> = new Map()
  public conversationAvatar: any
  public leadInfo: { lead_id: string, hasEmail: boolean, email: string, projectId: string, presence: {} };
  public liveInfo: { sourcePage: string, sourceTitle: string }
  public member: UserModel
  public isFileSelected: boolean
  public showIonContent = false
  public conv_type: string

  public messageStr: string;
  public tagsCannedFilter: Array<any> = [];
  public SHOW_CANNED_RESPONSES: boolean = false
  public canShowCanned: boolean = true

  public SHOW_COPILOT_SUGGESTIONS: boolean = false;

  public window: any = window
  public styleMap: Map<string, string> = new Map()

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS


  public_Key: any;
  areVisibleCAR: boolean;
  isCopilotEnabled: boolean;
  supportMode: boolean;
  isEmailEnabled: boolean;
  offlineMsgEmail: boolean;
  isWhatsappTemplatesEnabled: boolean;
  fileUploadAccept: string;
  //SOUND
  setTimeoutSound: any;
  audio: any;
  USER_HAS_OPENED_CLOSE_INFO_CONV: boolean = false;
  isHovering: boolean = false;
  conversation_count: number;
  showSpinner: boolean = true;
  dropEvent: any;
  conversation: ConversationModel;
  USER_ROLE: string;

  /**COPILOT : start */
  copilotQuestion: string = '';
  /**COPILOT : end */

  isMine = isMine
  isInfo = isInfo
  isFirstMessage = isFirstMessage
  messageType = messageType
  // info_content_child_enabled: boolean = false
  private logger: LoggerService = LoggerInstance.getInstance();

  public isOnline: boolean = true;
  public checkInternet: boolean;
  public msgCount: number;
  public disableTextarea: boolean;
  appsidebarIsWide: boolean;

  // ========== begin:: typying =======
  public isTypings = false;
  public isDirect = false;
  public idUserTypingNow: string;
  public nameUserTypingNow: string;
  private setTimeoutWritingMessages;
  membersConversation = ['SYSTEM'];
  // ========== end:: typying =======

  /**
   * Constructor
   * @param route
   * @param chatManager
   * @param actionSheetCtrl
   * @param platform
   * @param customTranslateService
   * @param appConfigProvider
   * @param modalController
   * @param typingService
   * @param tiledeskAuthService
   * @param conversationsHandlerService
   * @param archivedConversationsHandlerService
   * @param conversationHandlerService
   * @param groupService
   * @param contactsService
   * @param conversationHandlerBuilderService
   * @param linkifyService
   * @param logger
   * @param cannedResponsesService
   * @param imageRepoService
   * @param presenceService
   * @param toastController
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public chatManager: ChatManager,
    public actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    private customTranslateService: CustomTranslateService,
    public appConfigProvider: AppConfigProvider,
    public modalController: ModalController,
    public typingService: TypingService,
    public tiledeskAuthService: TiledeskAuthService,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsHandlerService: ArchivedConversationsHandlerService,
    public conversationHandlerService: ConversationHandlerService,
    public groupService: GroupsHandlerService,
    public contactsService: ContactsService,
    public conversationHandlerBuilderService: ConversationHandlerBuilderService,
    public cannedResponsesService: CannedResponsesService,
    public imageRepoService: ImageRepoService,
    public presenceService: PresenceService,
    public toastController: ToastController,
    public tiledeskService: TiledeskService,
    public projectService: ProjectService,
    private networkService: NetworkService,
    private events: EventsService,
    private webSocketService: WebsocketService,
    public projectPlanUtils: ProjectPlanUtils,
    private g: Globals,
  ) {
    // Change list on date change
    this.route.paramMap.subscribe((params) => {
      this.logger.log('[CONVS-DETAIL] - constructor -> params: ', params)
      this.conversationWith = params.get('IDConv')
      this.conversationWithFullname = params.get('FullNameConv')
      this.conv_type = params.get('Convtype')

      this.events.publish('supportconvid:haschanged', this.conversationWith)
    })


  }

  // -----------------------------------------------------------
  // @ Lifehooks
  // -----------------------------------------------------------
  ngOnInit() {
    this.logger.log('[CONVS-DETAIL] > ngOnInit - window.location: ', window.location);

    this.getConversations();
    this.watchToConnectionStatus();
    this.getOSCODE();
    this.listenToEventServiceEvents();
    this.listenToDsbrdPostMsgs();
  }

  listenToDsbrdPostMsgs() {

    window.addEventListener("message", (event) => {
      // this.logger.log("[CONVS-DETAIL] message event ", event);

      // const chat21InfoConversationEle = <HTMLElement>document.querySelector('#chat21-info-conversation');
      // console.log('[CONVS-DETAIL] HAS CLICKED ENLARGE SIDEBAR WIDE chat21InfoConversationEle ', chat21InfoConversationEle)

      // const chatAreaEle = <HTMLElement>document.querySelector('#chatArea');
      // console.log('[CONVS-DETAIL] HAS CLICKED ENLARGE SIDEBAR WIDE chatAreaEle ', chatAreaEle)

      if (event && event.data && event.data.action && event.data.action === 'openAppsSidebarWideMode' && event.data.parameter === true) {
        this.logger.log('[CONVS-DETAIL] openAppsSidebarWideMode EVENT-> open')
        this.appsidebarIsWide = true
        // chat21InfoConversationEle.classList.add("info-convs-apps-sidebar-wide");
        // chatAreaEle.classList.add("chat-area-apps-sidebar-wide");
      }

      if (event && event.data && event.data.action && event.data.action === 'openAppsSidebarWideMode' && event.data.parameter === false) {
        this.logger.log('[CONVS-DETAIL] openAppsSidebarWideMode EVENT-> close')
        this.appsidebarIsWide = false
        // chat21InfoConversationEle.classList.remove("info-convs-apps-sidebar-wide");
        // chatAreaEle.classList.remove("chat-area-apps-sidebar-wide");
      }

      if (event && event.data && event.data.action && event.data.action === 'closeAppsSidebarWideMode' && event.data.parameter === true) {
        this.logger.log('[CONVS-DETAIL] closeAppsSidebarWideMode EVENT-> close')
        this.appsidebarIsWide = false
        // chat21InfoConversationEle.classList.remove("info-convs-apps-sidebar-wide");
        // chatAreaEle.classList.remove("chat-area-apps-sidebar-wide");
      }
    })
  }


  listenToEventServiceEvents() {
    this.events.subscribe('storage:last_project', project => {
      this.logger.log('[CONVS-DETAIL] stored_project ', project)
      if (project && project !== 'undefined') {
        this.USER_ROLE = project.role;
        this.logger.log('[CONVS-DETAIL]  USER_ROLE ', this.USER_ROLE)
      }
    });

    this.events.subscribe('copilot:new_question', data => {
      this.logger.log('[CONVS-DETAIL] copilot:new_question ', data)
      if(data?.text){
        this.copilotQuestion = data.text
        this.SHOW_COPILOT_SUGGESTIONS = !this.SHOW_COPILOT_SUGGESTIONS
      }
    })
  }

  getConversations() {
    this.conversationsHandlerService.conversationAdded.subscribe((conv) => {
      // console.log('[CONVS-DETAIL]  - conv  ', conv)
      const conversations = this.conversationsHandlerService.conversations
      // console.log('[CONVS-DETAIL] conversations', conversations);
      this.conversation_count = conversations.length
    })

    this.conversationsHandlerService.conversationChanged.subscribe((conv) => {
      // console.log('[CONVS-DETAIL]  - conv  ', conv)
      const conversations = this.conversationsHandlerService.conversations
      // console.log('[CONVS-DETAIL] conversations', conversations);
      this.conversation_count = conversations.length
      if (conv && this.loggedUser && conv.sender !== this.loggedUser.uid) {
        this.logger.log('[CONVS-DETAIL] subscribe to BSConversationsChange ', conv)
        this.logger.log('[CONVS-DETAIL] subscribe to BSConversationsChange this.loggedUser.uid ', this.loggedUser.uid)
        // UPDATE THE CONVERSATION TO 'READ' IF IT IS ME WHO WRITES THE LAST MESSAGE OF THE CONVERSATION
        // AND IF THE POSITION OF THE SCROLL IS AT THE END
        // if (!this.showButtonToBottom && conv.is_new) {
        //   // ARE AT THE END
        //   this.updateConversationBadge()
        // }
        if (conv.uid && conv.uid === this.conversationWith) {
          this.conversationAvatar = setConversationAvatar(
            conv.conversation_with,
            conv.conversation_with_fullname,
            conv.channel_type,
            null,
            conv.attributes['projectId'],
            conv.attributes['project_name'],
            conv.attributes['request_channel'])
        }

      }
    })

    this.conversationsHandlerService.conversationRemoved.subscribe((conv) => {
      // console.log('[CONVS-DETAIL]  - conv  ', conv)
      const conversations = this.conversationsHandlerService.conversations
      // console.log('[CONVS-DETAIL] conversations', conversations);
      this.conversation_count = conversations.length
      this.logger.log('[CONVS-DETAIL] conversation_count', this.conversation_count)
    })

    setTimeout(() => {
      this.showSpinner = false
    }, 3000)
  }

  getOSCODE() {
    this.supportMode = this.g.supportMode;
    this.logger.log('[CONVS-DETAIL] AppConfigService getAppConfig supportMode', this.supportMode)
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log('[CONVS-DETAIL] AppConfigService getAppConfig public_Key', this.public_Key)

    if (this.public_Key) {
      let keys = this.public_Key.split('-')
      this.logger.log('[CONVS-DETAIL] PUBLIC-KEY - public_Key keys', keys)

      keys.forEach((key) => {
        if (key.includes('CAR')) {
          let car = key.split(':')
          if (car[1] === 'F') {
            this.areVisibleCAR = false
            this.logger.log('[CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR', this.areVisibleCAR)
          } else {
            this.areVisibleCAR = true
            this.logger.log('[CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR', this.areVisibleCAR)
          }
        }
      })

      if (!this.public_Key.includes('CAR')) {
        this.areVisibleCAR = false
        this.logger.log('[CONVS-DETAIL] PUBLIC-KEY - areVisibleCAR', this.areVisibleCAR)
      }
    } else {
      this.areVisibleCAR = false
    }
  }

  watchToConnectionStatus() {
    this.networkService.checkInternetFunc().subscribe((isOnline) => {
      this.checkInternet = isOnline
      // console.log('[CONVS-LIST-PAGE] - watchToConnectionStatus - isOnline', this.checkInternet)

      // checking internet connection
      if (this.checkInternet == true) {
        this.isOnline = true
      } else {
        this.isOnline = false
      }
    })
  }

  ngAfterViewInit() {
    this.logger.log('[CONVS-DETAIL] > ngAfterViewInit')
  }

  ngOnDestroy() {
    this.logger.log('[CONVS-DETAIL] > ngOnDestroy')
  }

  ngOnChanges() {
    this.logger.log('[CONVS-DETAIL] > ngOnChanges')
  }

  ionViewWillEnter() {
    // this.info_content_child_enabled = true;
    this.logger.log('[CONVS-DETAIL] TEST > ionViewWillEnter - convId ', this.conversationWith)
    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
    this.logger.log('[CONVS-DETAIL] ionViewWillEnter loggedUser: ', this.loggedUser)
    this.listnerStart()
  }

  ionViewDidEnter() {
    this.logger.log('[CONVS-DETAIL] > ionViewDidEnter')
    // this.info_content_child_enabled = true;
  }

  // Unsubscibe when new page transition end
  ionViewWillLeave() {
    this.logger.log('[CONVS-DETAIL] > ionViewWillLeave')

    // this.logger.log('[CONVS-DETAIL] > ionViewWillLeave info_content_child ', this.info_content_child)
    // if (this.info_content_child) {
    //   this.logger.log('[CONVS-DETAIL] > HERE YES')
    //   this.info_content_child.destroy();
    // }

    // this.logger.log('[CONVS-DETAIL] TEST > ionViewWillLeave info_content_child_enabled ', this.info_content_child_enabled , 'convId ', this.conversationWith)
    this.unsubescribeAll()
  }

  // reloadTree() {
  //   this.info_content_child_enabled = false;
  //   // now notify angular to check for updates
  //   this.changeDetector.detectChanges();
  //   // change detection should remove the component now
  //   // then we can enable it again to create a new instance
  //   this.info_content_child_enabled = true;
  // }

  private listnerStart() {
    const that = this
    this.chatManager.BSStart.subscribe((data: any) => {
      this.logger.log('[CONVS-DETAIL] - BSStart data:', data)
      if (data) {
        that.initialize()
      }
    })
  }

  // --------------------------------------------------
  //  @ Inizialize
  // --------------------------------------------------
  initialize() {

    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
    this.logger.log('[CONVS-DETAIL] - initialize -> loggedUser: ', this.loggedUser)
    this.translations()
    this.setStyleMap()
    // this.conversationSelected = localStorage.getItem('conversationSelected');
    this.showButtonToBottom = false
    this.showMessageWelcome = false

    const appconfig = this.appConfigProvider.getConfig()
    this.tenant = appconfig.firebaseConfig.tenant;
    this.logger.log('[CONVS-DETAIL] - initialize -> firebaseConfig tenant ', this.tenant)

    this.logger.log('[CONVS-DETAIL] - initialize -> conversationWith: ', this.conversationWith, ' -> conversationWithFullname: ', this.conversationWithFullname)
    this.subscriptions = []
    this.setHeightTextArea()

    this.messages = [] // list messages of conversation
    this.isFileSelected = false // indicates if a file has been selected (image to upload)
    this.isEmailEnabled = (this.appConfigProvider.getConfig().emailSection === 'true' || this.appConfigProvider.getConfig().emailSection === true) ? true : false;
    this.isWhatsappTemplatesEnabled = (this.appConfigProvider.getConfig().whatsappTemplatesSection === 'true' || this.appConfigProvider.getConfig().whatsappTemplatesSection === true) ? true : false;

    this.cannedResponsesService.initialize(appconfig.apiUrl)

    if (checkPlatformIsMobile()) {
      this.isMobile = true
      // this.openInfoConversation = false; // indica se è aperto il box info conversazione
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
    } else {
      this.isMobile = false
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
      // this.openInfoConversation = true;
    }

    if (this.isMobile === false) {
      if (checkWindowWidthIsLessThan991px()) {
        this.logger.log('[CONVS-DETAIL] - initialize -> checkWindowWidthIsLessThan991px ', checkWindowWidthIsLessThan991px())
        this.openInfoConversation = false // indica se è aperto il box info conversazione
        this.logger.log('[CONVS-DETAIL] - initialize -> openInfoConversation ', this.openInfoConversation)
      } else {
        this.logger.log('[CONVS-DETAIL] - initialize -> checkWindowWidthIsLessThan991px ', checkWindowWidthIsLessThan991px())
        this.openInfoConversation = true
        this.logger.log('[CONVS-DETAIL] - initialize -> openInfoConversation ', this.openInfoConversation)
      }
    }

    // init handler vengono prima delle sottoscrizioni!
    // this.initConversationsHandler(); // nk
    if (this.conversationWith) {
      this.disableTextarea = false
      this._getProjectIdByConversationWith(this.conversationWith)
      this.initConversationHandler()
      this.initGroupsHandler();
      this.startConversation();
      this.initSubscriptions();
      this.getLeadDetail();
      this.initializeTyping();
    }
    this.addEventsKeyboard()
    this.updateConversationBadge() // AGGIORNO STATO DELLA CONVERSAZIONE A 'LETTA' (is_new = false)

  }

  _getProjectIdByConversationWith(conversationWith: string) {
    if (this.channelType !== TYPE_DIRECT && !this.conversationWith.startsWith('group-')) {
      this.tiledeskService.getProjectIdByConvRecipient(conversationWith).subscribe((res) => {
        this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT RES + projectId', res, res.id_project)
        if (res) {
          const projectId = res.id_project
          this.getProjectById(projectId)
        }
      }, (error) => {
        this.logger.error('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT - ERROR  ',conversationWith,  error)
      }, () => {
        this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *',)
      })
    }else {
      this.canShowCanned = false;
      this.offlineMsgEmail = false;
    }
    
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe(async (project) => {
      this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT RES', project)
      if (project) {
        const projectId = project.id_project
        this.canShowCanned = this.projectPlanUtils.checkPlanIsExpired(project)
        this.offlineMsgEmail = this.checkOfflineMsgEmailIsEnabled(project)
        this.isCopilotEnabled = this.projectPlanUtils.checkProjectProfileFeature(project, 'copilot');
        this.fileUploadAccept = this.checkAcceptedUploadFile(project)
      }
    }, (error) => {
      this.logger.error('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
      if ((error.error.msg = 'you dont belong to the project.')) {
        this.disableTextarea = true
      }
    }, () => {
      this.logger.log('[CONVS-DETAIL] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
    })
  }


  checkOfflineMsgEmailIsEnabled(project: Project): boolean {
    let check: boolean = true

    //case: check emailSection env variable 
    if(!this.isEmailEnabled){
      return check= false
    }

    //case: check offlineMsgEmail project property
    if(project && project.hasOwnProperty('offlineMsgEmail')){
      check = project.offlineMsgEmail
    }

    return check
  }

  checkAcceptedUploadFile(project: Project): string {

    if(project && project?.settings?.allowed_upload_extentions){
      return this.g.fileUploadAccept = project?.settings?.allowed_upload_extentions
    }

    return this.appConfigProvider.getConfig().fileUploadAccept
  }

  // getProjectIdSelectedConversation(conversationWith: string): string{
  //   const conversationWith_segments = conversationWith.split('-')
  //   // Removes the last element of the array if is = to the separator
  //   if (conversationWith_segments[conversationWith_segments.length - 1] === '') {
  //     conversationWith_segments.pop()
  //   }

  //   this.logger.log('[CONVS-DETAIL] - getProjectIdSelectedConversation conversationWith_segments ', conversationWith_segments)
  //   let projectId = ''
  //   if (conversationWith_segments.length === 4) {
  //     projectId = conversationWith_segments[2]
  //     this.logger.log('[CONVS-DETAIL] - getProjectIdSelectedConversation projectId ', projectId)
  //   }
  //   return projectId
  // }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth
    if (newInnerWidth < 991) {
      if (this.USER_HAS_OPENED_CLOSE_INFO_CONV === false) {
        this.openInfoConversation = false
      }
    }
  }

  // --------------------------------------------------------
  // translations
  // translationMap passed to components in the html file
  // --------------------------------------------------------
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

      'ID_CONVERSATION',
      'UPLOAD_FILE_ERROR',
      'LABEL_ENTER_MSG',
      'LABEL_ENTER_MSG_SHORT',
      'LABEL_ENTER_MSG_SHORTER',
      'ONLY_IMAGE_FILES_ARE_ALLOWED_TO_PASTE',
      'FAILED_TO_UPLOAD_THE_FORMAT_IS_NOT_SUPPORTED',
      'NO_INFORMATION_AVAILABLE',
      'CONTACT_ID',

      'UPLOAD',
      'CANNED_RESPONSES',
      'NO_CANNED_RESPONSES',
      'YES_CANNED_RESPONSES',
      'THERE_ARE_NO_CANNED_RESPONSES_AVAILABLE',
      'TO_CREATE_THEM_GO_TO_THE_PROJECT',
      "AddNewCannedResponse",
      "LABEL_LOADING",
      "DIRECT_CHAT",
      "GROUP_CHAT",

      "LABEL_CHAT",
      "LABEL_EMAIL",
      "LABEL_SEND",
      "EMAIL.EMAIL_OFFLINE_TIP",
      "EMAIL.LABEL_TOOLTIP",
      "EMAIL.EMAIL_PLACEHOLDER",
      "EMAIL.EMAIL_NOT_FOUND_PLACEHOLDER",
      "EMAIL.SUBJECT",
      "EMAIL.MESSAGE",
      "EMAIL.MESSAGE_PLACEHOLDER",
      "EMAIL.SEND_EMAIL_SUCCESS",
      "EMAIL.SEND_EMAIL_ERROR",
      "EMAIL.SUBJECT_OFFLINE_MESSAGE",
      "EMAIL.SEND_EMAIL_SUCCESS_OFFLINE_MESSAGE",

      "WHATSAPP.LABEL_TEMPLATES",
      "WHATSAPP.LABEL_TOOLTIP",
      "WHATSAPP.SELECT_MESSAGE_TEMPLATE",
      "WHATSAPP.ERROR_WHATSAPP_NOT_INSTALLED",
      "WHATSAPP.ERROR_WHATSAPP_GENERIC_ERROR",

      "COPILOT.ASK_AI",
      "COPILOT.NO_SUGGESTIONS_PRESENT",

      "EMOJI_NOT_ELLOWED",
      "DOMAIN_NOT_ALLOWED",
      
    ]

    const keysHeader = [
      'DIRECT_CHAT',
      'GROUP_CHAT',
      'LABEL_IS_WRITING',
      'LABEL_ONLINE',
      'LABEL_OFFLINE',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_TO',
      'LABEL_LAST_ACCESS',
      'ARRAY_DAYS',
      'LIVE',
      'Resolve',
      'COPILOT.SOLVE_WITH_AI'
    ]

    const keysContentDetail = [
      'LABEL_OPEN_INFO_CONVERSATION',
      'LABEL_CLOSE_GROUP',
      'LABEL_IS_WRITING',
      'COPY',
      'COPY_MESSAGE_TOAST'
    ]

    const keysContentInfo = [
      'LABEL_INFO_ADVANCED',
      'USER_ID'
    ]

    this.translationsMap = this.customTranslateService.translateLanguage(keys)
    this.translationsHeaderMap = this.customTranslateService.translateLanguage(keysHeader)
    this.translationsContentMap = this.customTranslateService.translateLanguage(keysContentDetail)
    this.translationsInfoConversationMap = this.customTranslateService.translateLanguage(keysContentInfo)
    this.logger.log('[CONVS-DETAIL] x this.translationMap ', this.translationsMap)
  }

  // --------------------------------------------------------
  // setTranslationMapForConversationHandler
  // --------------------------------------------------------
  private setTranslationMapForConversationHandler(): Map<string, string> {
    const keys = [
      'INFO_SUPPORT_USER_ADDED_SUBJECT',
      'INFO_SUPPORT_USER_ADDED_YOU_VERB',
      'INFO_SUPPORT_USER_ADDED_COMPLEMENT',
      'INFO_SUPPORT_USER_ADDED_VERB',
      'INFO_SUPPORT_CHAT_REOPENED',
      'INFO_SUPPORT_CHAT_CLOSED',
      'INFO_A_NEW_SUPPORT_REQUEST_HAS_BEEN_ASSIGNED_TO_YOU',
      'INFO_SUPPORT_LEAD_UPDATED',
      'INFO_SUPPORT_MEMBER_LEFT_GROUP',
      'INFO_SUPPORT_MEMBER_ABANDONED_GROUP',
      'INFO_SUPPORT_LIVE_PAGE',
      'LABEL_TODAY',
      'LABEL_TOMORROW',
      'LABEL_LAST_ACCESS',
      'LABEL_TO',
      'ARRAY_DAYS',
    ]
    return this.customTranslateService.translateLanguage(keys)
  }
  private setStyleMap() {
    // this.styleMap.set('themeColor', 'var(--basic-blue)')
    //               .set('bubbleReceivedBackground','var(--bck-msg-received)')
    //               .set('bubbleReceivedTextColor', 'var(--col-msg-received)')
    //               .set('bubbleSentBackground', 'var(--bck-msg-sent)')
    //               .set('bubbleSentTextColor', 'var(--col-msg-sent)')
    //               .set('buttonFontSize','var(--button-in-msg-font-size)')
    //               .set('buttonBackgroundColor', 'var(--buttonBackgroundColor)')
    //               .set('buttonTextColor', 'var(--buttonTextColor)')
    //               .set('buttonHoverBackgroundColor', 'var(--buttonHoverBackgroundColor)')
    //               .set('buttonHoverTextColor', 'var(--buttonHoverTextColor)')
    this.styleMap.set('themeColor', 'var(--basic-blue)')
                  .set('bubbleReceivedBackground', 'var(--bck-msg-received)')
                  .set('bubbleReceivedTextColor', 'var(--col-msg-received)')
                  .set('bubbleSentBackground', 'var(--bck-msg-sent)')
                  .set('bubbleSentTextColor', 'var(--col-msg-sent)')
                  .set('buttonFontSize', 'var(--button-in-msg-font-size)')
                  .set('buttonBackgroundColor', 'var(--buttonBackgroundColor)')
                  .set('buttonTextColor', 'var(--buttonTextColor)')
                  .set('buttonHoverBackgroundColor', 'var(--buttonHoverBackgroundColor)')
                  .set('buttonHoverTextColor', 'var(--buttonHoverTextColor)')

  }
  // -------------------------------------------------------------------------------------
  // * retrieving the handler from chatManager
  // * if it DOESN'T EXIST I create a handler and connect and store it in the chatmanager
  // * if IT EXISTS I connect
  // * Upload the messages
  // * I wait x sec if no messages arrive I display msg wellcome
  // -------------------------------------------------------------------------------------
  initConversationHandler() {
    const translationMap = this.setTranslationMapForConversationHandler()
    this.showMessageWelcome = false
    const handler: ConversationHandlerService = this.chatManager.getConversationHandlerByConversationId(this.conversationWith)
    this.logger.log('[CONVS-DETAIL] - initConversationHandler - handler ', handler, ' conversationWith ', this.conversationWith)
    if (!handler) {
      this.conversationHandlerService = this.conversationHandlerBuilderService.build()
      this.conversationHandlerService.initialize(
        this.conversationWith,
        this.conversationWithFullname,
        this.loggedUser,
        this.tenant,
        translationMap,
      )
      this.conversationHandlerService.connect()
      this.logger.log('[CONVS-DETAIL] - initConversationHandler - NEW handler - conversationHandlerService', this.conversationHandlerService)
      this.messages = this.conversationHandlerService.messages
      this.logger.log('[CONVS-DETAIL] - initConversationHandler - messages: ', this.messages)
      this.chatManager.addConversationHandler(this.conversationHandlerService)

      // // wait 8 second and then display the message if there are no messages
      const that = this
      this.logger.log('[CONVS-DETAIL] - initConversationHandler that.messages  ', that.messages)
      this.logger.log('[CONVS-DETAIL] - initConversationHandler that.messages.length  ', that.messages.length)
      this.msgCount = that.messages.length
      setTimeout(() => {
        if (!that.messages || that.messages.length === 0) {
          this.showIonContent = true
          that.showMessageWelcome = true
          this.logger.log('[CONVS-DETAIL] - initConversationHandler - showMessageWelcome: ', that.showMessageWelcome)
        }
      }, 8000)
    } else {
      this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - conversationHandlerService ', this.conversationHandlerService, ' handler', handler)
      this.conversationHandlerService = handler
      this.messages = this.conversationHandlerService.messages
      this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - this.messages: ', this.messages)
      this.logger.log('[CONVS-DETAIL] - initConversationHandler (else) - this.showMessageWelcome: ', this.showMessageWelcome)
    }
  }

  initGroupsHandler() {
    if (this.conversationWith.startsWith('support-group') || this.conversationWith.startsWith('group-')) {
      this.groupService.initialize(this.tenant, this.loggedUser.uid)
      this.logger.log('[CONVS-DETAIL] - initGroupsHandler - tenant', this.tenant, ' loggedUser UID', this.loggedUser.uid)
    }
  }

  private setAttributes(): any {
    const attributes: any = {
      client: navigator.userAgent,
      sourcePage: location.href
    }

    //TODO: servono ???
    // if (this.loggedUser && this.loggedUser.email) {
    //   attributes.userEmail = this.loggedUser.email
    // }
    // if (this.loggedUser && this.loggedUser.fullname) {
    //   attributes.userFullname = this.loggedUser.fullname
    // }

    return attributes
  }

  // ---------------------------------
  // startConversation
  // ---------------------------------
  startConversation() {
    //  console.log( '[CONVS-DETAIL] - startConversation conversationWith: ', this.conversationWith )
    if (this.conversationWith) {
      this.channelType = setChannelType(this.conversationWith)
      this.logger.log('[CONVS-DETAIL] - startConversation channelType : ', this.channelType)
      // this.selectInfoContentTypeComponent();
      this.setHeaderContent()
    }
  }

  onConversationLoaded(conversation): ConversationModel {
    if (conversation.attributes && conversation.attributes['projectId']) {
      let project = localStorage.getItem(conversation.attributes['projectId'])
      if (project) {
        project = JSON.parse(project)
        conversation.attributes.project_name = project['name']
      }

    } else if (conversation.attributes) {
      const projectId = getProjectIdSelectedConversation(this.conversationWith)
      let project = localStorage.getItem(projectId)
      if (project) {
        project = JSON.parse(project)
        conversation.attributes.projectId = project['_id']
        conversation.attributes.project_name = project['name']
      }
    }
    return conversation
  }

  setHeaderContent() {
    //   this.logger.log('[CONVS-DETAIL] - setHeaderContent conversationWith', this.conversationWith)
    //   this.logger.log('[CONVS-DETAIL] - setHeaderContent conversationsHandlerService', this.conversationsHandlerService)
    //   this.logger.log('[CONVS-DETAIL] - setHeaderContent conv_type', this.conv_type)
    if (this.conversationWith && this.conversationsHandlerService && (this.conv_type === 'active' || this.conv_type === 'new')) {
      this.logger.log('[CONVS-DETAIL] - setHeaderContent getConversationDetail CALLING')
      this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
        this.logger.debug('[CONV-COMP] setHeaderContent getConversationDetail: conversationsHandlerService ', this.conversationWith, conv, this.conv_type)
        if (conv) {
          this.conversation = this.onConversationLoaded(conv)
          this.conversationAvatar = setConversationAvatar(
            conv.conversation_with,
            conv.conversation_with_fullname,
            conv.channel_type,
            null,
            conv.attributes['projectId'],
            conv.attributes['project_name'],
            conv.attributes['request_channel']
          )
        }
        if (!conv) {
          this.logger.debug('[CONV-COMP] setHeaderContent getConversationDetail: conv not exist --> search in archived list', this.conversationWith, this.conv_type)
          this.archivedConversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
            this.logger.debug('[CONV-COMP] setHeaderContent getConversationDetail: archivedConversationsHandlerService', this.conversationWith, conv)
            if (conv) {
              this.logger.log('[CONVS-DETAIL] - setHeaderContent getConversationDetail (archived)', this.conversationWith, 'CONVS', conv)
              this.conversation = this.onConversationLoaded(conv)
              this.conversationAvatar = setConversationAvatar(
                conv.conversation_with,
                conv.conversation_with_fullname,
                conv.channel_type,
                null,
                conv.attributes['projectId'],
                conv.attributes['project_name'],
                conv.attributes['request_channel']
              )
              let duration = getDateDifference(conv.timestamp, Date.now())
              duration.days > 10 && conv.channel_type !== TYPE_DIRECT ? this.disableTextarea = true : this.disableTextarea = false
            }
          })
        }
        this.logger.log('[CONVS-DETAIL] - setHeaderContent > conversationAvatar: ', this.conversationAvatar)
      })
    } else {
      //get conversation from 'archived-conversations' firebase node
      this.logger.debug('[CONV-COMP] setHeaderContent getConversationDetail: archivedConversationsHandlerService', this.conversationWith, this.conv_type)
      this.archivedConversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
        if (conv) {
          this.conversation = this.onConversationLoaded(conv)
          this.conversationAvatar = setConversationAvatar(
            conv.conversation_with,
            conv.conversation_with_fullname,
            conv.channel_type,
            null,
            conv.attributes['projectId'],
            conv.attributes['project_name'],
            conv.attributes['request_channel']
          )
          let duration = getDateDifference(conv.timestamp, Date.now())
          duration.days > 10 && conv.channel_type !== TYPE_DIRECT ? this.disableTextarea = true : this.disableTextarea = false
        }
        if (!conv) {
          this.conversationsHandlerService.getConversationDetail(this.conversationWith, (conv) => {
            if (conv) {
              this.conversation = this.onConversationLoaded(conv)
              this.conversationAvatar = setConversationAvatar(
                conv.conversation_with,
                conv.conversation_with_fullname,
                conv.channel_type,
                null,
                conv.attributes['projectId'],
                conv.attributes['project_name'],
                conv.attributes['request_channel']
              )
            }
            this.logger.log('[CONVS-DETAIL] - setHeaderContent > conversationAvatar: ', this.conversationAvatar)
          })
        }
      })
    }

    // this.conversationAvatar = setConversationAvatar(
    //   this.conversationWith,
    //   this.conversationWithFullname,
    //   this.channelType
    // );
    // this.logger.log('[CONVS-DETAIL] - setHeaderContent > conversationAvatar: ', this.conversationAvatar);
  }


  getLeadDetail() {
    const that = this;
    if (this.channelType !== TYPE_DIRECT && !this.conversationWith.startsWith('group-')) {
      const projectId = getProjectIdSelectedConversation(this.conversationWith)
      this.logger.debug('[CONVS-DETAIL] getLeadDetail - section ', projectId)
      this.tiledeskService.getRequest(this.conversationWith, projectId).subscribe((request: any) => {
        that.logger.debug('[CONVS-DETAIL] getLeadDetail - selected REQUEST detail', request)
        if(request && request.channel){
          this.conversation.attributes['request_channel'] = request.channel.name
        } 
        if (request.lead && request.lead.email) { //LEAD has an email
          that.leadInfo = {
            lead_id: request.lead.lead_id,
            hasEmail: true,
            email: request.lead.email,
            projectId: projectId,
            presence: {
              status: 'offline'
            }
          }
          that.presenceService.userIsOnline(this.leadInfo.lead_id);
          that.webSocketService.subscribeToWS_RequesterPresence(projectId, that.leadInfo.lead_id)
        } else{ // LEAD not has an email
          that.leadInfo = {
            lead_id: request.lead.lead_id,
            hasEmail: false,
            email: null,
            projectId: projectId,
            presence: {
              status: 'offline'
            }
          }
        }
      }, (error) => {
        this.logger.error('[CONVS-DETAIL] - getLeadDetail - GET REQUEST DETAIL - ERROR  ', error)
      }, () => {
        this.logger.debug('[CONVS-DETAIL] - getLeadDetail - GET REQUEST DETAIL * COMPLETE *')
      })
    }

  }

  createEmailText(lastMessageText: string): string {
    let lastDate = new Date().toDateString();
    let lastTime = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
    let text = 'On _' + lastDate + ' - ' + lastTime + '_ **' + this.loggedUser.fullname.trimEnd() + '**' + ' replied to you' + ': ' + '\n' +
            lastMessageText + '\n\n\n'
    
    //ADD CONVERSATION HISTORRY TO THE BODY OF THE EMAIL
    let messages = JSON.parse(JSON.stringify(this.messages))
    messages.reverse().forEach((message, index) => {

      let date = new Date(message.timestamp).toDateString()
      let time = new Date(message.timestamp).getHours() + ':' + new Date(message.timestamp).getMinutes() + ':' + new Date(message.timestamp).getSeconds()
      if (isInfo(message))
        return;
      // if (index === 0)
      //   text += 'On _' + date + ' - ' + time + '_ **' + message.sender_fullname.trimEnd() + '**' + ' replied to you' + ': ' + '\n' +
      //     message.text + '\n\n\n'
      if (index === 0)
        text += '_______________________________________________' + '\n' +
          '**' + 'CONVERSATION HISTORY:' + '**' + '\n' +
          '**' + message.sender_fullname.trimEnd() + '**' + ': ' + message.text + ' _(' + date + '-' + time + ')_' + '\n'
      if (index > 0)
        text += '**' + message.sender_fullname.trimEnd() + '**' + ': ' + message.text + ' _(' + date + '-' + time + ')_' + '\n'
    })

    return text
  }

  sendEmail(message: string): Observable<boolean> {
    const emailFormGroup = {
      subject: this.translationsMap.get('EMAIL.SUBJECT_OFFLINE_MESSAGE'),
      text: message
    }
    let status = new Subject<boolean>();
    this.tiledeskService.sendEmail(this.leadInfo.projectId, this.conversationWith, emailFormGroup).subscribe((res) => {
      this.logger.debug('[SEND-EMAIL-MODAL] subscribe to sendEmail API response -->', res)
      if (res && res.queued) {
        this.presentToast(this.translationsMap.get('EMAIL.SEND_EMAIL_SUCCESS_OFFLINE_MESSAGE'), 'success', '', 2000)
        status.next(true)
      }
    }, (error) => {
      this.logger.error('[SEND-EMAIL-MODAL] subscribe to sendEmail API CALL  - ERROR  ', error)
      this.presentToast(this.translationsMap.get('EMAIL.SEND_EMAIL_ERROR'), 'danger', '', 2000)
      status.next(false)
    }, () => {
      this.logger.log('[SEND-EMAIL-MODAL] subscribe to sendEmail API CALL /* COMPLETE */')
    })
    return status.asObservable();
  }

  returnSendMessage(e: any) {
    this.logger.log('[CONVS-DETAIL] - returnSendMessage event', e, ' - conversationWith', this.conversationWith)
    try {
      let message = ''
      if (e.msg) {
        message = e.msg
      }
      const type = e.type
      const metadata = e.metadata
      const attributes = e.attributes
      this.sendMessage(message, type, metadata, attributes)
    } catch (err) {
      this.logger.error('[CONVS-DETAIL] - returnSendMessage error: ', err)
    }
  }

  /**
   * SendMessage
   * @param msg
   * @param type
   * @param metadata
   * @param additional_attributes
   */
  sendMessage(msg: string, type: string, metadata?: any, additional_attributes?: any) {
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - MSG: ', msg)
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - type: ', type)
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - metadata: ', metadata)
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE - additional_attributes: ', additional_attributes)
    let firstname = this.loggedUser.uid
    if (this.loggedUser.fullname) {
      firstname = this.loggedUser.firstname
    }

    const g_attributes = this.setAttributes()
    // added <any> to resolve the Error occurred during the npm installation: Property 'userFullname' does not exist on type '{}'
    const attributes = <any>{}
    if (g_attributes) {
      for (const [key, value] of Object.entries(g_attributes)) {
        attributes[key] = value
      }
    }
    if (additional_attributes) {
      for (const [key, value] of Object.entries(additional_attributes)) {
        attributes[key] = value
      }
    }
    // || type === 'image'
    if (type === 'file') {
      if (msg) {
        // msg = msg + '<br>' + 'File: ' + metadata.src;
        msg = `[${metadata.name}](${metadata.src})` + '\n' + msg
      } else {
        // msg = 'File: ' + metadata.src;
        // msg =  `<a href=${metadata.src} download>
        //   ${metadata.name}
        // </a>`

        // msg = ![file-image-placehoder](./assets/images/file-alt-solid.png) + [${metadata.name}](${metadata.src})
        msg = `[${metadata.name}](${metadata.src})`
      }
    }
    this.conversation && this.conversation.attributes && this.conversation.attributes['request_channel'] ? attributes.request_channel = this.conversation.attributes['request_channel'] : null;
    metadata ? (metadata = metadata) : (metadata = '')
    this.logger.log('[CONVS-DETAIL] - SEND MESSAGE msg: ', msg, ' - messages: ', this.messages, ' - loggedUser: ', this.loggedUser)


    const emailSectionMsg = (attributes && attributes['offline_channel'] === TYPE_MSG_EMAIL)
    const channelIsNotWeb = (attributes && attributes['request_channel'] && (attributes['request_channel'] === TYPE_MSG_EMAIL || 
                                                                                                attributes['request_channel'] === TYPE_MSG_FORM || 
                                                                                                attributes['request_channel'] === CHANNEL_TYPE.WHATSAPP || 
                                                                                                attributes['request_channel'] === CHANNEL_TYPE.MESSENGER || 
                                                                                                attributes['request_channel'] === CHANNEL_TYPE.TELEGRAM || 
                                                                                                attributes['request_channel'] === CHANNEL_TYPE.VOICE))

    if ((msg && msg.trim() !== '') || type !== TYPE_MSG_TEXT) {

      if (this.offlineMsgEmail &&
        this.leadInfo && this.leadInfo.presence && this.leadInfo.presence['status'] === 'offline' &&
        this.leadInfo.email && !emailSectionMsg && !channelIsNotWeb) {
        this.logger.log('[CONVS-DETAIL] - SEND MESSAGE --> SENDING EMAIL', msg, this.leadInfo.email)
        let msgText = this.createEmailText(msg)
        this.sendEmail(msgText).subscribe(status => {
          if (status) {
            //SEND MESSAGE ALSO AS EMAIL
            attributes['offline_channel'] = 'offline_' + TYPE_MSG_EMAIL
          }

          this.conversationHandlerService.sendMessage(
            msg,
            type,
            metadata,
            this.conversationWith,
            this.conversationWithFullname,
            this.loggedUser.uid,
            firstname,
            this.channelType,
            attributes,
          )
        })
      } else {
        //send STANDARD TEXT MESSAGE
        this.conversationHandlerService.sendMessage(
          msg,
          type,
          metadata,
          this.conversationWith,
          this.conversationWithFullname,
          this.loggedUser.uid,
          firstname,
          this.channelType,
          attributes,
        )
      }
      this.segmentNewAgentMessage(this.conversation)
    }
  }



  // ----------------------------------------------------------
  // InitSubscriptions BS subscriptions
  // ----------------------------------------------------------
  initSubscriptions() {
    this.logger.log('[CONVS-DETAIL] - initSubscriptions: ', this.subscriptions)

    const that = this
    let subscription: any
    let subscriptionKey: string

    subscriptionKey = 'messageAdded'
    subscription = this.subscriptions.find((item) => item.key === subscriptionKey)
    if (!subscription) {
      subscription = this.conversationHandlerService.messageAdded.subscribe((msg: MessageModel) => {
        this.logger.log('[CONVS-DETAIL] subscribe to messageAdded - msg ', msg)
        if (msg) {
          that.newMessageAdded(msg)
          // this.setHeaderContent()
        }
      })
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    // IS USED ?
    subscriptionKey = 'messageChanged'
    subscription = this.subscriptions.find((item) => item.key === subscriptionKey)
    if (!subscription) {
      subscription = this.conversationHandlerService.messageChanged.subscribe((msg: MessageModel) => {
        this.logger.log('[CONVS-DETAIL] subscribe to messageChanged - msg ', msg)
      })
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    subscriptionKey = 'messageRemoved'
    subscription = this.subscriptions.find((item) => item.key === subscriptionKey)
    if (!subscription) {
      subscription = this.conversationHandlerService.messageRemoved.subscribe((messageId: any) => {
        this.logger.log('[CONVS-DETAIL] subscribe to messageRemoved - messageId ', messageId)
      })
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    subscriptionKey = 'messageInfo'
    subscription = this.subscriptions.find((item) => item.key === subscriptionKey)
    if (!subscription) {
      subscription = this.conversationHandlerService.messageInfo.pipe(takeUntil(this.unsubscribe$)).subscribe((msg: MessageModel) => {
        this.logger.log('[CONVS-DETAIL] subscribe to messageInfo - messageId ', msg, this.conversation)
        if (msg) {
          that.updateLeadInfo(msg)
          that.manageInfoMessage(msg)
          // this.updateLiveInfo(msg)
          // this.setHeaderContent()
        }
      })
      const subscribe = { key: subscriptionKey, value: subscription }
      this.subscriptions.push(subscribe)
    }

    subscriptionKey = 'conversationTyping';
    subscription = this.subscriptions.find(item => item.key === subscriptionKey);
    if (!subscription) {
      subscription = this.typingService.BSIsTyping.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        this.logger.debug('[CONVS-DETAIL] ***** BSIsTyping *****', data);
        if (data) {
          const isTypingUid = data.uid; //support-group-...
          if (this.conversationWith === isTypingUid) {
            that.subscribeTypings(data);
          }
        }
      });
      const subscribe = { key: subscriptionKey, value: subscription };
      this.subscriptions.push(subscribe);
    }

    subscriptionKey = 'BSIsOnline';
    subscription = this.subscriptions.find(item => item.key === subscriptionKey);
    if (!subscription) {
      subscription = this.presenceService.BSIsOnline.subscribe((data: any) => {
        // this.logger.log('[USER-PRESENCE-COMP] $subs to BSIsOnline - data ', data);
        if (data) {
          const userId = data.uid;
          const isOnline = data.isOnline;
          if (this.leadInfo && this.leadInfo.lead_id === userId) {
            this.leadInfo.presence['status'] = isOnline ? 'online' : 'offline';
          }
        }
      });
      const subscribe = { key: subscriptionKey, value: subscription };
      this.subscriptions.push(subscribe);
    }

    // subscriptionKey = 'onGroupChange';
    // subscription = this.subscriptions.find(item => item.key === subscriptionKey);
    // if (!subscription) {
    // subscription =
    if (this.conversationWith.startsWith('group-')) {
      this.groupService.onGroupChange(this.conversationWith).pipe(takeUntil(this.unsubscribe$)).subscribe((groupDetail: any) => {
        this.groupDetail = groupDetail
        this.logger.log('[CONVS-DETAIL] subscribe to onGroupChange - groupDetail ', this.groupDetail)
      }, (error) => {
        this.logger.error('[CONVS-DETAIL] subscribe to onGroupChange  - ERROR  ', error)
      }, () => {
        this.logger.log('[CONVS-DETAIL] subscribe to onGroupChange  /* COMPLETE */')
        this.groupDetail = null
      })
    }
    // const subscribe = { key: subscriptionKey, value: subscription };
    // this.subscriptions.push(subscribe);
    // }
  }

  // -------------------------------------------------
  // addEventsKeyboard
  // -------------------------------------------------
  addEventsKeyboard() {
    window.addEventListener('keyboardWillShow', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard will Show')
    })
    window.addEventListener('keyboardDidShow', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard is Shown')
    })
    window.addEventListener('keyboardWillHide', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard will Hide')
    })
    window.addEventListener('keyboardDidHide', () => {
      this.logger.log('[CONVS-DETAIL] - Keyboard is Hidden')
    })
  }

  manageInfoMessage(msg: MessageModel){
    this.logger.log('[CONVS-DETAIL] manageInfoMessage --> ', msg)
    switch(infoMessageType(msg)){
        case INFO_MESSAGE_TYPE.MEMBER_JOINED_GROUP:
          break;
        case INFO_MESSAGE_TYPE.CHAT_REOPENED:
          break;
        case INFO_MESSAGE_TYPE.CHAT_CLOSED:
            break; 
        case INFO_MESSAGE_TYPE.LEAD_UPDATED:
          break;  
        case INFO_MESSAGE_TYPE.MEMBER_LEFT_GROUP:
          break;  
        case INFO_MESSAGE_TYPE.LIVE_PAGE:
          break;    
    }
  }

  updateLeadInfo(msg) {
    if (msg.attributes && msg.attributes.hasOwnProperty("updateUserFullname")) {
      const userFullname = msg.attributes['updateUserFullname'];
      this.logger.debug('[CONVS-DETAIL] newMessageAdded --> updateUserFullname', userFullname, this.conversation)
      this.conversationWithFullname = userFullname //update info for next sendMessage object
      //updates conversation header info
      this.conversationAvatar = setConversationAvatar(
        this.conversationWith,
        this.conversationWithFullname,
        this.channelType,
        null,
        this.conversation.attributes['projectId'],
        this.conversation.attributes['project_name'],
        this.conversation.attributes['request_channel']
      )
    }
    if (msg.attributes && msg.attributes.hasOwnProperty("updateUserEmail")) {
      const userEmail = msg.attributes['updateUserEmail'];
      this.logger.debug('[CONVS-DETAIL] newMessageAdded --> userEmail', userEmail)
      this.conversationAvatar = setConversationAvatar(
        this.conversationWith,
        this.conversationWithFullname,
        this.channelType,
        userEmail,
        this.conversation.attributes['projectId'],
        this.conversation.attributes['project_name'],
        this.conversation.attributes['request_channel']
      )
    }
    this.getLeadDetail()
  }

  updateLiveInfo(msg) {
    if (msg.attributes && msg.attributes.hasOwnProperty("sourcePage")) {
      this.liveInfo = { sourcePage: msg.attributes['sourcePage'], sourceTitle: null }
    }
    if (msg.attributes && msg.attributes.hasOwnProperty("sourceTitle")) {
      this.liveInfo = { sourcePage: msg.attributes['sourcePage'], sourceTitle: msg.attributes['sourceTitle'] }
    }
  }

  // ----------------------------------------------------------------
  // @ Unsubscribe all subscribed events (called in ionViewWillLeave)
  // ----------------------------------------------------------------
  unsubescribeAll() {
    this.logger.log('[CONVS-DETAIL] unsubescribeAll 1: ', this.subscriptions)
    if (this.subscriptions) {
      this.logger.log('[CONVS-DETAIL] unsubescribeAll 2: ', this.subscriptions)
      this.subscriptions.forEach((subscription) => {
        subscription.value.unsubscribe() // vedere come fare l'unsubscribe!!!!
      })
      this.subscriptions = []
      if (this.leadInfo) {
        this.webSocketService.unsubscribeToWS_RequesterPresence(this.leadInfo.projectId, this.leadInfo.lead_id)
      }

      // https://www.w3schools.com/jsref/met_element_removeeventlistener.asp
      window.removeEventListener('keyboardWillShow', null)
      window.removeEventListener('keyboardDidShow', null)
      window.removeEventListener('keyboardWillHide', null)
      window.removeEventListener('keyboardDidHide', null)
    }

    this.unsubscribe$.next()
    this.unsubscribe$.complete()
    // this.conversationHandlerService.dispose();
  }

  /**
   * newMessageAdded
   * @param message
   */
  newMessageAdded(message: MessageModel) {
    if (message) {
      this.logger.log('[CONVS-DETAIL] - newMessageAdded message ', message)

      if (message.isSender) {
        this.scrollBottom(0)
      } else if (!message.isSender) {
        if (this.showButtonToBottom) {
          // NON SONO ALLA FINE
          this.NUM_BADGES++
        } else {
          //SONO ALLA FINE
          this.scrollBottom(0)
        }
      }
    }
  }

  updateConversationBadge() {
    if (this.conversationWith && this.conversationsHandlerService && this.conv_type === 'active') {
      this.conversationsHandlerService.setConversationRead(this.conversationWith)
    } else if (this.conversationWith && this.archivedConversationsHandlerService && this.conv_type === 'archived') {
      this.archivedConversationsHandlerService.setConversationRead(this.conversationWith)
    }
  }

  // -----------------------------------------------------------
  // OUTPUT-EVENT handler
  // -----------------------------------------------------------
  logScrollStart(event: any) {
    this.logger.log('[CONVS-DETAIL] logScrollStart: ', event)
  }

  logScrolling(event: any) {
    // EVENTO IONIC-NATIVE: SCATTA SEMPRE, QUINDI DECIDO SE MOSTRARE O MENO IL BADGE
    // this.logger.log('[CONVS-DETAIL] logScrolling: ', event);
    this.detectBottom()
  }

  logScrollEnd(event: any) {
    // this.logger.log('[CONVS-DETAIL] logScrollEnd: ', event);
  }

  returnChangeTextArea(e: any) {
    this.logger.log('[CONVS-DETAIL] returnChangeTextArea event', e)
    try {
      let height: number = e.offsetHeight
      if (height < 50) {
        height = 50
      }

      this.heightMessageTextArea = height.toString() //e.target.scrollHeight + 20;
      this.scrollBottom(0)
      const message = e.msg
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea heightMessageTextArea ', this.heightMessageTextArea)

      this.logger.log('[CONVS-DETAIL] returnChangeTextArea e.detail.value', e.msg)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea loggedUser uid:', this.loggedUser.uid)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea loggedUser firstname:', this.loggedUser.firstname)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea conversationSelected uid:', this.conversationWith)
      this.logger.log('[CONVS-DETAIL] returnChangeTextArea channelType:', this.channelType)
      let idCurrentUser = ''
      let userFullname = ''

      // serve x mantenere la compatibilità con le vecchie chat
      // if (this.channelType === TYPE_DIRECT) {
      //   userId = this.loggedUser.uid;
      // }
      idCurrentUser = this.loggedUser.uid

      if (this.loggedUser.firstname && this.loggedUser.firstname !== undefined) {
        userFullname = this.loggedUser.firstname
      }

      /** DO NOT SET TYPING if message is empty */
      if (message !== '') {
        this.typingService.setTyping(this.conversationWith, message, idCurrentUser, userFullname)
      }

      // ----------------------------------------------------------
      // DISPLAY CANNED RESPONSES if message.lastIndexOf("/")
      // ----------------------------------------------------------
      if (this.areVisibleCAR && this.supportMode === true) {
        setTimeout(() => {
          if (this.conversationWith.startsWith('support-group')) {
            const pos = message.lastIndexOf('/')
            this.logger.log('[CONVS-DETAIL] - returnChangeTextArea - canned responses pos of / (using lastIndexOf) ', message, pos)

            if (pos === -1) {
              // this.tagsCannedFilter = []
              this.SHOW_CANNED_RESPONSES = false
            }
            // test
            // var rest = message.substring(0, message.lastIndexOf("/") + 1);
            // var last = message.substring(message.lastIndexOf("/") + 1, message.length);
            // console.log('[CONVS-DETAIL] - returnChangeTextArea rest', rest);
            // console.log('[CONVS-DETAIL] - returnChangeTextArea last', last);
            // console.log('[CONVS-DETAIL] - returnChangeTextArea last', last.length);
            // if (last.length === 1 && last.trim() === '') {
            //   console.log('[CONVS-DETAIL] - returnChangeTextArea last is a white space ');
            // } else if (last.length === 1 && last.trim() !== '') {
            //   console.log('[CONVS-DETAIL] - returnChangeTextArea last is NOT space ');
            // }

            if (pos >= 0) {
              var strSearch = message.substr(pos + 1)
              this.logger.log('[CONVS-DETAIL] - returnChangeTextArea - canned responses strSearch ', strSearch)

              // --------------------------------------------
              // Load canned responses
              // --------------------------------------------
              // this.HIDE_CANNED_RESPONSES = false
              this.messageStr = strSearch
              // ------------------------------------------------------------------------------------------------------------------------------------------
              // Hide / display Canned when the SLASH has POSITION POS 0 and checking if there is a space after the SLASH (in this case it will be hidden)
              // ------------------------------------------------------------------------------------------------------------------------------------------

              var after_slash = message.substring(message.lastIndexOf('/') + 1, message.length)
              if (pos === 0 && after_slash.length === 1 && after_slash.trim() === '') {
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea after_slash --> there is a white space after ');
                this.SHOW_CANNED_RESPONSES = false
                // this.tagsCannedFilter = []
              } else if (pos === 0 && after_slash.length === 0) {
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea after_slash --> there is NOT a white space after')
                this.SHOW_CANNED_RESPONSES = true
              }

              if (pos > 0) {
                //   // ------------------------------------------------------------------------------------------------------------------------------------------
                //   // Hide / display Canned when the SLASH has POSITION POS > and checking if there is a space after the SLASH (in this case they it be hidden)
                //   // and if there is not a space before the SLASH (in this it will be hidden)
                //   // ------------------------------------------------------------------------------------------------------------------------------------------

                let beforeSlash = message.substr(0, pos)
                let afterSlash = message.substr(pos + 1)
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea * POS ', pos)

                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> beforeSlash', beforeSlash)
                this.logger.log('[CONVS-DETAIL] - returnChangeTextArea  --> afterSlash', afterSlash)

                if (beforeSlash[beforeSlash.length - 1].indexOf(' ') >= 0 && afterSlash === '') {
                  this.SHOW_CANNED_RESPONSES = true
                } else if (beforeSlash[beforeSlash.length - 1].indexOf(' ') < 0 && afterSlash === '') {
                  this.SHOW_CANNED_RESPONSES = false
                } else if (beforeSlash[beforeSlash.length - 1].indexOf(' ') >= 0 && afterSlash === ' ') {
                  this.SHOW_CANNED_RESPONSES = false
                  // this.tagsCannedFilter = []
                }
              }
            } else {
              // this.tagsCannedFilter = []
            }
          }
        }, 300)
      }
      // ./ CANNED RESPONSES //
    } catch (err) {
      this.logger.error('[CONVS-DETAIL] - returnChangeTextArea - error: ', err)
    }
  }



  toggleSidebar() {
    // console.log('[CONVS-DETAIL] has clicked test')
  }


  replacePlaceholderInCanned(str) {
    this.logger.log('[CONVS-DETAIL] - replacePlaceholderInCanned str ', str)
    str = str.replace('$recipient_name', this.conversationWithFullname)
    if (this.loggedUser && this.loggedUser.fullname) {
      str = str.replace('$agent_name', this.loggedUser.fullname)
    }
    return str
  }

  onLoadedCannedResponses(event) {
    this.logger.log('[CONVS-DETAIL] onLoadedCannedResponses --> ', event)
    if (event && event.length > 0) {
      this.tagsCannedFilter = event
    }
  }

  replaceTagInMessage(canned, event?) {
    const elTextArea = this.rowTextArea['el']
    const textArea = elTextArea.getElementsByTagName('ion-textarea')[0] as HTMLInputElement;
    // console.log('[CONVS-DETAIL] replaceTagInMessage  textArea ', textArea)
    // console.log('[CONVS-DETAIL] replaceTagInMessage  textArea value', textArea.value,)

    // var lastChar =  textArea.value.substr(-1); // Selects the last character
    // if (lastChar === '/') {
    //   textArea.value = textArea.value.substring(0, textArea.value.length() - 1);
    // }
    // this.insertAtCursor(this.textArea, textArea.value)

    this.logger.log('[CONVS-DETAIL] replaceTagInMessage  canned text ', canned.text)

    // replace text
    var strTEMP = textArea.value.replace(/\/.*/ig, canned.text)
    strTEMP = this.replacePlaceholderInCanned(strTEMP)
    this.logger.log('[CONVS-DETAIL] replaceTagInMessage strSearch ', strTEMP)
    // strTEMP = this.replacePlaceholderInCanned(strTEMP);
    // textArea.value = '';
    // that.messageString = strTEMP;
    textArea.value = strTEMP
    this.insertAtCursor(textArea, '')
    this.setCaretPosition(textArea)
    // setTimeout(() => {
    //   // textArea.focus();
    //   textArea.setFocus()
    //   // this.resizeTextArea()
    // }, 200)

  }

  async presentCreateCannedResponseModal(): Promise<any> {
    const elTextArea = this.rowTextArea['el']
    const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]
    textArea.value = ''

    // console.log('[CONVS-DETAIL] PRESENT CREATE CANNED RESPONSE MODAL ')
    const attributes = { conversationWith: this.conversationWith }
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CreateCannedResponsePage,
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false,
    })
    modal.onDidDismiss().then((dataReturned: any) => {
      this.logger.log('[CONVS-DETAIL] ', dataReturned.data)
    })

    return await modal.present()
  }

  onClickOpenCannedResponses($event) {
    this.logger.log('[CONVS-DETAIL] - onClickOpenCannedResponses ', $event)
    this.SHOW_CANNED_RESPONSES = !this.SHOW_CANNED_RESPONSES
    this.SHOW_COPILOT_SUGGESTIONS = false;

    //HIDE_CANNED_RESPONSES: true --> not show CANNED component
    //HIDE_CANNED_RESPONSES: false --> show CANNED component and place '/' char in textarea
    if (this.SHOW_CANNED_RESPONSES) {
      const elTextArea = this.rowTextArea['el']
      const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]
      if (elTextArea) {
        // console.log("[CONVS-DETAIL] onClickOpenCannedResponses  textArea value", textArea.value)
        var lastChar = textArea.value[textArea.value.length - 1]
        this.logger.log('[CONVS-DETAIL] onClickOpenCannedResponses  lastChar  --- textArea ', lastChar, textArea)
        if (lastChar !== '/') {
          this.insertAtCursor(textArea, '/')
        }
        this.setCaretPosition(textArea)
      }
    }
  }


  /** COPILOT SUGGGESTIONS : start */
  onLoadedSuggestions(event){
    this.logger.log('[CONVS-DETAIL] onLoadedSuggestions --> ', event)
  }

  replaceSuggestionInMessage(suggestion, event?) {
    const elTextArea = this.rowTextArea['el']
    const textArea = elTextArea.getElementsByTagName('ion-textarea')[0] as HTMLInputElement;

    this.logger.log('[CONVS-DETAIL] replaceSuggestionInMessage  canned text ', suggestion.text)

    // replace text
    var strTEMP = textArea.value + suggestion.text
    strTEMP = this.replacePlaceholderInCanned(strTEMP)
    this.logger.log('[CONVS-DETAIL] replaceSuggestionInMessage strSearch ', strTEMP)
    // strTEMP = this.replacePlaceholderInCanned(strTEMP);
    // textArea.value = '';
    // that.messageString = strTEMP;
    textArea.value = strTEMP
    this.insertAtCursor(textArea, '')
    this.setCaretPosition(textArea)
    // setTimeout(() => {
    //   // textArea.focus();
    //   textArea.setFocus()
    //   // this.resizeTextArea()
    // }, 200)
    this.SHOW_COPILOT_SUGGESTIONS = !this.SHOW_COPILOT_SUGGESTIONS

  }
  /** COPILOT SUGGGESTIONS : end */


  setCaretPosition(ctrl) {
    ctrl.value.trim()
    ctrl.setFocus()
  }

  insertAtCursor(myField, myValue) {
    this.logger.log('[CONVS-DETAIL] - insertAtCursor - myValue ', myValue)
    this.logger.log('[CONVS-DETAIL] - insertAtCursor - myField ', myField)

    if (myField.value.length > 0) {
      myValue = ' ' + myValue
    }

    //IE support
    if (myField.selection) {
      myField.focus()
      let sel = myField.selection.createRange()
      sel.text = myValue
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart
      this.logger.log('[CONVS-DETAIL] - insertAtCursor - startPos ', startPos)

      var endPos = myField.selectionEnd
      this.logger.log('[CONVS-DETAIL] - insertAtCursor - endPos ', endPos)

      myField.value =
        myField.value.substring(0, startPos) +
        myValue +
        myField.value.substring(endPos, myField.value.length)

      // place cursor at end of text in text input element
      myField.focus()
      var val = myField.value //store the value of the element
      myField.value = '' //clear the value of the element
      myField.value = val + ' ' //set that value back.

      // this.cannedResponseMessage = myField.value;

      // this.texareaIsEmpty = false;
      // myField.select();
    } else {
      myField.value += myValue
      // this.cannedResponseMessage = myField.value;
    }
  }


  // ----------------------------------------------------------
  // ./end CANNED RESPONSES methods
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // @ Rule of sound message
  // * if I send it -> NO SOUND
  // * if I'm not in the conversation -> SOUND
  // * if I'm in the conversation at the bottom of the page -> NO SOUND
  // * otherwise -> SOUND
  // ----------------------------------------------------------
  // soundMessage() {
  //   const that = this
  //   this.audio = new Audio()
  //   // this.audio.src = '/assets/sounds/pling.mp3';
  //   this.audio.src = URL_SOUND_LIST_CONVERSATION
  //   this.audio.load()
  //   this.logger.log('[CONVS-DETAIL] soundMessage conversation this.audio',this.audio)
  //   clearTimeout(this.setTimeoutSound)
  //   this.setTimeoutSound = setTimeout(function () {
  //     that.audio.play().then(() => {
  //         // Audio is playing.
  //         this.logger.log('[CONVS-DETAIL] soundMessag that.audio.src ',that.audio.src)
  //     }).catch((error) => {
  //         that.logger.error(error)
  //     })
  //   }, 1000)
  // }

  onBeforeMessageRenderFN(event) {
    //this.onBeforeMessageRender.emit(event)
  }

  onAfterMessageRenderFN(event) {
    // this.onAfterMessageRender.emit(event)
  }

  returnOnMenuOption(event: boolean) {
    // this.isMenuShow = event;
  }

  returnOnScrollContent(event: boolean) { }

  onAttachmentButtonClickedFN(event: any) {
    this.logger.debug('[CONV-COMP] eventbutton', event)
    if (!event || !event.target.type) {
      return
    }
    switch (event.target.type) {
      case 'url':
        try {
          this.openLink(event.target.button)
        } catch (err) {
          this.logger.error('[CONV-COMP] url > Error :' + err)
        }
        return
      case 'action':
        try {
          this.actionButton(event.target.button)
        } catch (err) {
          this.logger.error('[CONV-COMP] action > Error :' + err)
        }
        return false
      case 'text':
        try {
          const text = event.target.button.value
          const metadata = { button: true }
          this.sendMessage(text, TYPE_MSG_TEXT, metadata)
        } catch (err) {
          this.logger.error('[CONV-COMP] text > Error :' + err)
        }
      default:
        return
    }
  }

  onElementRenderedFN(event) {
    const imageRendered = event
    if (event.status && this.ionContentChatArea) {
      this.scrollBottom(0)
    }
  }

  private openLink(event: any) {
    const link = event.link ? event.link : ''
    const target = event.target ? event.target : ''
    if (target === 'self' || target === 'parent') {
      window.open(link, '_parent')
    } else {
      window.open(link, '_blank')
    }
  }

  private actionButton(event: any) {
    // console.log(event);
    const action = event.action ? event.action : ''
    const message = event.value ? event.value : ''
    const subtype = event.show_reply ? '' : 'info'

    const attributes = {
      action: action,
      subtype: subtype,
    }
    this.sendMessage(message, TYPE_MSG_TEXT, null, attributes)
    this.logger.debug('[CONV-COMP] > action :')
  }

  addUploadingBubbleEvent(event: boolean) {
    this.logger.log('[CONVS-DETAIL] addUploadingBubbleEvent event', event)
    if (event === true) {
      this.scrollBottom(0)
    }
  }

  onPresentModalScrollToBottom(event: boolean) {
    this.logger.log('[CONVS-DETAIL] onPresentModalScrollToBottom event', event)
    if (event === true) {
      this.scrollBottom(0)
    }
  }

  //DESKTOP HANDLER
  onOpenCloseInfoConversation(event) {
    this.logger.debug('[CONVS-DETAIL] onOpenCloseInfoConversation - openInfoConversation ', event)
    this.resizeTextArea()
    this.openInfoConversation = event
    this.USER_HAS_OPENED_CLOSE_INFO_CONV = true
  }

  //MOBILE HANDLER
  onOpenInfoConversation(event) {
    this.logger.debug('[CONVS-DETAIL] onOpenCloseInfoConversation - openInfoConversation ', event)
    this.resizeTextArea()
    this.openInfoConversation = event
    this.USER_HAS_OPENED_CLOSE_INFO_CONV = true
  }

  onOpenFooterSection(event: string) {
    this.logger.debug('[CONVS-DETAIL] onOpenFooterSection - section ', event)
    if (event === 'email' || event === 'templates') {
      this.getLeadDetail()
    }
    
  }

  onClickHeaderSection(event: string){
    this.logger.debug('[CONVS-DETAIL] onClickHeaderSection - section ', event)
    if(event === 'copilot'){
      this.SHOW_COPILOT_SUGGESTIONS = !this.SHOW_COPILOT_SUGGESTIONS
      this.SHOW_CANNED_RESPONSES = false
      this.copilotQuestion = ''
    }
  }


  // -------------- START SCROLL/RESIZE  -------------- //
  /** */
  resizeTextArea() {
    try {
      const elTextArea = this.rowTextArea['el']
      const that = this
      setTimeout(() => {
        const textArea = elTextArea.getElementsByTagName('ion-textarea')[0]
        if (textArea) {
          this.logger.log('[CONVS-DETAIL] resizeTextArea textArea ', textArea)
          const txtValue = textArea.value
          textArea.value = ' '
          textArea.value = txtValue
        }
      }, 0)
      setTimeout(() => {
        if (elTextArea) {
          this.logger.log(
            '[CONVS-DETAIL] resizeTextArea elTextArea.offsetHeight ',
            elTextArea.offsetHeight,
          )
          that.heightMessageTextArea = elTextArea.offsetHeight
        }
      }, 100)
    } catch (err) {
      this.logger.error('[CONVS-DETAIL] resizeTextArea - error: ', err)
    }
  }

  /**
   * scrollBottom
   * @param time
   */
  private scrollBottom(time: number) {
    this.showIonContent = true
    if (this.ionContentChatArea) {
      setTimeout(() => {
        this.ionContentChatArea.scrollToBottom(time)
      }, 0)
      // nota: se elimino il settimeout lo scrollToBottom non viene richiamato!!!!!
    }
  }

  /**
   * detectBottom
   */
  async detectBottom() {
    const scrollElement = await this.ionContentChatArea.getScrollElement()

    if (
      scrollElement.scrollTop <
      scrollElement.scrollHeight - scrollElement.clientHeight
    ) {
      //NON SONO ALLA FINE --> mostra badge
      this.showButtonToBottom = true
    } else {
      // SONO ALLA FINE --> non mostrare badge,
      this.showButtonToBottom = false
    }
  }

  /**
   * Scroll to bottom of page after a short delay.
   * FIREBY BY: click event ScrollToBottom bottom-right icon button
   */
  public actionScrollBottom() {
    this.logger.log('[CONVS-DETAIL] actionScrollBottom - ionContentChatArea: ', this.ionContentChatArea)
    // const that = this;
    this.showButtonToBottom = false
    this.updateConversationBadge()
    this.NUM_BADGES = 0
    setTimeout(() => {
      this.ionContentChatArea.scrollToBottom(0)
      // this.conversationsHandlerService.readAllMessages.next(this.conversationWith);
    }, 0)
  }

  /**
   * Scroll to top of the page after a short delay.
   */
  scrollTop() {
    this.logger.log('[CONVS-DETAIL] scrollTop')
    this.ionContentChatArea.scrollToTop(100)
  }

  /** */
  setHeightTextArea() {
    try {
      if (this.rowTextArea) {
        this.heightMessageTextArea = this.rowTextArea['el'].offsetHeight
        this.logger.log(
          '[CONVS-DETAIL] setHeightTextArea - heightMessageTextArea: ',
          this.heightMessageTextArea,
        )
      }
    } catch (e) {
      this.logger.error('[CONVS-DETAIL] setHeightTextArea - ERROR ', e)
      // this.heightMessageTextArea = '50';
      this.heightMessageTextArea = '57' // NK edited
    }
  }

  checkAcceptedFile(draggedFileMimeType) {
    let isAcceptFile = false
    this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept: ', this.fileUploadAccept)
    const accept_files = this.fileUploadAccept
    this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - mimeType: ', draggedFileMimeType)
    if (accept_files === '*/*') {
      isAcceptFile = true
      return isAcceptFile
    } else if (accept_files !== '*/*') {
      this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept typeof accept_files ', typeof accept_files)
      const accept_files_array = accept_files.split(',')
      this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_files_array ', accept_files_array)
      this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_files_array typeof: ', typeof accept_files_array)

      accept_files_array.forEach((accept_file) => {
        this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_file ', accept_file)
        const accept_file_segment = accept_file.split('/')
        this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept accept_file_segment ', accept_file_segment)
        if (accept_file_segment[1] === '*') {
          if (draggedFileMimeType.startsWith(accept_file_segment[0])) {
            isAcceptFile = true
            this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile', isAcceptFile)
            return isAcceptFile
          } else {
            isAcceptFile = false
            this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile', isAcceptFile)
            return isAcceptFile
          }
        } else if (accept_file_segment[1] !== '*') {
          if (draggedFileMimeType === accept_file) {
            isAcceptFile = true
            this.logger.log('[CONVS-DETAIL] > checkAcceptedFile - fileUploadAccept isAcceptFile', isAcceptFile)
            return isAcceptFile
          }
        }
        return isAcceptFile
      })
      return isAcceptFile
    }
  }


  initializeTyping() {
    this.logger.debug('[CONVS-DETAIL] membersconversation', this.membersConversation)
    if (this.loggedUser) {
      this.membersConversation.push(this.loggedUser.uid)
      //this.setSubscriptions();
      this.typingService.isTyping(this.conversationWith, this.loggedUser.uid, this.isDirect);
    }
  }

  /** */
  subscribeTypings(data: any) {
    const that = this;
    try {
      const key = data.uidUserTypingNow;
      const waitTime = data.waitTime
      this.nameUserTypingNow = null;
      this.idUserTypingNow = null;

      if (data.nameUserTypingNow) {
        this.nameUserTypingNow = data.nameUserTypingNow;
      }
      if (data.uidUserTypingNow) {
        this.idUserTypingNow = data.uidUserTypingNow
      }
      this.logger.debug('[CONV-COMP] subscribeTypings data:', data);
      const userTyping = this.membersConversation.includes(key);
      if (!userTyping && key) {
        this.isTypings = true;
        setTimeout(function () {
          that.scrollBottom(0)
        }, 0);
        // clearTimeout(this.setTimeoutWritingMessages);
        this.setTimeoutWritingMessages = setTimeout(() => {
          that.isTypings = false;
        }, waitTime);
        // this.initiTimeout(waitTime)
      }
    } catch (error) {
      this.logger.error('[CONV-COMP] error: ', error);
    }

  }

  initiTimeout(waitTime) {
    const that = this;
    this.setTimeoutWritingMessages = setTimeout(() => {
      that.isTypings = false;
    }, waitTime);
  }

  resetTimeout() {
    this.isTypings = false
    this.setTimeoutWritingMessages = null;
    clearTimeout(this.setTimeoutWritingMessages)
  }


  segmentNewAgentMessage(conversation: ConversationModel) {
    let user = this.loggedUser
    if (window['analytics']) {
      try {
        window['analytics'].page("Chat Conversation Detail Page, Message Sent", {});
      } catch (err) {
        this.logger.error('Event:Message Sent [page] error', err);
      }

      try {
        window['analytics'].identify(user.uid, {
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          logins: 5,
        });
      } catch (err) {
        this.logger.error('Event:Message Sent [identify] error', err);
      }

      try {
        window['analytics'].track('Message Sent', {
          "username": user.firstname + ' ' + user.lastname,
          "userId": user.uid,
          "conversation_id": conversation.uid,
          "channel_type": conversation.channel_type,
          "conversation_with": conversation.conversation_with,
          "department_name": (conversation.channel_type !== TYPE_DIRECT) ? conversation.attributes.departmentName : null,
          "department_id": (conversation.channel_type !== TYPE_DIRECT) ? conversation.attributes.departmentId : null,
        },
          {
            "context": {
              "groupId": (conversation.channel_type !== TYPE_DIRECT) ? conversation.attributes.projectId : null
            }
          });
      } catch (err) {
        this.logger.error('Event:Message Sent [track] error', err);
      }

      try {
        window['analytics'].group(conversation.attributes.projectId, {
          name: (conversation.attributes.project_name) ? conversation.attributes.project_name : null,
          // plan: projectProfileName,
        });
      } catch (err) {
        this.logger.error('Event:Message Sent [group] error', err);
      }
    }
  }

  // -------------------------------------------------------------
  // DRAG FILE
  // -------------------------------------------------------------
  // DROP (WHEN THE FILE IS RELEASED ON THE DROP ZONE)
  drop(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()

    this.logger.log('[CONVS-DETAIL] ----> FILE - DROP ev ', ev)
    const fileList = ev.dataTransfer.files
    this.logger.log('[CONVS-DETAIL] ----> FILE - DROP ev.dataTransfer.files ', fileList)
    this.isHovering = false
    this.logger.log('[CONVS-DETAIL] ----> FILE - DROP isHovering ', this.isHovering)
    if (fileList.length > 0) {
      const file: File = fileList[0]
      this.logger.log('[CONVS-DETAIL] ----> FILE - DROP file ', file)

      var mimeType = fileList[0].type
      this.logger.log('[CONVS-DETAIL] ----> FILE - DROP mimeType files ', mimeType)
      
      // const isAccepted = this.checkAcceptedFile(mimeType)
      const canUploadFile = checkAcceptedFile(mimeType, this.fileUploadAccept)
      if(!canUploadFile){
        this.presentToast(this.translationsMap.get('FAILED_TO_UPLOAD_THE_FORMAT_IS_NOT_SUPPORTED'), 'danger', 'toast-custom-class', 5000)
        return;
      }
      this.handleDropEvent(ev)

    }
  }

  handleDropEvent(ev) {
    this.logger.log('[CONVS-DETAIL] ----> FILE - HANDLE DROP  EVENT ', ev)
    this.dropEvent = ev
  }

  // DRAG OVER (WHEN HOVER OVER ON THE "DROP ZONE")
  allowDrop(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    this.logger.log('[CONVS-DETAIL] ----> FILE - (dragover) allowDrop ev ', ev)
    this.isHovering = true
    this.logger.log('[CONVS-DETAIL] ----> FILE - (dragover) allowDrop isHovering ', this.isHovering)
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault()
    ev.stopPropagation()
    this.logger.log('[CONVS-DETAIL] ----> FILE - (dragleave) drag ev ', ev)
    this.isHovering = false
    this.logger.log('[CONVS-DETAIL] ----> FILE - FILE - (dragleave) drag his.isHovering ', this.isHovering)
  }

  async presentToast(message: string, color: string, cssClass: string, duration: number = 2000, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: position,
      cssClass: cssClass,
    });
    toast.present();
  }
}
// END ALL //
