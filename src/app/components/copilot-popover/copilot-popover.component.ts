import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MessageModel } from 'src/chat21-core/models/message';
import { UserModel } from 'src/chat21-core/models/user';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';

@Component({
  selector: 'app-copilot-popover',
  templateUrl: './copilot-popover.component.html',
  styleUrls: ['./copilot-popover.component.scss'],
})
export class CopilotPopoverComponent implements OnInit {

  @Input() message: MessageModel
  
  text: string;
  loggedUser: UserModel

  public translationsMap: Map<string, string>;
  private logger: LoggerService = LoggerInstance.getInstance()

  constructor(
    private ctr: PopoverController,
    private tiledeskAuthService: TiledeskAuthService,
    private customTranslateService: CustomTranslateService,
  ) { }

  ngOnInit() {
    this.logger.debug('[COPILOT-POPOVER] ngOnInit message data:', this.message)
    this.loggedUser = this.tiledeskAuthService.getCurrentUser();
    this.text = this.message.text
    this.initTranslations();
  }

  onClose(){
    this.ctr.dismiss()
  }

  initTranslations(){
    let keys= [
      "HELLO",
      "COPILOT.ASK_AI",
      "COPILOT.INSERT_PROMPT_HERE",
      "COPILOT.HOW_CAN_I_HELP_YOU"
    ]
    this.translationsMap = this.customTranslateService.translateLanguage(keys)
  }

  onClickCopilot(){
    this.logger.debug('[COPILOT-POPOVER] onClickCopilot')
    this.ctr.dismiss({text: this.text})
  }


  ionChange(e: any) {
    this.logger.log("[COPILOT-POPOVER] ionChange event ", e);
    // this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionChange detail.value ", e.detail.value);

    const message = e.detail.value
    this.logger.log("[COPILOT-POPOVER] [MSG-TEXT-AREA] ionChange message ", message);
    // this.logger.log("[CONVS-DETAIL] [MSG-TEXT-AREA] ionChange  this.messageString ", this.messageString);
    const footerSelectionHeight = 33 
    const height = e.target.offsetHeight + footerSelectionHeight + 20; // nk added +20

    // this.eventChangeTextArea.emit({ msg: message, offsetHeight: height });
  }

  ionFocus(){
    this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] ionFocus event ");
  }

  onKeydown(e: any) {
    this.logger.log("[COPILOT-POPOVER] - returnChangeTextArea - onKeydown in MSG-TEXT-AREA event", e)
  }


}
