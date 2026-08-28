import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MomentModule } from 'ngx-moment';

import { ListConversationsComponent } from './list-conversations/list-conversations.component';
import { IonListConversationsComponent } from './ion-list-conversations/ion-list-conversations.component';

@NgModule({
  imports: [CommonModule, IonicModule, MomentModule],
  declarations: [ListConversationsComponent, IonListConversationsComponent],
  exports: [ListConversationsComponent, IonListConversationsComponent],
})
export class ListConversationsModule {}
