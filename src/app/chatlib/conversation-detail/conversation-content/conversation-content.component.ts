import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, SimpleChanges } from '@angular/core';
import { MessageModel } from 'src/chat21-core/models/message';
import { MSG_STATUS_SENT, MSG_STATUS_RETURN_RECEIPT, MSG_STATUS_SENT_SERVER, MAX_WIDTH_IMAGES, MESSAGE_TYPE_INFO, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS } from 'src/chat21-core/utils/constants';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { UploadService } from 'src/chat21-core/providers/abstract/upload.service';
import { isEmojii, isFirstMessage, isInfo, isLastMessage, isMine, isSameSender, messageType } from 'src/chat21-core/utils/utils-message';
@Component({
  selector: 'tiledeskwidget-conversation-content',
  templateUrl: './conversation-content.component.html',
  styleUrls: ['./conversation-content.component.scss']
})
export class ConversationContentComponent implements OnInit {
  @ViewChild('scrollMe', { static: false }) private scrollMe: ElementRef;

  @Input() messages: MessageModel[]
  @Input() senderId: string;
  @Input() baseLocation: string;
  @Input() isConversationArchived: boolean;
  @Input() isTypings: boolean;
  @Input() idUserTypingNow: string;
  @Input() nameUserTypingNow: string;
  @Input() typingLocation: string;
  @Input() fullscreenMode: boolean;
  @Input() translationMap: Map<string, string>;
  @Input() stylesMap: Map<string, string>;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onMenuOptionShow = new EventEmitter<boolean>();
  @Output() onEmojiiPickerShow = new EventEmitter<boolean>()
  @Output() onAttachmentButtonClicked = new EventEmitter();
  @Output() onScrollContent = new EventEmitter();

  // ========= begin:: gestione scroll view messaggi ======= //
  startScroll = true; // indica lo stato dello scroll: true/false -> è in movimento/ è fermo
  idDivScroll = 'c21-contentScroll'; // id div da scrollare
  isScrolling = false;
  isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
  firstScroll = true;
  // ========= end:: gestione scroll view messaggi ======= //


  // ========== begin:: set icon status message ======= //
  MSG_STATUS_SENT = MSG_STATUS_SENT;
  MSG_STATUS_SENT_SERVER = MSG_STATUS_SENT_SERVER;
  MSG_STATUS_RETURN_RECEIPT = MSG_STATUS_RETURN_RECEIPT;
  // ========== end:: icon status message ======= //


  // ========== begin:: check message type functions ======= //
  isMine = isMine;
  isInfo = isInfo;
  messageType = messageType;
  isEmojii = isEmojii;

  MESSAGE_TYPE_INFO = MESSAGE_TYPE_INFO;
  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;
  // ========== end:: check message type functions ======= //

