import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { Chat21Service } from 'src/chat21-core/providers/mqtt/chat-service';
import { MessageModel } from 'src/chat21-core/models/message';
import { Injectable } from '@angular/core';
import { Chat21Client } from 'src/assets/js/chat21client';
import { ConversationModel } from 'src/chat21-core/models/conversation';
import { LoggerService } from '../abstract/logger.service';
import { LoggerInstance } from '../logger/loggerInstance';
import { compareValues, isGroup, searchIndexInArrayForUid } from 'src/chat21-core/utils/utils';
import { avatarPlaceholder, getColorBck } from 'src/chat21-core/utils/utils-user';
import { hideInfoMessage, messageType } from 'src/chat21-core/utils/utils-message';
import { CHAT_CLOSED, CHAT_REOPENED, MEMBER_JOINED_GROUP, MESSAGE_TYPE_INFO } from 'src/chat21-core/utils/constants';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class Chat21HttpService {

  public chatClient: any;
  private loggedUserId: string;
  private translationMap: Map<string, string>;
  private logger: LoggerService = LoggerInstance.getInstance()
  public uidConvSelected: string;
  public conversations: ConversationModel[] = [];
  public archivedConversations: ConversationModel[] = [];
  public messages: MessageModel[] = [];
  public showInfoMessage: string[];

  constructor(
    private appStorageService: AppStorageService
  ) { }

   public initChat(config: any, showInfoMessage: string) {
    this.logger.info("INIT Chat21HttpService")
    if(!this.chatClient){
      if (!config || config.appId === 'CHANGEIT') {
        throw new Error('chat21Config is not defined. Please setup your environment');
      }
      this.chatClient = new Chat21Client(config);
      this.showInfoMessage = showInfoMessage.replace(' ', '').split(',')
      this.conversations = this.getConversationsLocalStorage();
    }
  }


  getLastConversations(userId: string): Promise<ConversationModel[]> {
    this.loggedUserId = userId;
    return  new Promise((resolve, reject)=> {
      this.chatClient.lastConversations( false, (err, conversations) => {
        this.logger.debug('[Chat21HttpService] Last conversations', conversations, 'err', err);
        if (!err) {
          this.conversations = conversations
          this.conversations.forEach((conversation, index, arrayConvs) => {
            conversation = this.completeConversation(conversation) 
            if(!this.isValidConversation(conversation)){
              this.conversations.splice(index, 1)
            }
          });
          this.conversations.sort(compareValues('timestamp', 'desc'));
          resolve(this.conversations)
        }
      });
    })
  }

  getLastArchivedConversations(userId: string): Promise<ConversationModel[]> {
    this.loggedUserId = userId;
    return  new Promise((resolve, reject)=> {
      this.chatClient.lastConversations(true, (err, conversations) => {
        this.logger.debug('[Chat21HttpService] Last archived conversations', conversations, 'err', err);
        if (!err) {
          this.archivedConversations = conversations
          this.archivedConversations.forEach((conversation, index, arrayConvs) => {
            conversation = this.completeConversation(conversation) 
            if(!this.isValidConversation(conversation)){
              this.archivedConversations.splice(index, 1)
            }
          });
          this.archivedConversations.sort(compareValues('timestamp', 'desc'));
          resolve(this.archivedConversations)
        }
      });
    })
  }

  getLastMessages(conversationWith: string, userId: string, translationMap: Map<string, string>): Promise<MessageModel[]> {
    this.loggedUserId = userId;
    this.translationMap = translationMap
    console.log('[Chat21HttpService] getLastMessages for user -> ', this.loggedUserId, conversationWith)
    return new Promise((resolve, reject)=> {
      this.chatClient.lastMessages(conversationWith, (err, messages) => {
        this.logger.log('[Chat21HttpService] getLastMessages ', messages, 'err', err);
        if (!err) {
          this.messages = messages as MessageModel[]
          this.messages.forEach((message, index)=> {
            this.manageMessage(message, index)
          })
          this.messages.sort(compareValues('timestamp', 'asc'));
          resolve(this.messages)
        }
      });
    })
  }

  private manageMessage(message, index){
    const msg:MessageModel = this.messageGenerate(message);
    msg.uid = message.message_id;
    if(this.isValidMessage(msg)){
      // msg.attributes && msg.attributes['subtype'] === 'info'
      let isInfoMessage = messageType(MESSAGE_TYPE_INFO, msg)
      if(isInfoMessage && hideInfoMessage(msg, this.showInfoMessage)){
        //if showInfoMessage array keys not includes msg.attributes.messagelabel['key'] exclude CURRENT INFO MESSAGE
        return;
      } else if(isInfoMessage && !hideInfoMessage(msg, this.showInfoMessage)){
        return;
      }
    } else {
      this.logger.error('[Chat21HttpService] manageMessage::message with uid: ', msg.uid, 'is not valid')
    }
  }

  // ********* ********* ********* ********* ********* //
  // ********* MANAGE CONVERSATIONS: start ********* //
  public completeConversation(conv): ConversationModel {
    // conv.selected = false;
    (conv.key && !conv.uid)? conv.uid = conv.key : conv.uid = conv.conversation_with;
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
    conv.is_new = this.setStatusConversation(conv.sender, conv.uid);
    conv.avatar = avatarPlaceholder(conversation_with_fullname);
    conv.color = getColorBck(conversation_with_fullname);
    if (!conv.last_message_text) {
        conv.last_message_text = conv.text; // building conv with a message
    }

    return conv;
  }

  /** set conversation status: is_new: true/false */
  private setStatusConversation(sender, uid): boolean {
    let is_new = true; // letto
    if (sender === this.loggedUserId || uid === this.uidConvSelected) {
      is_new = false;
    }
    return is_new;
  }

  /** get the number of unread conversations*/
  countIsNew(): number {
    let num = 0;
    this.conversations.forEach((element) => {
        if (element.is_new === true) {
            num++;
        }
    });
    return num;
  }


  public getConversationsLocalStorage(): ConversationModel[]{
    let conversationsStored: ConversationModel[] = []
    if(this.appStorageService.getItem('conversations')){
        conversationsStored = JSON.parse(this.appStorageService.getItem('conversations'))
        if(conversationsStored && conversationsStored.length > 0) {
            this.logger.log('[Chat21HttpService] retrive conversations from storage --> ', conversationsStored.length)
           return conversationsStored
        }
    }
  }

  public setConversationsLocalStorage() {
    this.logger.debug('[APP-COMP] updateConversationsOnStorage: reset timer and save conversations -> ', this.conversations.length)
    this.appStorageService.setItem('conversations', JSON.stringify(this.conversations))
  }

  public isValidConversation(convToCheck: ConversationModel) : boolean {
    // this.logger.debug('[Chat21HttpService] checking uid of', convToCheck)
    
    if (!this.isValidField(convToCheck.uid)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "uid is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.is_new)) {
        this.logger.error("ChatConversationsHandler::isValidConversation:: 'is_new is not valid' ");
        return false;
    }
    if (!this.isValidField(convToCheck.last_message_text)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "last_message_text is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.recipient)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "recipient is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.recipient_fullname)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "recipient_fullname is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.sender)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "sender is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.sender_fullname)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "sender_fullname is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.status)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "status is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.timestamp)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "timestamp is not valid" ');
        return false;
    }
    if (!this.isValidField(convToCheck.channel_type)) {
        this.logger.error('[Chat21HttpService] ChatConversationsHandler::isValidConversation:: "channel_type is not valid" ');
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
  // ********* MANAGE CONVERSATIONS: end ********* //
  // ********* ********* ********* ********* ********* //


  // ********* ********* ********* *********  //
  // ********* MANAGE MESSAGES: start ********* //
  public messageGenerate(message) {
    const msg: MessageModel = message;
    this.logger.log("[Chat21HttpService] message >", message);
    // msg.uid = message.key;
    msg.text = msg.text.trim() //remove black msg with only spaces
    // controllo fatto per i gruppi da rifattorizzare
    if (!msg.sender_fullname || msg.sender_fullname === 'undefined') {
        msg.sender_fullname = msg.sender;
    }
    // bonifico messaggio da url
    // if (msg.type === 'text') {
    //     msg.text = htmlEntities(msg.text);
    // }
    // verifico che il sender è il logged user
    msg.isSender = this.isSender(msg.sender, this.loggedUserId);

    // traduco messaggi se sono del server
    if (messageType(MESSAGE_TYPE_INFO, msg)) {
        this.translateInfoSupportMessages(msg);
    }
    return msg;
  }

  /**
   * controllo se il messaggio è stato inviato da loggerUser
   * richiamato dalla pagina elenco messaggi della conversazione
   */
  private isSender(sender: string, currentUserId: string) {
    if (currentUserId) {
        if (sender === currentUserId) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
  }

  /** */
  private translateInfoSupportMessages(message: MessageModel) {
    // check if the message attributes has parameters and it is of the "MEMBER_JOINED_GROUP" type
    const INFO_SUPPORT_USER_ADDED_SUBJECT = this.translationMap.get('INFO_SUPPORT_USER_ADDED_SUBJECT');
    const INFO_SUPPORT_USER_ADDED_YOU_VERB = this.translationMap.get('INFO_SUPPORT_USER_ADDED_YOU_VERB');
    const INFO_SUPPORT_USER_ADDED_COMPLEMENT = this.translationMap.get('INFO_SUPPORT_USER_ADDED_COMPLEMENT');
    const INFO_SUPPORT_USER_ADDED_VERB = this.translationMap.get('INFO_SUPPORT_USER_ADDED_VERB');
    const INFO_SUPPORT_CHAT_REOPENED = this.translationMap.get('INFO_SUPPORT_CHAT_REOPENED');
    const INFO_SUPPORT_CHAT_CLOSED = this.translationMap.get('INFO_SUPPORT_CHAT_CLOSED');
    if (message.attributes.messagelabel
        && message.attributes.messagelabel.parameters
        && message.attributes.messagelabel.key === MEMBER_JOINED_GROUP
    ) {
        let subject: string;
        let verb: string;
        let complement: string;
        if (message.attributes.messagelabel.parameters.member_id === this.loggedUserId) {
            subject = INFO_SUPPORT_USER_ADDED_SUBJECT;
            verb = INFO_SUPPORT_USER_ADDED_YOU_VERB;
            complement = INFO_SUPPORT_USER_ADDED_COMPLEMENT;
        } else {
            if (message.attributes.messagelabel.parameters.fullname) {
                // other user has been added to the group (and he has a fullname)
                subject = message.attributes.messagelabel.parameters.fullname;
                verb = INFO_SUPPORT_USER_ADDED_VERB;
                complement = INFO_SUPPORT_USER_ADDED_COMPLEMENT;
            } else {
                // other user has been added to the group (and he has not a fullname, so use hes useruid)
                subject = message.attributes.messagelabel.parameters.member_id;
                verb = INFO_SUPPORT_USER_ADDED_VERB;
                complement = INFO_SUPPORT_USER_ADDED_COMPLEMENT;
            }
        }
        message.text = subject + ' ' + verb + ' ' + complement;
    } else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === CHAT_REOPENED)) {
        message.text = INFO_SUPPORT_CHAT_REOPENED;
    } else if ((message.attributes.messagelabel && message.attributes.messagelabel.key === CHAT_CLOSED)) {
        message.text = INFO_SUPPORT_CHAT_CLOSED;
    }
  }

  private isValidMessage(msgToCkeck:MessageModel): boolean{
    // console.log('message to check-->', msgToCkeck)
    // if(!this.isValidField(msgToCkeck.uid)){
    //     return false;
    // }
    // if(!this.isValidField(msgToCkeck.sender)){
    //     return false;
    // }
    // if(!this.isValidField(msgToCkeck.recipient)){
    //     return false;
    // }
    // if(!this.isValidField(msgToCkeck.type)){
    //     return false;
    // }else if (msgToCkeck.type === "text" && !this.isValidField(msgToCkeck.text)){
    //     return false;
    // } else if ((msgToCkeck.type === "image" || msgToCkeck.type === "file") && !this.isValidField(msgToCkeck.metadata) && !this.isValidField(msgToCkeck.metadata.src)){
    //     return false
    // }


    return true
  }

  /**
   *
   * @param field
   */
  private isValidMessageField(field: any): boolean {
      return (field === null || field === undefined) ? false : true;
  }
  // ********* MANAGE MESSAGES: end ********* //
  // ********* ********* ********* *********  //


  disposeConversations(){
    this.conversations = [];
   
  }

  disposeArchivedConversations(){
    this.archivedConversations = [];
  }
  
  

}
