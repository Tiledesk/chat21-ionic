import { BubbleInfoPopoverComponent } from '../../components/bubbleMessageInfo-popover/bubbleinfo-popover.component';
import { CannedResponseComponent } from './../../components/canned-response/canned-response.component';
import { TruncatePipe } from './../../directives/truncate.pipe';
import { IonConversationDetailComponent } from '../../chatlib/conversation-detail/ion-conversation-detail/ion-conversation-detail.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';

import { IonicModule } from '@ionic/angular';
import { ConversationDetailPageRoutingModule } from './conversation-detail-routing.module';
import { ConversationDetailPage } from './conversation-detail.page';

// tslint:disable-next-line: max-line-length


import { SharedModule } from 'src/app/shared/shared.module';
import { ScrollbarThemeModule } from '../../utils/scrollbar-theme.directive';
import { PickerModule } from '@ctrl/ngx-emoji-mart';


import { ConversationInfoModule } from 'src/app/components/conversation-info/conversation-info.module';
import { ConversationContentComponent } from 'src/app/chatlib/conversation-detail/conversation-content/conversation-content.component';
import { HeaderConversationDetailComponent } from '../../components/conversation-detail/header-conversation-detail/header-conversation-detail.component';
import { MessageTextAreaComponent } from '../../components/conversation-detail/message-text-area/message-text-area.component';
import { BubbleMessageComponent } from './../../chatlib/conversation-detail/message/bubble-message/bubble-message.component';
import { FrameComponent } from 'src/app/chatlib/conversation-detail/message/frame/frame.component';
import { ImageComponent } from 'src/app/chatlib/conversation-detail/message/image/image.component';
import { AudioComponent } from 'src/app/chatlib/conversation-detail/message/audio/audio.component';
import { TextComponent } from 'src/app/chatlib/conversation-detail/message/text/text.component';
import { MomentModule } from 'ngx-moment';
import { AvatarComponent } from 'src/app/chatlib/conversation-detail/message/avatar/avatar.component';
import { ActionButtonComponent } from 'src/app/chatlib/conversation-detail/message/buttons/action-button/action-button.component';
import { LinkButtonComponent } from 'src/app/chatlib/conversation-detail/message/buttons/link-button/link-button.component';
import { TextButtonComponent } from 'src/app/chatlib/conversation-detail/message/buttons/text-button/text-button.component';
import { HtmlComponent } from 'src/app/chatlib/conversation-detail/message/html/html.component';
import { InfoMessageComponent } from 'src/app/chatlib/conversation-detail/message/info-message/info-message.component';
import { MessageAttachmentComponent } from 'src/app/chatlib/conversation-detail/message/message-attachment/message-attachment.component';
import { ReturnReceiptComponent } from 'src/app/chatlib/conversation-detail/message/return-receipt/return-receipt.component';
import { OptionsComponent } from 'src/app/chatlib/conversation-detail/message/options/options.component';
import { UserTypingComponent } from 'src/chat21-core/utils/user-typing/user-typing.component';
import { AvatarProfileComponent } from 'src/app/components/utils/avatar-profile/avatar-profile.component';
import { CopilotSuggestionsComponent } from 'src/app/components/copilot-suggestions/copilot-suggestions.component';
import { CopilotPopoverComponent } from 'src/app/components/copilot-popover/copilot-popover.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConversationDetailPageRoutingModule,
    ConversationInfoModule,
    ScrollbarThemeModule,
    PickerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
    }),
    SharedModule,
    MomentModule
  ],
  // entryComponents: [MessageTextAreaComponent],
  entryComponents: [ BubbleInfoPopoverComponent, CopilotPopoverComponent],
  declarations: [
    ConversationDetailPage,
    //******** COMPONENTS - init ********//
    // --------- header --------- //
    HeaderConversationDetailComponent,
    // --------- content --------- //
    IonConversationDetailComponent,
    ConversationContentComponent,
    BubbleMessageComponent,
    FrameComponent,
    ImageComponent,
    AudioComponent,
    TextComponent,
    AvatarComponent,
    HtmlComponent,
    InfoMessageComponent,
    MessageAttachmentComponent,
    ActionButtonComponent,
    LinkButtonComponent,
    TextButtonComponent,
    ReturnReceiptComponent,
    OptionsComponent,
    BubbleInfoPopoverComponent,
    CopilotPopoverComponent,
    UserTypingComponent,
    // --------- footer --------- //
    MessageTextAreaComponent,
    CannedResponseComponent,
    CopilotSuggestionsComponent,


    TruncatePipe
  ],
  exports:[
    // --------- content --------- //
    // IonConversationDetailComponent,
    // ConversationContentComponent,
    // BubbleMessageComponent,
  ]
})
export class ConversationDetailPageModule {}