  urlBOTImage = 'https://s3.eu-west-1.amazonaws.com/tiledesk-widget/dev/2.0.4-beta.7/assets/img/avatar_bot_tiledesk.svg'
  uploadProgress: number;
  showUploadProgress: boolean = false;
  fileType: string;
  logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public cdref: ChangeDetectorRef,
    public uploadService: UploadService
  ) { }

  ngOnInit() {
    this.listenToUploadFileProgress()
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }



  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {

    if (metadata.width === undefined) {
      metadata.width = MAX_WIDTH_IMAGES
    }
    if (metadata.height === undefined) {
      metadata.height = MAX_WIDTH_IMAGES
    }
    // const MAX_WIDTH_IMAGES = 300;
    const sizeImage = {
      width: metadata.width,
      height: metadata.height
    };
    //   that.g.wdLog(['message::: ', metadata);
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
      const rapporto = (metadata['width'] / metadata['height']);
      sizeImage.width = MAX_WIDTH_IMAGES;
      sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage; // h.toString();
  }


  // ENABLE HTML SECTION 'FILE PENDING UPLOAD'
  listenToUploadFileProgress() {
    this.uploadService.BSStateUpload.subscribe((data: any) => {
      this.logger.log('[CONV-CONTENT-W] BSStateUpload', data);
      // && data.type.startsWith("application")
      if (data ) {
        data.upload === 100 || isNaN(data.upload) ? this.showUploadProgress = false : this.showUploadProgress = true
        this.uploadProgress = data.upload
        this.fileType = 'file'
        this.scrollToBottom()
      }
    });
  }


  // ========= begin:: functions scroll position ======= //

  // LISTEN TO SCROLL POSITION
  onScroll(event): void {
    // console.log('************** SCROLLLLLLLLLL *****************');
    this.startScroll = false;
    if (this.scrollMe) {
      const divScrollMe = this.scrollMe.nativeElement;
      const checkContentScrollPositionIsEnd = this.checkContentScrollPosition(divScrollMe);
      if (checkContentScrollPositionIsEnd) {
        this.onScrollContent.emit(true)
        //this.showBadgeScroollToBottom = false;
        //this.NUM_BADGES = 0;
      } else {
        this.onScrollContent.emit(false)
        //this.showBadgeScroollToBottom = true;
      }
    }
  }

  /**
   *
   */
  checkContentScrollPosition(divScrollMe?): boolean {
    if (!divScrollMe) {
      divScrollMe = this.scrollMe.nativeElement
    }
    if (divScrollMe.scrollHeight - divScrollMe.scrollTop <= (divScrollMe.clientHeight + 40)) {
      this.logger.log('[CONV-CONTENT-W] - SONO ALLA FINE');
      return true;
    } else {
      this.logger.log('[CONV-CONTENT-W] - NON SONO ALLA FINE');
      return false;
    }
  }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */

  //  scrollToBottomStart() {
  //   const that = this;
  //   if ( this.isScrolling === false ) {
  //     setTimeout(function () {
  //       try {
  //         that.isScrolling = true;
  //         const objDiv = document.getElementById(that.idDivScroll);
  //         setTimeout(function () {
  //           that.g.wdLog(['objDiv::', objDiv.scrollHeight]);
  //           //objDiv.scrollIntoView(false);
  //           objDiv.style.opacity = '1';
  //         }, 200);
  //         that.isScrolling = false;
  //       } catch (err) {
  //         that.g.wdLog(['> Error :' + err]);
  //       }
  //     }, 0);
  //   }
  // }

  /**
   * scrollo la lista messaggi all'ultimo
   * chiamato in maniera ricorsiva sino a quando non risponde correttamente
  */

  scrollToBottom(withoutAnimation?: boolean) {
    const that = this;
    try {
      that.isScrolling = true;
      const objDiv = document.getElementById(that.idDivScroll) as HTMLElement;
      // const element = objDiv[0] as HTMLElement;
      setTimeout(function () {

        if (that.isIE === true || withoutAnimation === true || that.firstScroll === true) {
          objDiv.parentElement.classList.add('withoutAnimation');
        } else {
          objDiv.parentElement.classList.remove('withoutAnimation');
        }
        objDiv.parentElement.scrollTop = objDiv.scrollHeight;
        objDiv.style.opacity = '1';
        that.firstScroll = false;
      }, 0);
    } catch (err) {
      this.logger.error('[CONV-CONTENT-W] scrollToBottom > Error :' + err);
    }
    that.isScrolling = false;
  }

  // ========= END:: functions scroll position ======= //

  isLastMessage(idMessage: string):boolean {
    return isLastMessage(this.messages, idMessage)
    // if (idMessage === this.messages[this.messages.length - 1].uid) {
    //   return true;
    // }
    // return false;
  }

  isSameSender(senderId, index):boolean{
    return isSameSender(this.messages, senderId, index)
    // if(senderId && this.messages[index - 1] && (senderId === this.messages[index - 1].sender)){
    //   return true;
    // }
    // return false;
  }


  isFirstMessage(senderId, index):boolean{
    return isFirstMessage(this.messages, senderId, index)
    // if(senderId && index == 0 && this.messages[index] && (this.messages[index] !== senderId)){
    //   return true;
    // }
    // return false;
  }

  hideOutsideElements() {
    this.onMenuOptionShow.emit(false)
  }


  // ========= begin:: event emitter function ============//

  onAttachmentButtonClickedFN(event: any) {
    this.onAttachmentButtonClicked.emit(event)
  }

  onBeforeMessageRenderFN(event) {
    //decommentare se in html c'è solamente component tiledesk-text
    //const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component}
    this.onBeforeMessageRender.emit(event)
  }

  onAfterMessageRenderFN(event) {
    this.onAfterMessageRender.emit(event)
  }

  onElementRenderedFN(event) {
    const elementRendered = event;
    if (elementRendered.status && this.scrollMe) {
      const divScrollMe = this.scrollMe.nativeElement;
      const checkContentScrollPosition = this.checkContentScrollPosition(divScrollMe);
      this.scrollToBottom() // SCROLLO SEMPRE
      // if (!checkContentScrollPosition) { // SE NON SONO ALLA FINE, SCROLLO CONTENT
      // }
 
    }
  }

  // printMessage(message, messageEl, component) {
  //   const messageOBJ = { message: message, sanitizer: this.sanitizer, messageEl: messageEl, component: component}
  //   this.onBeforeMessageRender.emit(messageOBJ)
  //   const messageText = message.text;
  //   this.onAfterMessageRender.emit(messageOBJ)
  //   // this.triggerBeforeMessageRender(message, messageEl, component);
  //   // const messageText = message.text;
  //   // this.triggerAfterMessageRender(message, messageEl, component);
  //   return messageText;
  // }
  // ========= END:: event emitter function ============//

}
