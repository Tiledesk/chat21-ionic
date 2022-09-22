import { BubbleMessageComponent } from './../../message/bubble-message/bubble-message.component';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ion-bubble-message',
  templateUrl: './ion-bubble-message.component.html',
  styleUrls: ['./ion-bubble-message.component.scss'],
})
export class IonBubbleMessageComponent extends BubbleMessageComponent implements OnInit {

  constructor(
    public sanitizer: DomSanitizer,
    public translate: TranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public modalController: ModalController) {
    super(sanitizer, translate, tiledeskAuthService, modalController);
  }

  ngOnInit() {}

}
