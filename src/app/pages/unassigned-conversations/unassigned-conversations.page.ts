import { Component, Input, OnChanges, OnInit, SecurityContext, SimpleChanges } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavProxyService } from 'src/app/services/nav-proxy.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { DomSanitizer } from '@angular/platform-browser'
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { EventsService } from 'src/app/services/events-service';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { getProjectIdSelectedConversation, isGroup } from 'src/chat21-core/utils/utils';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';


@Component({
  selector: 'app-unassigned-conversations',
  templateUrl: './unassigned-conversations.page.html',
  styleUrls: ['./unassigned-conversations.page.scss'],
})
export class UnassignedConversationsPage implements OnInit, OnChanges {

  @Input() iframe_URL: any;
  @Input() callerBtn: string;
  @Input() isMobile: boolean;
  /** Lista conversazioni unassigned passata da project-item (calcolata da wsRequestsList) */
  @Input() unassignedConversations: ConversationModel[] = [];
  @Input() stylesMap: Map<string, string>;
  @Input() translationMapConversation: Map<string, string>;

  /** Array salvato localmente per uso nella page */
  unassignedConversationsList: ConversationModel[] = [];
  uidConvSelected: string;
  // @Input() prjctsxpanel_url: any;
  // @Input() unassigned_convs_url: any;

  iframe_url_sanitized: any;
  private loggedUserUid: string;
  private logger: LoggerService = LoggerInstance.getInstance();
  // has_loaded: boolean;
  ion_content: any;
  iframe: any;

  isProjectsForPanel: boolean = false

