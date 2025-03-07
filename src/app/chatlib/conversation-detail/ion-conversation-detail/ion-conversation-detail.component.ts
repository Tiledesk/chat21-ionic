import { JsonMessagePage } from './../../../modals/json-message/json-message.page';
import { MessageModel } from 'src/chat21-core/models/message';
import { ConversationContentComponent } from '../conversation-content/conversation-content.component';
import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';


import { MESSAGE_TYPE_INFO, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS, TYPE_MSG_EMAIL } from 'src/chat21-core/utils/constants';
import { isChannelTypeGroup, isEmojii, isFirstMessage, isInfo, isMine, messageType } from 'src/chat21-core/utils/utils-message';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { isFile, isFrame, isImage } from 'src/chat21-core/utils/utils-message';

import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppConfigProvider } from 'src/app/services/app-config';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { CreateCannedResponsePage } from 'src/app/modals/create-canned-response/create-canned-response.page';
import { EventsService } from 'src/app/services/events-service';

@Component({
  selector: 'ion-conversation-detail',
  templateUrl: './ion-conversation-detail.component.html',
  styleUrls: ['./ion-conversation-detail.component.scss'],
})
export class IonConversationDetailComponent extends ConversationContentComponent implements OnInit {

  @Input() senderId: string;
  @Input() channelType: string;
  @Input() areVisibleCAR: boolean;
  @Input() isCopilotEnabled: boolean = false
  @Input() supportMode: boolean;
  @Input() isMobile: boolean;
  @Input() openInfoConversation: boolean;
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();
  @Output() onAddUploadingBubble = new EventEmitter<boolean>();
  @Output() onOpenCloseInfoConversation = new EventEmitter<boolean>();
  
  public public_Key: any
  public uploadProgress: number = 100
  public fileType: any
  public browserLang: string;
  public addAsCannedResponseTooltipText: string;
  public viewedPageTooltipText: string;
  public showSourceInfo: boolean = false;
  public showSourceInfoIndex: number = 0;
  // public openInfoConversation: boolean = true;
  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;

  isMine = isMine;
  isInfo = isInfo;
  messageType = messageType;
  isChannelTypeGroup = isChannelTypeGroup;
  isEmojii = isEmojii;

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO;
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;
  TYPE_MSG_EMAIL = TYPE_MSG_EMAIL;
  logger: LoggerService = LoggerInstance.getInstance()
  /**
   * Constructor
   * @param cdref 
   * @param uploadService 
   */
  constructor(
    public cdref: ChangeDetectorRef,
    public uploadService: UploadService,
    public tiledeskAuthService: TiledeskAuthService,
    private translate: TranslateService,
    public appConfigProvider: AppConfigProvider,
    public modalController: ModalController,
    public popoverController: PopoverController,
    public toastController: ToastController,
    private eventService: EventsService
  ) {
    super(cdref, uploadService)

  }

  ngOnInit() {
    this.listenToUploadFileProgress();
    this.setMomentLocaleAndGetTranslation();
    
  }

  ngOnChanges(changes: SimpleChanges){
    this.isMobile? this.openInfoConversation = false: null;
  }



