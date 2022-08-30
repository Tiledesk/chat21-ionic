import { Injectable } from '@angular/core';
// services
import { ConversationHandlerBuilderService } from '../abstract/conversation-handler-builder.service';
import { MQTTConversationHandler } from './mqtt-conversation-handler';
import { Chat21Service } from './chat-service';
import { Chat21HttpService } from '../native/chat21http.service';

@Injectable({
  providedIn: 'root'
})
export class MQTTConversationHandlerBuilderService extends ConversationHandlerBuilderService {

  constructor(
    public chat21HttpService: Chat21HttpService
  ) {
    super();
  }

  public build(): any {
    const conversationHandlerService = new MQTTConversationHandler(this.chat21HttpService, false);
    return conversationHandlerService;
  }
}
