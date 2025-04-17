import { TooltipDirective } from './../directives/tooltip.directive';
import { NavbarComponent } from './../components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NetworkOfflineComponent } from './../components/network-offline/network-offline.component';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AvatarProfileComponent } from 'src/app/components/utils/avatar-profile/avatar-profile.component';

import { UserPresenceComponent } from 'src/app/components/utils/user-presence/user-presence.component';
import { MomentModule } from 'ngx-moment';
import { MarkedPipe } from 'src/app/directives/marked.pipe';
import { AutofocusDirective } from 'src/app/directives/autofocus.directive';
import { HtmlEntitiesEncodePipe } from 'src/app/directives/html-entities-encode.pipe';
import { ImageViewerComponent } from 'src/app/components/image-viewer/image-viewer.component';
import { SidebarComponent } from 'src/app/components/sidebar/sidebar.component';
import { SidebarUserDetailsComponent } from 'src/app/components/sidebar-user-details/sidebar-user-details.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SafeHtmlPipe } from '../directives/safe-html.pipe';

// import { MessageTextAreaComponent } from '../components/conversation-detail/message-text-area/message-text-area.component'; // MessageTextAreaComponent is part of the declarations ConversationDetailPageModule

@NgModule({
  declarations: [
     //CONVERSATION_LIST
    //  ListConversationsComponent,
    //  IonListConversationsComponent,
    //  HeaderConversationsList,
    //  HeaderConversationsListArchived,
    //  HeaderConversationsListUnassigned,
    //  ProjectItemComponent,
     //CONVERSATION_DETAIL
    //  IonConversationDetailComponent,
    //  ConversationContentComponent,
    //  UserTypingComponent,
    //  MessageAttachmentComponent,
    //  TextButtonComponent,
    //  LinkButtonComponent,
    //  ActionButtonComponent,
    //  InfoMessageComponent,
    //  AvatarComponent,
    //  BubbleMessageComponent,
    //  FrameComponent,
    //  ImageComponent,
    //  AudioComponent,
    //  ReturnReceiptComponent,
    //  TextComponent,
    //  OptionsComponent,
    //  HtmlComponent,

     //CONVERSATION_DETAIL_INFO
    //  InfoContentComponent,
    //  InfoSupportGroupComponent,
    //  InfoDirectComponent,
    //  InfoGroupComponent,
    //  AdvancedInfoAccordionComponent,
 
     //NAVBAR - SIDEBAR
     NavbarComponent,
     SidebarComponent,
     SidebarUserDetailsComponent,
    
     //DIRECTIVES
     AutofocusDirective,
     TooltipDirective,
     MarkedPipe,
     HtmlEntitiesEncodePipe,
     SafeHtmlPipe,
 


     AvatarProfileComponent,
     UserPresenceComponent,
     ImageViewerComponent,
     NetworkOfflineComponent
  ],
  exports: [
    //CONVERSATION_LIST
    // ListConversationsComponent,
    // IonListConversationsComponent,
    // HeaderConversationsList,
    // HeaderConversationsListArchived,
    // HeaderConversationsListUnassigned,
    // ProjectItemComponent,
    //CONVERSATION_DETAIL
    // IonConversationDetailComponent,
    // ConversationContentComponent,
    // UserTypingComponent,
    // TextButtonComponent,
    // LinkButtonComponent,
    // ActionButtonComponent,
    // InfoMessageComponent,
    // AvatarComponent,
    // BubbleMessageComponent,
    // MessageAttachmentComponent,
    // FrameComponent,
    // ImageComponent,
    // AudioComponent,
    // ReturnReceiptComponent,
    // TextComponent,
    // OptionsComponent,
    //CONVERSATION_DETAIL_INFO
    // InfoContentComponent,
    // InfoSupportGroupComponent,
    // InfoDirectComponent,
    // InfoGroupComponent,
    
    //NAVBAR - SIDEBAR
    NavbarComponent,
    SidebarComponent,
    SidebarUserDetailsComponent,
    

   //DIRECTIVES
    AutofocusDirective,
    TooltipDirective,
    MarkedPipe,
    HtmlEntitiesEncodePipe,
    SafeHtmlPipe,

    //COMMON COMPONENTS
    AvatarProfileComponent,
    UserPresenceComponent,
    ImageViewerComponent,
    NetworkOfflineComponent

  ],
  imports: [
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    CommonModule,
    IonicModule,
    MomentModule,
    NgSelectModule,
    FormsModule,

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class SharedModule { }