  setMomentLocaleAndGetTranslation() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - ngOnInit - currentUser ', currentUser)
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
      this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL]] - ngOnInit - currentUserId ', currentUserId)
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] stored_preferred_lang: ', stored_preferred_lang);


    let chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      chat_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }

    moment.locale(chat_lang)
    // this.translate.getTranslation(chat_lang).subscribe((labels: string) => {
    //   console.log('[CONVS-DETAIL] translations: ', labels);
    // });
    this.translate.get(['AddAsCannedResponse', 'ViewedPage']).subscribe((text: string) => {
      this.logger.log('[CONVS-DETAIL] AddAsCannedResponse translated: ', text);
      this.addAsCannedResponseTooltipText = text['AddAsCannedResponse']
      this.viewedPageTooltipText = text['ViewedPage']
    })
  }

  listenToUploadFileProgress() {
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - calling BSStateUpload ');
    this.uploadService.BSStateUpload.subscribe((data: any) => {
      this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data', data);

      if (data) {
        this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload', data.upload);
        this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload typeof', typeof data.upload);
        this.uploadProgress = data.upload

        if (isNaN(data.upload)) {
          this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload data.upload IS NaN (e.g. file size is 0)');
          this.uploadProgress = 100
        }
        // if (data.type.startsWith("application")) {
        // if (!data.type.startsWith("image")) {

        // this.fileType = 'file'

        this.addUploadingBubblePlaceholder(true)

        // this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] FIREBASE-UPLOAD - BSStateUpload this.fileType', this.fileType);
        // }
      }
    });
  }

  addUploadingBubblePlaceholder(value: boolean) {
    this.onAddUploadingBubble.emit(value);
  }

  onClickBubbleOptions(event:{option: string, data: any}){
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - onClickBubbleOptions', event);
    if(event.option==='copy'){
      this.onClickCopyMessage(event.data.message)
    }else if(event.option === 'addCanned'){
      if(this.areVisibleCAR && this.supportMode){
        this.presentCreateCannedResponseModal(event.data.message)
      }
    }else if(event.option === 'jsonInfo'){
      this.presentJsonMessageModal(event.data.message)
    } else if(event.option === 'copilot_question'){
      this.eventService.publish('copilot:new_question', {text: event.data.text})

    }
  }

  onClickCopyMessage(message: MessageModel){
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - onClickCopyMessage');
    navigator.clipboard.writeText(message.text)
    this.presentToast()
  }

  onClickInfoMessage(message: MessageModel, index: number){
    if(message && message.attributes && message.attributes.sourcePage){
      this.showSourceInfo = !this.showSourceInfo
      this.showSourceInfoIndex = index
    }
  }

  onElementRenderedFN(event) {
    this.logger.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - onElementRenderedFN:::ionic', event)
    this.onElementRendered.emit(event)
  }

  onOpenCloseInfoConversationFN(){
    this.openInfoConversation = !this.openInfoConversation
    this.onOpenCloseInfoConversation.emit(this.openInfoConversation)
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    // console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - trackByFn index', index)
    // console.log('[CONVS-DETAIL][ION-CONVS-DETAIL] - trackByFn item', item)
    return item.uid || index;
  }


  async presentCreateCannedResponseModal(message: MessageModel): Promise<any> {
    this.logger.log('[BUBBLE-MESSAGE] PRESENT CREATE CANNED RESPONSE MODAL ')
    const attributes = {
       message: message.text,
       conversationWith: message.recipient
    }
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CreateCannedResponsePage,
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: true,
    })
    modal.onDidDismiss().then((dataReturned: any) => {
      // 
      this.logger.log('[BUBBLE-MESSAGE] ', dataReturned.data)
    })

    return await modal.present()
  }

  async presentJsonMessageModal(message: MessageModel): Promise<any> {
    this.logger.log('[BUBBLE-MESSAGE] PRESENT JSON MESSAGE MODAL ')
    const attributes = {
       message: message
    }
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: JsonMessagePage,
      cssClass: 'json-modal-class',
      componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: true,
      // keyboardClose: true,
    })
    modal.onDidDismiss().then((dataReturned: any) => {
      // 
      this.logger.log('[BUBBLE-MESSAGE] ', dataReturned.data)
    })

    return await modal.present()
  }

  async presentToast(){
    const toast = await this.toastController.create({
      message: '<div style="display: flex">'+
                '<ion-icon name="copy"></ion-icon> '+
                `<span>${this.translationMap.get("COPY_MESSAGE_TOAST")}</span>`+
              '</div>',
      duration: 3000,
      color: 'light',
      position: 'bottom',
      cssClass: 'toast-copy'
    });
    toast.present();
  }
}
