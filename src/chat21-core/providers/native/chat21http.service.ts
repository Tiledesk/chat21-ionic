import { Chat21Service } from 'src/chat21-core/providers/mqtt/chat-service';
import { MessageModel } from 'src/chat21-core/models/message';
import { Injectable } from '@angular/core';
import { Chat21Client } from 'src/assets/js/chat21client';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';
import { isGroup } from 'src/chat21-core/utils/utils';
import { avatarPlaceholder, getColorBck } from 'src/chat21-core/utils/utils-user';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class Chat21HttpService {

  public chatClient: any;
  private loggedUserId: string;

  private logger: LoggerService = LoggerInstance.getInstance()
  
  constructor(
    private chat21Service: Chat21Service) { }

  initChat(config) {
    console.log("INIT new Chat21HttpService")
    // if(!this.chatClient){
    //   if (!config || config.appId === 'CHANGEIT') {
    //     throw new Error('chat21Config is not defined. Please setup your environment');
    //   }
    //   this.chatClient = new Chat21Client(config);
    // }
  }


  getLastConversations(userId: string): Promise<ConversationModel[]> {
    this.loggedUserId = userId;
    return  new Promise((resolve, reject)=> {
      this.chat21Service.chatClient.lastConversations( false, (err, conversations) => {
        this.logger.debug('[Chat21HttpService] Last conversations', conversations, 'err', err);
        let convs = conversations as ConversationModel[]
        if (!err) {
          convs.forEach((conversation, index) => {
            conversation = this.completeConversation(conversation) 
            if(!this.isValidConversation(conversation)){
              convs.splice(index, 1)
            }
          });
          resolve(conversations)
        }
      });
    })
  }


  // getLastMessages(conversationWith): MessageModel[]{
  //   this.chatClient.lastMessages(conversationWith, (err, messages) => {
  //     if (!err) {
  //         return messages;
  //     }
  //   });
  // }


  private completeConversation(conv): ConversationModel {
    // conv.selected = false;
    conv.uid = conv.key;
    if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
        conv.sender_fullname = conv.sender;
    }
    if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
        conv.recipient_fullname = conv.recipient;
    }
    let conversation_with_fullname = conv.sender_fullname;
    let conversation_with = conv.sender;
    if (conv.sender === this.loggedUserId) {
        conversation_with = conv.recipient;
        conversation_with_fullname = conv.recipient_fullname;
    } else if (isGroup(conv)) {
        conversation_with = conv.recipient;
        conversation_with_fullname = conv.recipient_fullname;
    }
    conv.conversation_with_fullname = conversation_with_fullname;
    conv.conversation_with = conversation_with;
    conv.is_new = this.setStatusConversation(conv.sender);
    conv.avatar = avatarPlaceholder(conversation_with_fullname);
    conv.color = getColorBck(conversation_with_fullname);
    if (!conv.last_message_text) {
        conv.last_message_text = conv.text; // building conv with a message
    }

    return conv;
  }

  /** set conversation status: is_new: true/false */
  private setStatusConversation(sender): boolean {
    let is_new = true; // letto
    if (sender === this.loggedUserId) {
      is_new = false;
    } else {
      is_new = false; // non letto
    }
    return is_new;
  }






  
  private isValidConversation(convToCheck: ConversationModel) : boolean {
    //console.log("[BEGIN] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
    this.logger.debug('[MQTTConversationsHandler] checking uid of', convToCheck)
    this.logger.debug('[MQTTConversationsHandler] conversation.uid', convToCheck.uid)
    this.logger.debug('[MQTTConversationsHandler] channel_type is:', convToCheck.channel_type)
    
    if (!this.isValidField(convToCheck.uid)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "uid is not valid" ');
        return false;
    }
    // if (!this.isValidField(convToCheck.is_new)) {
    //     this.logger.error("ChatConversationsHandler::isValidConversation:: 'is_new is not valid' ");
    //     return false;
    // }
    if (!this.isValidField(convToCheck.last_message_text)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "last_message_text is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.recipient)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "recipient is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.recipient_fullname)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "recipient_fullname is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.sender)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "sender is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.sender_fullname)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "sender_fullname is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.status)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "status is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.timestamp)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "timestamp is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.channel_type)) {
        this.logger.error('[MQTTConversationsHandler] ChatConversationsHandler::isValidConversation:: "channel_type is not valid" ');
        return false;
    }
    //console.log("[END] ChatConversationsHandler:: convToCheck with uid: ", convToCheckId);
    // any other case
    return true;
  }

  // checks if a conversation's field is valid or not
  private isValidField(field) : boolean{
      return (field === null || field === undefined) ? false : true;
  }

}
