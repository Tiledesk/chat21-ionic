import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { UserModel } from 'src/chat21-core/models/user';
import { checkPlatformIsMobile } from 'src/chat21-core/utils/utils';
import { LOGOS_ITEMS } from 'src/app/utils/utils-resources';

@Component({
  selector: 'send-email-modal',
  templateUrl: './send-email.page.html',
  styleUrls: ['./send-email.page.scss'],
})
export class SendEmailModal implements OnInit {

  @Input() enableBackdropDismiss: any
  @Input() conversationWith: string;
  @Input() msg: string;
  @Input() projectId: string;
  @Input() translationMap: Map<string, string>;
  @Output() onSubmitForm = new EventEmitter<{}>();

  @ViewChild('div_input_topic', {static: true}) input_topic: ElementRef;
  
  emailFormGroup: FormGroup;
  private logger: LoggerService = LoggerInstance.getInstance()
  public isMobile: boolean = false;
  LOGOS_ITEMS = LOGOS_ITEMS;
  
  constructor(
    public viewCtrl: ModalController,
    private formBuilder: FormBuilder,
    private tiledeskService: TiledeskService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    
    if (checkPlatformIsMobile()) {
      this.isMobile = true
      // this.openInfoConversation = false; // indica se è aperto il box info conversazione
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
    } else {
      this.isMobile = false
      this.logger.log('[CONVS-DETAIL] - initialize -> checkPlatformIsMobile isMobile? ', this.isMobile)
      // this.openInfoConversation = true;
    }

    this.logger.log('[SEND-EMAIL-MODAL] Hello!')
    this.emailFormGroup = this.buildFormGroup();
    this.emailFormGroup.valueChanges.subscribe((value)=> {
      value.subject !== ''? this.input_topic.nativeElement.classList.add('hasValue') : this.input_topic.nativeElement.classList.remove('hasValue')
    })
    if(this.msg && (this.msg !== '' || this.msg !== null)){
      this.emailFormGroup.patchValue({ text: this.msg})
    }

    const that = this
    setTimeout(() => {
      that.addFocus()
    }, 1500);
  }

  addFocus(){
    this.input_topic.nativeElement.querySelector('input[formcontrolname="subject"]').focus()
  }

  buildFormGroup(): FormGroup{
    return this.formBuilder.group({
      subject: ['', [Validators.required]],
      text: ['', Validators.required],
    })
  }
  async onClose() {
    this.viewCtrl.dismiss()
  }

  onSubmit(){
    this.logger.log('[SEND-EMAIL-MODAL] onSubmit -->',this.emailFormGroup)
    this.tiledeskService.sendEmail(this.projectId, this.conversationWith, this.emailFormGroup.value).subscribe((res)=> {
      this.logger.debug('[SEND-EMAIL-MODAL] subscribe to sendEmail API response -->', res)
      if(res && res.queued){
        this.viewCtrl.dismiss({form: this.emailFormGroup.value})
        this.presentToast(this.translationMap.get('EMAIL.SEND_EMAIL_SUCCESS'), 'success')
      }
    },(error)=> {
      this.logger.error('[SEND-EMAIL-MODAL] subscribe to sendEmail API CALL  - ERROR  ', error)
      this.presentToast(this.translationMap.get('EMAIL.SEND_EMAIL_ERROR'), 'danger')
    }, ()=> {
      this.logger.log('[SEND-EMAIL-MODAL] subscribe to sendEmail API CALL /* COMPLETE */')
    })
    
  }

  async presentToast(text, color) {
    const toast = await this.toastController.create({
      message: text,
      duration: 2000,
      color: color,
      // position: 'bottom'
    });
    toast.present();
  }

}
