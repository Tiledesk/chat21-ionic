import { CannedResponsesService } from 'src/app/services/canned-responses/canned-responses.service';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { MenuController } from '@ionic/angular';
import { EventsService } from 'src/app/services/events-service';
import { ActivatedRoute } from '@angular/router';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';

@Component({
  selector: 'app-create-canned-response',
  templateUrl: './create-canned-response.page.html',
  styleUrls: ['./create-canned-response.page.scss'],
})
export class CreateCannedResponsePage implements OnInit {
  
  @Input() message: any
  @Input() conversationWith: string;

  @ViewChild('div_input_topic', {static: true}) input_topic: ElementRef;
  
  cannedFormGroup: FormGroup;
  private logger: LoggerService = LoggerInstance.getInstance();

  prjctID: string;
  tiledeskToken: string;
  showSpinnerCreateCannedResponse: boolean = false;
  addWhiteSpaceBefore: boolean;
  mouseOverBtnAddRecipientNamePlaceholder: boolean = false;
  mouseOverBtnAddAgentNamePlaceholder: boolean = false;
  translationsMap: Map<string, string> = new Map<string, string>()
  // public conversationWith: string;
  constructor(
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private translateService: CustomTranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    public cannedResponsesService: CannedResponsesService,
    private menu: MenuController,
    public events: EventsService,
    private route: ActivatedRoute,
  ) {
    //   this.route.paramMap.subscribe((params) => {
    //  console.log('[CONVS-DETAIL] - constructor -> params: ', params)
    //   this.conversationWith = params.get('IDConv')


    // })
  }



  ngOnInit() {
    // this.getCurrentProjectId();
    // console.log('[CREATE-CANNED-RES] - conversationWith ', this.conversationWith)
     console.log('[CREATE-CANNED-RES] - message ', this.message, this.conversationWith)
    this.tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CREATE-CANNED-RES] tiledeskToken ', this.tiledeskToken)
    this.getCurrentProjectId(this.conversationWith, this.tiledeskToken);


    let keys= [
      'Title',
      'EnterCannedResponseTitle',
      'Message',
      'WriteMsgToSendToYourVisitors',
      'AddCustomization',
      'Add',
      'First_name_of_recipient',
      'First_name_of_agent',
      'SelectACustomizationToAddToYourMessage',
      'recipient_name_desc',
      'agent_name_desc'
    ]

    this.translationsMap = this.translateService.translateLanguage(keys)

    this.cannedFormGroup = this.buildForm()
    this.cannedFormGroup.valueChanges.subscribe((value)=> {
      value.title !== ''? this.input_topic.nativeElement.classList.add('hasValue') : this.input_topic.nativeElement.classList.remove('hasValue')
    });
    if(this.message && (this.message !== '' || this.message !== null)){
      this.cannedFormGroup.patchValue({ message: this.message})
    }

