
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../../../chat21-core/utils/utils';

import { ConversationListPageRoutingModule } from './conversations-list-routing.module';
import { ConversationListPage } from './conversations-list.page';
// import { ConversationDetailPage } from '../conversation-detail/conversation-detail.page';
// import {LoginModalModule} from '../../modals/authentication/login/login.module';

// import { DdpHeaderComponent } from '../../components/ddp-header/ddp-header.component';
import { ContactsDirectoryPageModule } from '../contacts-directory/contacts-directory.module';
import { ProfileInfoPageModule } from '../profile-info/profile-info.module';
// import { ConversationDetailPageModule } from '../conversation-detail/conversation-detail.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ScrollbarThemeModule } from '../../utils/scrollbar-theme.directive';
import { ListConversationsModule } from 'src/app/chatlib/list-conversations-component/list-conversations.module';
import { HeaderConversationsList } from 'src/app/components/conversations-list/header-conversations-list/header-conversations-list.component';
import { HeaderConversationsListArchived } from 'src/app/components/conversations-list/header-conversations-list-archived/header-conversations-list-archived.component';
import { HeaderConversationsListUnassigned } from 'src/app/components/conversations-list/header-conversations-list-unassigned/header-conversations-list-unassigned.component';
import { ProjectItemComponent } from 'src/app/components/project-item/project-item.component';
import { MomentModule } from 'ngx-moment';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConversationListPageRoutingModule,
    // ConversationDetailPageModule,
    // ContactsDirectoryPageModule,
    // ProfileInfoPageModule,
    ScrollbarThemeModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SharedModule,
    MomentModule,
    ListConversationsModule
  ],
  // entryComponents: [DdpHeaderComponent],
  declarations: [
    ConversationListPage,
    //******** COMPONENTS - init ********//
    HeaderConversationsList,
    HeaderConversationsListArchived,
    HeaderConversationsListUnassigned,
    ProjectItemComponent

  ]
})
export class ConversationListPageModule { }
