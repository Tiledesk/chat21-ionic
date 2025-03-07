import { PopoverController } from '@ionic/angular';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { BubbleInfoPopoverComponent } from 'src/app/components/bubbleMessageInfo-popover/bubbleinfo-popover.component';
import { MessageModel } from 'src/chat21-core/models/message';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { CopilotPopoverComponent } from 'src/app/components/copilot-popover/copilot-popover.component';

@Component({
  selector: 'chat-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

  @Input() message: MessageModel;
  @Input() isCopilotEnabled: boolean = false;
  @Input() logLevel: number;
  @Output() onOptionsDataReturned = new EventEmitter<{option: string, data: any}>();

  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  onClickOptionsMessage(event){
      this.logger.log('[BUBBLE-MESSAGE] - onClickOptionsMessage', this.message);
      this.presentPopover(event)
  }

  onClickOptionsCopilot(event){
    this.logger.log('[BUBBLE-MESSAGE] - onClickOptionsCopilot', this.message);
    this.presentCopilotPopover(event)
  }

  
  
  async presentPopover(ev: any) {
    const attributes = {
      message: this.message,
      logLevel: this.logLevel,
      conversationWith: this.message.recipient
    }
    const popover = await this.popoverController.create({
      component: BubbleInfoPopoverComponent,
      cssClass: 'info-popover',
      componentProps: attributes,
      event: ev,
      translucent: true,
      keyboardClose: true,
      showBackdrop: false
    });
    popover.onDidDismiss().then((dataReturned: any) => {
      this.logger.log('[BUBBLE-MESSAGE] presentPopover dismissed. Returned value::', dataReturned.data)
      if(dataReturned.data){
        this.onOptionsDataReturned.emit({option: dataReturned.data.option, data: {message: this.message}})
      }
    })

    return await popover.present();
  }

  async presentCopilotPopover(ev: any) {
    const attributes = {
      message: this.message,
      logLevel: this.logLevel,
      conversationWith: this.message.recipient
    }
    const popover = await this.popoverController.create({
      component: CopilotPopoverComponent,
      cssClass: 'copilot-popover',
      componentProps: attributes,
      event: ev,
      translucent: true,
      keyboardClose: true,
      showBackdrop: false,
    });
    popover.onDidDismiss().then((dataReturned: any) => {
      this.logger.log('[BUBBLE-MESSAGE] presentCopilotPopover dismissed. Returned value::', dataReturned.data)
      if(dataReturned.data){
        this.onOptionsDataReturned.emit({option: 'copilot_question', data: {text: dataReturned.data.text}})
      }
    })

    return await popover.present();
  }

}