    const that = this
    setTimeout(() => {
      that.addFocus()
    }, 1500);
  }

  buildForm() : FormGroup{
    return this.formBuilder.group({
      title: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  addFocus(){
    this.input_topic.nativeElement.querySelector('input[formcontrolname="title"]').focus()
  }


  getCurrentProjectId(conversation_id, tiledeskToken) {
    const conversationWith_segments = conversation_id.split('-')
    // Removes the last element of the array if is = to the separator
    if (
      conversationWith_segments[conversationWith_segments.length - 1] === ''
    ) {
      conversationWith_segments.pop()
    }

    if (conversationWith_segments.length === 4) {
      const lastArrayElement = conversationWith_segments[conversationWith_segments.length - 1]
      this.logger.log('[CREATE-CANNED-RES] - lastArrayElement ', lastArrayElement)
      this.logger.log('[CREATE-CANNED-RES]- lastArrayElement length', lastArrayElement.length)
      // if (lastArrayElement.length !== 32) {
      //   conversationWith_segments.pop()
      // }
    }

    this.logger.log('[CREATE-CANNED-RES] - loadTagsCanned conversationWith_segments ', conversationWith_segments)
    // let projectId = ''

    if (conversationWith_segments.length === 4) {
      this.prjctID = conversationWith_segments[2]
      this.logger.log('[CREATE-CANNED-RES] - loadTagsCanned projectId ', this.prjctID)
    } else {
      this.getProjectIdByConversationWith(conversation_id, tiledeskToken)
    }
  }

  getProjectIdByConversationWith(conversationWith: string, tiledeskToken: string) {
    // const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService.getProjectIdByConvRecipient(tiledeskToken, conversationWith).subscribe((res) => {
      this.logger.log('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT RES', res)
      if (res) {
        this.prjctID = res.id_project
        this.logger.log('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT projectId ', this.prjctID)
      }
    }, (error) => {
      this.logger.error('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
    },() => {
      this.logger.log('[CREATE-CANNED-RES] - GET PROJECTID BY CONV RECIPIENT * COMPLETE *',)
    })
  }


  


  validation_messages = {
    'title': [
      { type: 'required', message: this.translate.instant('TitleIsRequired') }
    ],
    'message': [
      { type: 'required', message: this.translate.instant('MessageIsRequired') }
    ],
  };

  onSubmit() {
    const canned = this.cannedFormGroup.value
    this.logger.log('[CREATE-CANNED-RES] ON SUBMIT VALUES', canned);
    this.createResponse(canned.message, canned.title)
  }

  createResponse(message: string, title: string) {
    this.showSpinnerCreateCannedResponse = true;
    this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP - MSG ', message);
    this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP - TITLE ', title);

    this.cannedResponsesService.add(this.prjctID, title.trim(), message.trim()).subscribe((responses: any) => {
      this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP - RES ', responses);
    }, (error) => {
      this.logger.error('[CREATE-CANNED-RES]- CREATE CANNED RESP - ERROR  ', error);
      this.showSpinnerCreateCannedResponse = false;
    }, () => {
      this.logger.log('[CREATE-CANNED-RES] - CREATE CANNED RESP * COMPLETE *');
      this.showSpinnerCreateCannedResponse = false;
      this.closeModalCreateCannedResponseModal()
      this.events.publish('newcannedresponse:created', true);
    });
  }

  openAddPersonalisationMenu() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  addPlaceholdertoMsg(key) {
    this.menu.close('custom')
    this.menu.enable(false, 'custom');
    this.insertCustomField(key)
  }


  cannedResponseMessageChanged($event) {
    // this.logger.log('[CREATE-CANNED-RES] - ON MSG CHANGED ', $event);

    if (/\s$/.test($event)) {
      // this.logger.log('[CREATE-CANNED-RES] - ON MSG CHANGED - string contains space at last');
      this.addWhiteSpaceBefore = false;
    } else {
      // this.logger.log('[CREATE-CANNED-RES] - ON MSG CHANGED - string does not contain space at last');
      // IS USED TO ADD A WHITE SPACE TO THE 'PERSONALIZATION' VALUE IF THE STRING DOES NOT CONTAIN SPACE AT LAST
      this.addWhiteSpaceBefore = true;
    }

  }

  insertCustomField(customfieldValue: string) {
    const elTextarea = <HTMLElement>document.querySelector('#message');
    this.logger.log('[CREATE-CANNED-RES] - GET TEXT AREA - elTextarea ', elTextarea);
    if (elTextarea) {
      this.insertAtCursor(elTextarea, customfieldValue)
    }
  }
  insertAtCursor(myField, myValue) {
    this.logger.log('[CREATE-CANNED-RES] - insertAtCursor - myValue ', myValue);

    if (this.addWhiteSpaceBefore === true) {
      myValue = ' ' + myValue;
      this.logger.log('[CREATE-CANNED-RES] - GET TEXT AREA - QUI ENTRO myValue ', myValue);
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
      this.logger.log('[CREATE-CANNED-RES] - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      this.logger.log('[CREATE-CANNED-RES] - insertAtCursor - endPos ', endPos);

      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

      // place cursor at end of text in text input element
      myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 

      // this.cannedResponseMessage = myField.value;

      // this.texareaIsEmpty = false;
      // myField.select();
    } else {
      myField.value += myValue;
      // this.cannedResponseMessage = myField.value;
    }
    this.cannedFormGroup.patchValue({message: myField.value})
  }


  async closeModalCreateCannedResponseModal() {
    if (this.menu) {
      this.menu.close('custom')
      this.menu.enable(false, 'custom');
    }
    await this.modalController.getTop()
    this.modalController.dismiss({ confirmed: true })
  }

}
