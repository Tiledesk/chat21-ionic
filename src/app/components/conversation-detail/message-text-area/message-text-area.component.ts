import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { SendEmailModal } from './../../../modals/send-email/send-email.page';
import { SendWhatsappTemplateModal } from './../../../modals/send-whatsapp-template/send-whatsapp-template.page';
import { UserModel } from 'src/chat21-core/models/user';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ViewChild, ElementRef, OnChanges, HostListener, Renderer2, SimpleChange, SimpleChanges } from '@angular/core';

import { Chooser } from '@ionic-native/chooser/ngx';
import { IonTextarea, ModalController, ToastController } from '@ionic/angular';

// Pages
import { LoaderPreviewPage } from 'src/app/modals/loader-preview/loader-preview.page';
// Services 
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
// utils
import { TYPE_MSG_EMAIL, TYPE_MSG_TEXT, CHANNEL_TYPE } from 'src/chat21-core/utils/constants';
// Models
import { UploadModel } from 'src/chat21-core/models/upload';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { EventsService } from 'src/app/services/events-service';
import { isOnMobileDevice } from 'src/chat21-core/utils/utils';
import { checkAcceptedFile } from 'src/chat21-core/utils/utils';
import { CopilotService } from 'src/app/services/copilot/copilot.service';
import { BRAND_BASE_INFO } from 'src/app/utils/utils-resources';


