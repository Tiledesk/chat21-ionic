import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageModel } from 'src/chat21-core/models/message';
import { MAX_WIDTH_IMAGES, MESSAGE_TYPE_MINE, MESSAGE_TYPE_OTHERS, MIN_WIDTH_IMAGES } from 'src/chat21-core/utils/constants';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { isAudio, isFile, isFrame, isImage, messageType } from 'src/chat21-core/utils/utils-message';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import * as moment from 'moment';
import { ModalController, PopoverController } from '@ionic/angular';
import { convertColorToRGBA } from 'src/chat21-core/utils/utils';
import { getColorBck } from 'src/chat21-core/utils/utils-user';

@Component({
  selector: 'chat-bubble-message',
  templateUrl: './bubble-message.component.html',
  styleUrls: ['./bubble-message.component.scss']
})
export class BubbleMessageComponent implements OnInit, OnChanges {

  @Input() message: MessageModel;
  @Input() isSameSender: boolean;
  @Input() fontColor: string;
  @Input() fontSize: string;
  @Input() fontFamily: string;
  @Input() stylesMap: Map<string, string>;
  @Input() supportMode: boolean;
  @Input() isCopilotEnabled: boolean = false;
  @Output() onBeforeMessageRender = new EventEmitter();
  @Output() onAfterMessageRender = new EventEmitter();
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();
  @Output() onOptionsDataReturned = new EventEmitter<{option: string, message: MessageModel}>();
  
  isImage = isImage;
  isFile = isFile;
  isFrame = isFrame;
  isAudio = isAudio;
  convertColorToRGBA = convertColorToRGBA

  // ========== begin:: check message type functions ======= //
  messageType = messageType;

  MESSAGE_TYPE_MINE = MESSAGE_TYPE_MINE;
  MESSAGE_TYPE_OTHERS = MESSAGE_TYPE_OTHERS;
 // ========== end:: check message type functions ======= //
 
  public browserLang: string;
  
  sizeImage : { width: number, height: number}
  fullnameColor: string;
  public logger: LoggerService = LoggerInstance.getInstance()
 
  constructor(
    public sanitizer: DomSanitizer,
    private translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public modalController: ModalController
    ) {
    // console.log('BUBBLE-MSG Hello !!!!')
  }

  ngOnInit() {
    // this.setMomentLocale()
  }


  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    const currentUser = this.tiledeskAuthService.getCurrentUser();
    let currentUserId = ''
    if (currentUser) {
      currentUserId = currentUser.uid
    }

    const stored_preferred_lang = localStorage.getItem(currentUserId + '_lang');

    let chat_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      chat_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      chat_lang = stored_preferred_lang
    }
    moment.updateLocale(chat_lang , {
      calendar: {
        sameElse: 'LLLL'
      }
    });
  }

  ngOnChanges() {
    if (this.message && this.message.metadata && typeof this.message.metadata === 'object') {
      this.sizeImage = this.getMetadataSize(this.message.metadata)
    }

    if(this.fontColor){
      this.fullnameColor = convertColorToRGBA(this.fontColor, 65)
    }
    if(this.message && this.message.sender_fullname && this.message.sender_fullname.trim() !== ''){
      this.fullnameColor = getColorBck(this.message.sender_fullname)
    }
  }


  /**
   *
   * @param message
   */
  // getMetadataSize(metadata): any {
  //   if(metadata.width === undefined){
  //     metadata.width= MAX_WIDTH_IMAGES
  //   }
  //   if(metadata.height === undefined){
  //     metadata.height = MAX_WIDTH_IMAGES
  //   }
  //   // const MAX_WIDTH_IMAGES = 300;
  //   const sizeImage = {
  //       width: metadata.width,
  //       height: metadata.height
  //   };
  //   //   that.g.wdLog(['message::: ', metadata);
  //   if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
  //       const rapporto = (metadata['width'] / metadata['height']);
  //       sizeImage.width = MAX_WIDTH_IMAGES;
  //       sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
  //   }
  //   return sizeImage; // h.toString();
  // }

  getMetadataSize(metadata): any {
    // if (metadata.width === undefined) {
    //   metadata.width = MAX_WIDTH_IMAGES
    // }
    // if (metadata.height === undefined) {
    //   metadata.height = MAX_WIDTH_IMAGES
    // }

    const sizeImage = {
      width: metadata.width,
      height: metadata.height
    };

    if (metadata.width && metadata.width < MAX_WIDTH_IMAGES) {
      if (metadata.width <= 55) {
        const ratio = (metadata['width'] / metadata['height']);
        sizeImage.width = MIN_WIDTH_IMAGES;
        sizeImage.height = MIN_WIDTH_IMAGES / ratio;
      } else if (metadata.width > 55) {
        sizeImage.width = metadata.width;
        sizeImage.height = metadata.height
      }
      
    } else if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
      const ratio = (metadata['width'] / metadata['height']);
      sizeImage.width = MAX_WIDTH_IMAGES;
      sizeImage.height = MAX_WIDTH_IMAGES / ratio;
    }
    return sizeImage
  }

  // onClickOptionsMessage(event, message){
  //   this.logger.log('[BUBBLE-MESSAGE] - onClickOptionsMessage', message);
  //   this.presentPopover(event, message)
  // }
  onOptionsDataReturnedFN(event){
    this.onOptionsDataReturned.emit(event)
  }
  // ========= begin:: event emitter function ============//

  // returnOpenAttachment(event: String) {
  //   this.onOpenAttachment.emit(event)
  // }

  // /** */
  // returnClickOnAttachmentButton(event: any) {
  //   this.onClickAttachmentButton.emit(event)
  // }

  returnOnBeforeMessageRender(event) {
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component }
    this.onBeforeMessageRender.emit(messageOBJ)
  }

  returnOnAfterMessageRender(event) {
    const messageOBJ = { message: this.message, sanitizer: this.sanitizer, messageEl: event.messageEl, component: event.component }
    this.onAfterMessageRender.emit(messageOBJ)
  }

  onElementRenderedFN(event){
    this.onElementRendered.emit({element: event.element, status: event.status})
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

