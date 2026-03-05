import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { createTranslateLoader } from 'src/chat21-core/utils/utils';

import { UnassignedConversationsPageRoutingModule } from './unassigned-conversations-routing.module';

import { UnassignedConversationsPage } from './unassigned-conversations.page';
import { ListConversationsModule } from 'src/app/chatlib/list-conversations-component/list-conversations.module';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UnassignedConversationsPageRoutingModule,
    MomentModule,
    ListConversationsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  declarations: [UnassignedConversationsPage]
})
export class UnassignedConversationsPageModule {}