@Component({
  selector: 'app-message-text-area',
  templateUrl: './message-text-area.component.html',
  styleUrls: ['./message-text-area.component.scss'],
})
export class MessageTextAreaComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('textArea', { static: false }) messageTextArea: IonTextarea

  @ViewChild('message_text_area', { static: false }) message_text_area: ElementRef
  //   set textArea(element: ElementRef<HTMLInputElement>) {
  //     if(element) {
  //       this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ViewChild element ", element);
  //       element.nativeElement.focus()
  //     }
  //  }


  @ViewChild('fileInput', { static: false }) fileInput: any;

  @Input() loggedUser: UserModel;
  @Input() conversationWith: string;
  @Input() channelType: string;
  @Input() channel: string;
  @Input() tagsCannedFilter: any;
  @Input() areVisibleCAR: boolean;
  @Input() isCopilotEnabled: boolean = false;
  @Input() supportMode: boolean;
  @Input() leadInfo: {lead_id: string, hasEmail: boolean, email: string, projectId: string, presence: {}};
  @Input() fileUploadAccept: string;
  @Input() emailSection: boolean;
  @Input() offlineMsgEmail: boolean;
  @Input() whatsappTemplatesSection: boolean;
  @Input() isOpenInfoConversation: boolean;
  @Input() stylesMap: Map<string, string>;
  @Input() translationMap: Map<string, string>;
  @Input() dropEvent: any;
  @Input() disableTextarea: boolean;
  @Output() eventChangeTextArea = new EventEmitter<{msg: string, offsetHeight: number}>();
  @Output() eventSendMessage = new EventEmitter<{msg: string, type: string, metadata?: Object, attributes?: Object}>();
  @Output() onClickOpenCannedResponses = new EventEmitter<boolean>();
  @Output() onPresentModalScrollToBottom = new EventEmitter<boolean>();
  @Output() onOpenFooterSection = new EventEmitter<string>();

  public conversationEnabled = false;
  public messageString: string;
  public HAS_PASTED: boolean = false;
  public toastMsg: string;
  private logger: LoggerService = LoggerInstance.getInstance();
  public countClicks: number = 0;
  public IS_ON_MOBILE_DEVICE: boolean;

  CHANNEL_TYPE = CHANNEL_TYPE;
  TYPE_MSG_TEXT = TYPE_MSG_TEXT;
  msg: string

  section: string= 'chat'

  showEmojiPicker: boolean = false; //To show/hide emoji picker
  addWhiteSpaceBefore: boolean;
  emojiPerLine: number = 9
  emojiColor: string ="#3880ff"
  emojiiCategories = [ 'recent', 'people', 'nature', 'activity', 'flags'] //, 'custom']

  customEmojis = [
    {
      name: 'Customer-Service',
      shortNames: ['customer'],
      text: 'ee',
      emoticons: [],
      keywords: ['github'],
      imageUrl: 'https://tiledesk.com/wp-content/uploads/2022/11/Customer-Service.png',
    },
    {
      name: 'Octocat',
      shortNames: ['octocat'],
      text: 'rr',
      emoticons: [],
      keywords: ['github'],
      imageUrl: 'https://tiledesk.com/wp-content/uploads/2022/11/FAQ-Chatbot.png',
    }
  ];

  BRAND_BASE_INFO = BRAND_BASE_INFO
  
  /**
   * Constructor
   * @param chooser 
   * @param modalController 
   * @param uploadService 
   * @param toastController 
   */
  constructor(
    public chooser: Chooser,
    public modalController: ModalController,
    public uploadService: UploadService,
    public toastController: ToastController,
    public eventsService: EventsService
  ) { }

  // ---------------------------------------------------------
  // @ Lifehooks
  // ---------------------------------------------------------

  ngOnInit() {
    // this.setSubscriptions();

    this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] HELLO !!!!! ");
    this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] areVisibleCAR ", this.areVisibleCAR);
    if (this.areVisibleCAR === false) {
      this.emojiPerLine = 7
    }

    this.listenToNewCannedResponseCreated()
    this.IS_ON_MOBILE_DEVICE = isOnMobileDevice()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.translationMap) {
      // this.LONG_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG')
      // this.SHORT_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORT')
      // this.SHORTER_TEXAREA_PLACEHOLDER = this.translationMap.get('LABEL_ENTER_MSG_SHORTER')

    }
    this.logger.log('[CONVS-DETAIL] - returnChangeTextArea ngOnChanges in [MSG-TEXT-AREA]  this.tagsCannedFilter.length ', this.tagsCannedFilter.length)
    this.logger.log('[CONVS-DETAIL] - returnChangeTextArea ngOnChanges in [MSG-TEXT-AREA] channel', this.channel, this.whatsappTemplatesSection, this.emailSection )

    // use case drop
    if (this.dropEvent) {
      this.presentModal(this.dropEvent)
    }
  }

  // ngAfterViewInit() {
  ngAfterViewInit() {

    // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit message_text_area ", this.message_text_area);
    // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit messageTextArea ", this.messageTextArea);
    if (this.messageTextArea) {
      setTimeout(() => {

        const elTextArea = this.message_text_area['el'];
        // console.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elTextArea ", elTextArea);
        // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elTextArea children", elTextArea.children);
        if (elTextArea.children.length === 1) {

          const elTextAreaWrapper = elTextArea.children[0]
          // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elTextAreaWrapper", elTextAreaWrapper);

          if (elTextAreaWrapper.children.length === 1) {
            const elNativeTearea = elTextAreaWrapper.children[0]
            // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ngAfterViewInit elNativeTearea", elNativeTearea);
            elNativeTearea.setAttribute("style", "height: 37px !important; ");
          }
        }

        // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] set focus on ", this.messageTextArea);
        // Keyboard.show() // for android
        this.messageTextArea.setFocus();

      }, 1500); //a least 150ms.
    }
  }

  // -------------------------------------------------------------------------------------------
  // Change the placeholder of the 'send message' textarea according to the width of the window  
  // -------------------------------------------------------------------------------------------
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.getIfTexareaIsEmpty('onResize')
    //  console.log("[CONVS-DETAIL][MSG-TEXT-AREA]  event.target.innerWidth; ", event.target.innerWidth);
  }


  onPaste(event: any) {
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste DROP EVENT ", this.dropEvent);

    this.dropEvent = undefined

    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste event ", event);
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let file = null;
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste items ", items);
    for (const item of items) {
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item ", item);
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item.type ", item.type);

      if (item.type.startsWith("image")) {

        let content = event.clipboardData.getData('text/plain');
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste content ", content);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste this.messageString ", this.messageString);
        this.msg = this.messageString
        setTimeout(() => {
          this.messageString = "";
        }, 100);


        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item.type  ", item.type);
        file = item.getAsFile();
        const data = new ClipboardEvent('').clipboardData || new DataTransfer();
        data.items.add(new File([file], file.name, { type: file.type }));
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste data ", data);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste file ", file);

        this.presentModal(data);

      } else if (item.type.startsWith("application")) {

        event.preventDefault();

        this.presentToastOnlyImageFilesAreAllowed();
        // let content = event.clipboardData.getData('text/plain');
        // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] onPaste else content ", content);
        // setTimeout(() => {
        //   this.messageString = "";
        // }, 0)

        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onPaste file NOT SUPPORTED FILE TYPE');
      }
    }
  }

  onFileSelected(e: any) {
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] - onFileSelected event', e);
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] - onFileSelected this.messageString ", this.messageString);
    this.msg = this.messageString
    this.showEmojiPicker = false
    setTimeout(() => {
      this.messageString = "";
    }, 100);
    this.presentModal(e);

  }

  onOpenSection(section:string){
    this.section = section
    this.showEmojiPicker = false
    this.onOpenFooterSection.emit(section)
  }

  onOpenEmailModal(){
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] - onOpenEmailModal');
    this.showEmojiPicker = false
    this.presentEmailModal()
  }

  onOpenTemplateModal(){
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] - onOpenTemplateModal');
    this.showEmojiPicker = false
    this.prensentTemplateModal();
  }


  /**
 * 
 * @param e 
 */
  private async presentModal(e: any): Promise<any> {
    this.onPresentModalScrollToBottom.emit(true);
    const that = this;
    let dataFiles: any = " "
    if (e.type === 'change') {

      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e', e);
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target ', e.target);
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal change e.target.files', e.target.files);
      dataFiles = e.target.files;

    } else if (e.type === 'drop') {
      dataFiles = e.dataTransfer.files
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal drop e.dataTransfer.files', e.dataTransfer.files);
    } else {
      // paste use case
      dataFiles = e.files
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] presentModal dataFiles when paste', dataFiles);
      // const elemTexarea= <HTMLElement>document.querySelector('#ion-textarea .textarea-wrapper textarea')
      //   const elemTexarea= <HTMLInputElement>document.getElementById('ion-textarea')
      //   this.logger.log('[CONVS-DETAIL] [MSG-TEXT-AREA] presentModal elemTexarea when paste', elemTexarea);


      //  let textarea_value = elemTexarea.value
      //  this.logger.log('[CONVS-DETAIL] [MSG-TEXT-AREA] presentModal textarea_value when paste', textarea_value);
      //  textarea_value = ""
    }
    // this.logger.log('presentModal e.target.files.length', e.target.files.length);

    const attributes = { files: dataFiles, enableBackdropDismiss: false, msg: this.msg };

    const canUploadFile = checkAcceptedFile(dataFiles[0].type, this.fileUploadAccept)
    if(!canUploadFile){
      this.presentToastOnlyImageFilesAreAllowed()
      return;
    }

    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] attributes', attributes);
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LoaderPreviewPage,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: true
      });
    modal.onDidDismiss().then((detail: any) => {

      this.logger.log('presentModal onDidDismiss detail', detail);
      if (detail.data !== undefined) {
        let type = ''
        if (detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("image") && (!detail.data.fileSelected.type.includes('svg'))) {
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'image'
          // if ((detail.data.fileSelected.type && detail.data.fileSelected.type.startsWith("application")) || (detail.data.fileSelected.type && detail.data.fileSelected.type === 'image/svg+xml'))
        } else {
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail type ', detail.data.fileSelected.type);
          type = 'file'

        }

        let fileSelected = null;
        if (e.type === 'change') {
          fileSelected = e.target.files.item(0);

        } else if (e.type === 'drop') {
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP dataFiles[0]', dataFiles[0])
          fileSelected = dataFiles[0]
          // const fileList = e.dataTransfer.files;
          // this.logger.log('FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP fileList', fileList)
          // const file: File = fileList[0];
          // this.logger.log('FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP FILE', file)
          // const data = new ClipboardEvent('').clipboardData || new DataTransfer(); 
          // data.items.add(new File([file], file.name, { type: file.type }));
          // this.logger.log('FIREBASE-UPLOAD [MSG-TEXT-AREA] DROP DATA', data)
        } else {
          // PASTE USE CASE 
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD PASTE  e', e)
          fileSelected = e.files.item(0)
        }

        let messageString = detail.data.messageString;
        let metadata = detail.data.metadata;
        // let type = detail.data.type;
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail.data', detail.data);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss fileSelected', fileSelected);

        if (detail !== null) {
          const currentUpload = new UploadModel(fileSelected);
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss currentUpload', currentUpload);
          this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal onDidDismiss detail.data', detail.data);

          that.uploadService.upload(that.loggedUser.uid, currentUpload).then((data) => {
            metadata.src = data.src;
            metadata.downloadURL = data.downloadURL;
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg metadata::: ', metadata);
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg metadata downloadURL::: ', data);
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg type::: ', type);
            this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD presentModal invio msg message::: ', messageString);
            // send message
            // if(messageString === undefined) {
            //   messageString = metadata.name
            // }

            that.eventSendMessage.emit({ msg: messageString, type: type, metadata: metadata });

            that.fileInput.nativeElement.value = '';
            this.dropEvent = null
          }).catch(error => {
            // Use to signal error if something goes wrong.
            this.logger.error(`[CONVS-DETAIL][MSG-TEXT-AREA] FIREBASE-UPLOAD - upload Failed to upload file and get link `, error);

            that.presentToastFailedToUploadFile();
          });

        }
      } else {
        that.fileInput.nativeElement.value = '';
      }
    });
    return await modal.present();
  }

  private async presentEmailModal(): Promise<any>{
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] openEmailModal');
    const attributes = { 
      enableBackdropDismiss: false, 
      conversationWith: this.conversationWith, 
      msg: this.messageString,
      // email: this.leadInfo.email,
      projectId: this.leadInfo.projectId,
      translationMap: this.translationMap};
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: SendEmailModal,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: true
      });
    modal.onDidDismiss().then((detail: any) => {
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] send Email detail returned-->', detail);
      if(detail && detail.data){
        const form = detail.data.form
        if (form && form.text && form.text.trim() !== '') {
          const text = '**' + form.subject + '**\r\n' + form.text
          const attributes = {
            offline_channel: TYPE_MSG_EMAIL
          }
          this.eventSendMessage.emit({ msg: text, type: TYPE_MSG_TEXT, metadata: null, attributes: attributes });
        }
      }
    });

    return await modal.present();
  }

  private async prensentTemplateModal():Promise<any> {
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] openTemplateModal');
    const attributes = {
      loggedUser: this.loggedUser,
      enableBackdropDismiss: false, 
      conversationWith: this.conversationWith,
      projectId: this.leadInfo.projectId,
      stylesMap: this.stylesMap,
      translationMap: this.translationMap
    };
    const modal: HTMLIonModalElement = 
      await this.modalController.create({
        component: SendWhatsappTemplateModal,
        componentProps: attributes,
        swipeToClose: false,
        backdropDismiss: true
      })
    modal.onDidDismiss().then((detail: any) => {
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] send template returned-->', detail);
      
      if (detail && detail.data) {
        let attributes = {
          attachment: detail.data.attachment
        }
        let msg = "whatsapp template: " + detail.data.attachment.template.name + "\r\n" + detail.data.text;
        this.eventSendMessage.emit({ msg: msg, type: TYPE_MSG_TEXT, metadata: null, attributes: attributes });
      }
    });
    return await modal.present();
  }


  ionChange(e: any) {
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange event ", e);
    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange detail.value ", e.detail.value);

    const message = e.detail.value
    this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange message ", message);
    // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange  this.messageString ", this.messageString);
    const footerSelectionHeight = 33 
    const height = e.target.offsetHeight + footerSelectionHeight + 20; // nk added +20
    // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange text-area height ", height);
    // this.getIfTexareaIsEmpty('ionChange')
    try {
      if (message.trim().length > 0) {

        this.conversationEnabled = true;
      } else {
        this.conversationEnabled = false;
      }
    } catch (err) {
      this.logger.error("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange err ", err);
      this.conversationEnabled = false;
    }

    this.eventChangeTextArea.emit({ msg: message, offsetHeight: height });
  }

  ionFocus(){
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionFocus event ");
    if(this.showEmojiPicker){
      this.showEmojiPicker = false;
    }
  }

  // ------------------------------------------------------------------------
  // invoked by pressing the enter key on the message input field
  // if the message is not empty it is passed  to the control method
  // ------------------------------------------------------------------------
  onKeydown(e: any, text: string) {
    this.logger.log("[CONVS-DETAIL] - returnChangeTextArea - onKeydown in MSG-TEXT-AREA event", e)
    this.logger.log("[CONVS-DETAIL] - returnChangeTextArea - onKeydown in MSG-TEXT-AREA text", text)
    e.preventDefault(); // Prevent press enter from creating new line 
    // console.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea * event: ", e);

    this.countClicks++;
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - countClicks: ', this.countClicks);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event: ', e);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event target: ', e.target);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event target textContent: ', e.target.textContent);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter: ', this.tagsCannedFilter);

    // this.logger.error("[CONVS-DETAIL][MSG-TEXT-AREA] pressedOnKeyboard e.keyCode ", e.keyCode);
    // this.events.subscribe((cannedmessage) => {

    //   console.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea * cannedmessage: ", cannedmessage);
    //   });

    // user and time are the same arguments passed in `events.publish(user, time)`



    let message = e.target.textContent.trim();
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - event target textContent (message): ', message);
    // e.inputType === 'insertLineBreak' && 
    if (e.inputType === 'insertLineBreak' && message === '') {

      this.messageString = '';
      return;
    } else {
      var pos = text.lastIndexOf("/");
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - POSITION OF '/': ", pos);
      this.logger.log("[CONVS-DETAIL] returnChangeTextArea onKeydown in msg-texarea  POSITION OF '/': ", pos);
      this.logger.log("[CONVS-DETAIL] returnChangeTextArea onKeydown in msg-texarea  this.tagsCannedFilter.length': ", this.tagsCannedFilter.length);
      if (!text.includes("/")) {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 1 message: ', message);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea  SEND MESSAGE 1 message: ", message);
        this.messageString = '';
        this.sendMessage(text);
        this.countClicks = 0
      } else if (text.includes("/") && pos === 0 && this.countClicks > 1 && this.tagsCannedFilter.length > 0) {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter.length 2: ', this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 message: ", message);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 message value: ', message.value);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 text: ', text);

        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.tagsCannedFilter.length: ", this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 message: ', message);
        this.messageString = '';

        this.sendMessage(text);
        this.countClicks = 0
      } else if (text.includes("/") && pos > 0 && this.countClicks > 1 && this.tagsCannedFilter.length > 0 && text.substr(-1) !== '/') {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter.length 3: ', this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 3 message: ", message);
        // this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 3 message value: ', message.value);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 3 text: ', text);

        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.tagsCannedFilter.length: ", this.tagsCannedFilter.length);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown in msg-texarea SEND MESSAGE 2 this.countClicks: ", this.countClicks);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 2 message: ', message);
        this.messageString = '';

        this.sendMessage(text);
        this.countClicks = 0
      } else if (text.includes("/") && this.tagsCannedFilter.length === 0) {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - tagsCannedFilter.length 3: ', this.tagsCannedFilter.length);
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] onKeydown - SEND MESSAGE 3 message: ', message);
        this.logger.log("[CONVS-DETAIL] replaceTagInMessage onKeydown in msg-texarea SEND MESSAGE 3 message: ", message);
        this.messageString = '';

        this.sendMessage(text);
        this.countClicks = 0

      }
    }
  }

  listenToNewCannedResponseCreated() {
    this.eventsService.subscribe('newcannedresponse:created', (openCannedResponses) => {
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] - listenToNewCannedResponseCreated - openUserDetailsSidebar', openCannedResponses);
      this.openCannedResponses()
    });
  }

  openCannedResponses() {
    this.onClickOpenCannedResponses.emit();
    this.showEmojiPicker = false;
  }


  sendMessage(text: string) {
    this.showEmojiPicker = false;
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] sendMessage text', text);
    this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] sendMessage conve width', this.conversationWith);
    // text.replace(/\s/g, "")
    this.messageString = '';
    // text = text.replace(/(\r\n|\n|\r)/gm, '');
    if (text && text.trim() !== '') {
      this.eventSendMessage.emit({ msg: text, type: TYPE_MSG_TEXT, metadata: null, attributes: null });
    }
  }

  addEmoji($event) {
    // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI $event', $event)
    // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI $event > emoji', $event.emoji)
    // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI $event > emoji  > native', $event.emoji.native)
    // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI messageString', this.messageString)
    if (this.messageString === undefined) {
      this.addWhiteSpaceBefore = false;
      // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI addWhiteSpaceBefore ',  this.addWhiteSpaceBefore)
    } else {
      this.addWhiteSpaceBefore = true
      // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI addWhiteSpaceBefore ',  this.addWhiteSpaceBefore)
    }
    const elTextArea = this.message_text_area['el'];
    // console.log('[CONVS-DETAIL][MSG-TEXT-AREA] ADD EMOJI elTextArea ',  elTextArea)
    this.insertAtCursor(elTextArea, $event.emoji.native)
  }

  insertAtCursor(myField, myValue) {
    this.logger.log('[CANNED-RES-EDIT-CREATE] - insertAtCursor - myValue ', myValue);

    if (this.addWhiteSpaceBefore === true) {
      myValue = ' ' + myValue;
      this.logger.log('[CANNED-RES-EDIT-CREATE] - GET TEXT AREA - QUI ENTRO myValue ', myValue);
    }

    //IE support
    if (myField.selection) {
      myField.focus();
      let sel = myField.selection.createRange();
      sel.text = myValue;
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      this.logger.log('[CANNED-RES-EDIT-CREATE] - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      this.logger.log('[CANNED-RES-EDIT-CREATE] - insertAtCursor - endPos ', endPos);

      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

      // place cursor at end of text in text input element
      myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 


      // myField.select();
    } else {
      myField.value += myValue;

    }
  }



  // --------------------------------
  // on mobile !
  // --------------------------------
  onFileSelectedMobile(e: any) {
    this.logger.log('controlOfMessage');
    this.chooser.getFile()
      .then(file => {
        this.logger.log(file ? file.name : 'canceled');
      })
      .catch((error: any) => {
        this.logger.error(error);
      });
  }

  async presentToastOnlyImageFilesAreAllowed() {
    const toast = await this.toastController.create({
      message: this.translationMap.get('ONLY_IMAGE_FILES_ARE_ALLOWED_TO_PASTE'),
      duration: 3000,
      color: "danger",
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }


  async presentToastFailedToUploadFile() {
    const toast = await this.toastController.create({
      message: this.translationMap.get('UPLOAD_FILE_ERROR'),
      duration: 3000,
      color: "danger",
      cssClass: 'toast-custom-class',
    });
    toast.present();
  }


  private async closeModal() {
    this.logger.log('closeModal', this.modalController);
    await this.modalController.getTop();
    this.modalController.dismiss({ confirmed: true });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] handleKeyboardEvent  event.key ", event);
    // Note: on mac keyboard "metakey" matches "cmd"

    //do not move cursor on ArrowDown/ArrowUp
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp')&& !event.shiftKey) {
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] HAS PRESSED event.key', event.key);
      event.preventDefault();
    }
    if (event.key === 'Enter' && event.altKey || event.key === 'Enter' && event.ctrlKey || event.key === 'Enter' && event.metaKey) {
      this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] HAS PRESSED COMBO KEYS this.messageString', this.messageString);
      if (this.messageString !== undefined && this.messageString.trim() !== '') {
        this.logger.log('[CONVS-DETAIL][MSG-TEXT-AREA] HAS PRESSED Enter + ALT this.messageString', this.messageString);
        this.messageString = this.messageString + "\r\n"
      }
    }

  }

}