  public translationMap: Map<string, string>;
  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    private alertController: AlertController,
    private router: Router,
    private sanitizer: DomSanitizer,
    private translateService: CustomTranslateService,
    private events: EventsService,
    private tiledeskAuthService: TiledeskAuthService,
    private tiledeskService: TiledeskService,
    public imageRepoService: ImageRepoService
  ) {
    if (this.tiledeskAuthService.getCurrentUser()) {
      this.loggedUserUid = this.tiledeskAuthService.getCurrentUser().uid;
    }
  }

  ngOnInit() {
    const keys = [
      'UnassignedConversations',
      'NewConversations',
      'PIN_A_PROJECT',
      'LABEL_MSG_PUSH_START_CHAT'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);

    this.unassignedConversationsList = this.unassignedConversations ?? [];
    if (!this.stylesMap) {
      this.stylesMap = new Map([['themeColor', '#165CEE']]);
    }
    if (!this.translationMapConversation) {
      this.translationMapConversation = this.translateService.translateLanguage(['CLOSED', 'Resolve']);
    }
    this.logger.log('[UNASSIGNED-CONVS-PAGE] unassignedConversationsList', this.unassignedConversationsList);
    this.processConversationsForDisplay();
    // this.buildIFRAME();
    this.listenToPostMsg();
    this.hideHotjarFeedbackBtn();
    this.events.subscribe('style', (data)=>this.loadStyle(data))
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['unassignedConversations'] && changes['unassignedConversations'].currentValue) {
      this.unassignedConversationsList = this.unassignedConversations ?? [];
      this.processConversationsForDisplay();
    }
  }

  ngOnDestroy(){
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - onDestroy called', this.iframe_URL);
  }

  /** Chiama onImageLoaded e onConversationLoaded per ogni conversazione in lista */
  private processConversationsForDisplay() {
    if (!this.unassignedConversationsList?.length) return;
    this.unassignedConversationsList.forEach((conv) => {
      this.onImageLoaded(conv);
      this.onConversationLoaded(conv);
    });
  }

  hideHotjarFeedbackBtn() {
    const hotjarFeedbackBtn = <HTMLElement>document.querySelector("#_hj_feedback_container > div > button")
    if (hotjarFeedbackBtn) {
      hotjarFeedbackBtn.style.display = "none";
    }
  }

  buildIFRAME() {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - iframe_URL (ngOnInit)', this.iframe_URL);
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - callerBtn (ngOnInit)', this.callerBtn);

    this.iframe_url_sanitized = this.sanitizer.sanitize(SecurityContext.URL, this.iframe_URL)
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - UNASSIGNED CONVS URL SANITIZED (ngOnInit)', this.iframe_url_sanitized);
    // this.has_loaded = false

    this.ion_content = document.getElementById("iframe-ion-content");
    this.iframe = document.createElement("iframe");
    this.iframe.src = this.iframe_url_sanitized;
    this.iframe.width = "100%";
    this.iframe.height = "99%";
    this.iframe.id = "unassigned-convs-iframe"
    this.iframe.frameBorder = "0";
    this.iframe.style.border = "none";
    this.iframe.style.background = "white";
    this.ion_content.appendChild(this.iframe);

    this.getIframeHaLoaded()

  }

  getIframeHaLoaded() {
    var self = this;
    var iframeWin = document.getElementById('unassigned-convs-iframe') as HTMLIFrameElement;;
    this.logger.log('[UNASSIGNED-CONVS-PAGE] GET iframe ', iframeWin)
    if (iframeWin) {
      iframeWin.addEventListener("load", function () {
        self.logger.log("[UNASSIGNED-CONVS-PAGE] GET - Finish");
        self.onLoad(iframeWin)
        
        const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
          input !== null && input.tagName === 'IFRAME';

        if (isIFrame(iframeWin) && iframeWin.contentWindow) {
          const msg = { action: "hidewidget", calledBy: 'unassigned-convs' }
          iframeWin.contentWindow.postMessage(msg, '*');
        }

        

        let spinnerElem = <HTMLElement>document.querySelector('.loader-spinner-wpr')

        self.logger.log('[APP-STORE-INSTALL] GET iframeDoc readyState spinnerElem', spinnerElem)
        spinnerElem.classList.add("hide-stretchspinner")



      });
    }

  }

  async presentAlertConfirmJoinRequest(request: ConversationModel) {
    var iframeWin = <HTMLIFrameElement>document.getElementById("unassigned-convs-iframe")

    const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
      input !== null && input.tagName === 'IFRAME';

    const keys = ['YouAreAboutToJoinThisChat', 'Cancel', 'AreYouSure'];
    const translationMap = this.translateService.translateLanguage(keys);

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: translationMap.get('AreYouSure'),
      message: translationMap.get('YouAreAboutToJoinThisChat'),
      buttons: [
        {
          text: translationMap.get('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Ok',
          handler: () => {
            this.tiledeskService.addParticipant(request.uid, this.loggedUserUid, request.attributes.projectId).subscribe((res: any) => {
              this.logger.log('[APP-COMP] addParticipant - RES ', res);
              this.onClose(request);
            }, (error) => {
              this.logger.error('[APP-COMP] addParticipant - ERROR ', error);
            }, () => {
              this.logger.log('[APP-COMP] addParticipant - COMPLETE ');
            });
          }
        }
      ]
    });

    await alert.present();
  }

  onLoad(iframe){
    let styleData = localStorage.getItem('custom_style')
    if(styleData && styleData !== 'undefined'){
      this.loadStyle(JSON.parse(styleData))
    }
  }
  
  async loadStyle(data){
    var iframeWin = <HTMLIFrameElement>document.getElementById("unassigned-convs-iframe")
    if(!data || !data.parameter){
      let className = iframeWin.contentDocument.body.className.replace(new RegExp(/style-\S*/gm), '')
      iframeWin.contentDocument.body.className = className
      iframeWin.contentWindow.document.body.classList.remove('light')
      iframeWin.contentWindow.document.body.classList.remove('dark')
      iframeWin.contentWindow.document.body.classList.remove('custom')
      let link = iframeWin.contentWindow.document.getElementById('themeCustom');
      if(link){
        link.remove();
      }
      return;
    } 

    // Create link
    let link = iframeWin.contentWindow.document.createElement('link');
    link.id= 'themeCustom'
    link.href = data.parameter;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.media='all';
    
    console.log('linkkkk', link, iframeWin.contentWindow.document)
    let head = iframeWin.contentWindow.document.getElementsByTagName('head')[0];
    head.appendChild(link);
    iframeWin.contentWindow.document.body.classList.add(data.type) //ADD class to body element as theme type ('light', 'dark', 'custom')
    return;
  }


  listenToPostMsg() {
    window.addEventListener("message", (event) => {
      // console.log("[UNASSIGNED-CONVS-PAGE] message event ", event);

      if (event && event.data) {
        if (event.data === 'onInitProjectsForPanel') {
          this.isProjectsForPanel = true;
        }
        if (event.data === 'onDestroyProjectsForPanel') {
          this.isProjectsForPanel = false;
        }
      }

      if (event.data === 'hasChangedProject') {
        this.closemodal()
      }
    });
  }

  public async closemodal() {
    // const modal = await this.modalController.getTop();
    // modal.dismiss({
    //   confirmed: true
    // });
    // await this.modalController.dismiss({ confirmed: true });
    this.onClose()

  }


  onConversationSelected(conversation: ConversationModel) {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] onConversationSelected', conversation);
    this.uidConvSelected = conversation?.uid;
    const fullName = conversation?.conversation_with_fullname || '';
    const pageUrl = 'conversation-detail/' + conversation.uid + '/' + encodeURIComponent(fullName) + '/unassigned';
    this.modalController.dismiss({ conversation }).then(() => {
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29'));
    }).catch(() => {
      this.navService.pop();
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29'));
    });
  }

  onCloseConversation(conversation: ConversationModel) {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] onCloseConversation', conversation);
    this.tiledeskService.closeSupportGroup(conversation.attributes.projectId, conversation.uid).subscribe((res: any) => {
      this.logger.log('[UNASSIGNED-CONVS-PAGE] archiveRequest - RES ', res);
      this.onClose();
    }, (error) => {
      this.logger.error('[UNASSIGNED-CONVS-PAGE] archiveRequest - ERROR ', error);
    }, () => {
      this.logger.log('[UNASSIGNED-CONVS-PAGE] archiveRequest - COMPLETE ');
    });
  }

  onJoinConversation(conversation: ConversationModel) {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] onJoinConversation', conversation);
    this.presentAlertConfirmJoinRequest(conversation)
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

  async onClose(conversation?: ConversationModel) {
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL')
    const isModalOpened = await this.modalController.getTop();
    this.logger.log('[UNASSIGNED-CONVS-PAGE] - onClose MODAL isModalOpened ', isModalOpened)
    if (isModalOpened) {
      await this.modalController.dismiss({ confirmed: true });
    } else {
      this.navService.pop();
    }
    if (conversation) {
      const fullName = conversation.conversation_with_fullname || '';
      const pageUrl = 'conversation-detail/' + conversation.uid + '/' + encodeURIComponent(fullName) + '/active';
      this.router.navigateByUrl(pageUrl.replace(/\(/g, '%28').replace(/\)/g, '%29'));
    }
  }

}
