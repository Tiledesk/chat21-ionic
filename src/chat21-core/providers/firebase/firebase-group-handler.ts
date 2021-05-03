import { GroupsHandlerService } from './../abstract/groups-handler.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';

// models
import { ConversationModel } from '../../models/conversation';

// services
//import { DatabaseProvider } from '../database';

// utils
import { CustomLogger } from '../logger/customLogger';
import { AppConfigProvider } from '../../../app/services/app-config';
import { HttpClient } from '@angular/common/http';
import { GroupModel } from 'src/chat21-core/models/group';


// @Injectable({ providedIn: 'root' })
@Injectable()
export class FirebaseGroupsHandler extends GroupsHandlerService {

    // BehaviorSubject
    BSgroupDetail: BehaviorSubject<GroupModel>;
    SgroupDetail: Subject<GroupModel>;
    groupAdded: BehaviorSubject<GroupModel>;
    groupChanged: BehaviorSubject<GroupModel>;
    groupRemoved: BehaviorSubject<GroupModel>;

    // public params
    conversations: Array<ConversationModel> = [];
    uidConvSelected: string;

    // private params
    private tenant: string;
    private loggedUserId: string;
    private ref: firebase.database.Query;


    private logger: CustomLogger = new CustomLogger(true);

    // private audio: any;
    // private setTimeoutSound: any;

    constructor(
        public http: HttpClient,
        public appConfig: AppConfigProvider
    ) {
        super();
    }

    /**
     * inizializzo groups handler
     */
    initialize(tenant: string, loggedUserId: string) {
        this.logger.printLog('initialize GROUP-HANDLER');
        this.tenant = tenant;
        this.loggedUserId = loggedUserId;
    }

    /**
     * mi connetto al nodo groups
     * creo la reference
     * mi sottoscrivo a change, removed, added
     */
    connect() {
        const urlNodeGroups = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/groups';
        this.logger.printDebug('connect -------> groups::', urlNodeGroups)
        this.ref = firebase.database().ref(urlNodeGroups)
        this.ref.on('child_added', (childSnapshot) => {
            this.logger.printDebug('groups child_added ------->', childSnapshot.val())
            // that.added(childSnapshot);
        });
        this.ref.on('child_changed', (childSnapshot) => {
            this.logger.printDebug('groups child_changed ------->', childSnapshot.val())
            // that.changed(childSnapshot);
        });
        this.ref.on('child_removed', (childSnapshot) => {
            this.logger.printDebug('groups child_removed ------->', childSnapshot.val())
            // that.removed(childSnapshot);
        });
    }

    /**
     * mi connetto al nodo groups/GROUPID
     * creo la reference
     * mi sottoscrivo a value
     */
    getDetail(groupId: string, callback?: (group: GroupModel)=>void): Promise<GroupModel>{
        const urlNodeGroupById = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/groups/' + groupId;
        this.logger.printDebug('getDetail -------> urlNodeGroupById::', urlNodeGroupById)
        const ref = firebase.database().ref(urlNodeGroupById)
        return new Promise((resolve) => {
            ref.off()
            ref.on('value', (childSnapshot) => {
                console.log('group info::', childSnapshot.val())
                const group: GroupModel = childSnapshot.val();
                group.uid = childSnapshot.key
                // that.BSgroupDetail.next(group)
                if (callback) {
                    callback(group)
                }
                resolve(group)

            });
        });

    }

    onGroupChange(groupId: string): Observable<GroupModel> {
        const that = this;
        const urlNodeGroupById = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/groups/' + groupId;
        this.logger.printDebug('onGroupChange -------> urlNodeGroupById::', urlNodeGroupById)
        const ref = firebase.database().ref(urlNodeGroupById)
        ref.off()
        ref.on('value', (childSnapshot) => {
            console.log('group detail::', childSnapshot.val(), childSnapshot)
            const group: GroupModel = childSnapshot.val();
            console.log('FIREBASE-GROUP-HANDLER group ', group)
            if (group) {
                group.uid = childSnapshot.key
                // that.BSgroupDetail.next(group)
                that.SgroupDetail.next(group)
            } 
        });
        // return that.BSgroupDetail
        return this.SgroupDetail

    }

    leave(groupId: string, callback?: () => void): Promise<any> {
        return new Promise((resolve) => {
            // ref.on('value', (childSnapshot) => {
            //     console.log('group info::', childSnapshot.val())
            //     const group: GroupModel = childSnapshot.val();
            //     // that.BSgroupDetail.next(group)
            //     if(callback){
            //         callback(group)
            //     }
            //     resolve(group)

            // });
        });
    }

    create(groupId: string, callback?: () => void): Promise<any> {
        return new Promise((resolve) => {
            // ref.on('value', (childSnapshot) => {
            //     console.log('group info::', childSnapshot.val())
            //     const group: GroupModel = childSnapshot.val();
            //     // that.BSgroupDetail.next(group)
            //     if(callback){
            //         callback(group)
            //     }
            //     resolve(group)

            // });
        });
    }

    dispose() {
        this.conversations = [];
        this.uidConvSelected = '';
        this.ref.off();
        // this.ref.off("child_changed");
        // this.ref.off("child_removed");
        // this.ref.off("child_added");
        this.logger.printDebug('DISPOSE::: ', this.ref)
    }

    // // -------->>>> ARCHIVE CONVERSATION SECTION START <<<<---------------//
    // archiveConversation(conversationId: string) {
    //     const that = this
    //     this.setClosingConversation(conversationId, true);
    //     const index = searchIndexInArrayForUid(this.conversations, conversationId);
    //     // if (index > -1) {
    //     //     this.conversations.splice(index, 1);
    //     // fare chiamata delete per rimuoverle la conversazione da remoto
    //     this.deleteConversation(conversationId, function (response) {
    //         console.log('FIREBASE-CONVERSATION-HANDLER ARCHIVE-CONV response', response)

    //         if (response === 'success') {
    //             if (index > -1) {
    //                 that.conversations.splice(index, 1);
    //             }
    //         } else if (response === 'error') {
    //             that.setClosingConversation(conversationId, false);
    //         }

    //     })
    //     // }
    // }

    // deleteConversation(conversationId, callback) {
    //     console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV conversationId', conversationId)
    //     let queryString = ''
    //     let isSupportConversation = conversationId.startsWith("support-group");
    //     if (isSupportConversation) {
    //         queryString = '?forall=true'
    //     }

    //     this.getFirebaseToken((error, idToken) => {
    //         console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV idToken', idToken)
    //         console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV error', error)
    //         if (idToken) {
    //             const httpOptions = {
    //                 headers: new HttpHeaders({
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'application/json',
    //                     'Authorization': 'Bearer ' + idToken,
    //                 })
    //             }
    //             const url = this.BASE_URL + '/api/' + this.tenant + '/conversations/' + conversationId + queryString;
    //             console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV - URL:', url);

    //             this.http.delete(url, httpOptions).subscribe(res => {
    //                     console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV - RES', res);
    //                     callback('success')
    //             }, (error) => {
    //                     console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV ERROR ', error);
    //                     callback('error')
    //             }, () => {
    //                     console.log('FIREBASE-CONVERSATION-HANDLER DELETE CONV * COMPLETE *');

    //             });
    //         } else {
    //             callback('error')
    //         }
    //     });
    // }


    // getFirebaseToken(callback) {
    //     const firebase_currentUser = firebase.auth().currentUser;
    //     console.log(' // firebase current user ', firebase_currentUser);
    //     if (firebase_currentUser) {
    //         firebase_currentUser.getIdToken(/* forceRefresh */ true)
    //             .then(function (idToken) {
    //                 // qui richiama la callback
    //                 callback(null, idToken);

    //             }).catch(function (error) {
    //                 // Handle error
    //                 console.log('idToken.', error);
    //                 callback(error, null);
    //             });
    //     }
    // }
    // // -------->>>> ARCHIVE CONVERSATION SECTION END <<<<---------------//


    // public getConversationDetail(conversationId: string, callback: (conv: ConversationModel)=>void): void {
    //     // fare promise o callback ??
    //     const conversation = this.conversations.find(item => item.uid === conversationId);
    //     this.logger.printDebug('SubscribeToConversations >>>>>>>>>>>>>> conversations *****: ', this.conversations)
    //     this.logger.printDebug('SubscribeToConversations >>>>>>>>>>>>>> getConversationDetail *****: ', conversation)
    //     if (conversation) {
    //         callback(conversation)
    //         // return conversationSelected
    //         // this.BSConversationDetail.next(conversationSelected);
    //     } else {
    //         // const urlNodeFirebase = '/apps/' + this.tenant + '/users/' + this.loggedUserId + '/conversations/' + conversationId;
    //         const urlNodeFirebase = conversationsPathForUserId(this.tenant, this.loggedUserId) + '/' + conversationId;
    //         this.logger.printDebug('urlNodeFirebase conversationDetail *****', urlNodeFirebase)
    //         const firebaseMessages = firebase.database().ref(urlNodeFirebase);
    //         firebaseMessages.on('value', (childSnapshot) => {
    //             const childData: ConversationModel = childSnapshot.val();
    //             childData.uid = childSnapshot.key;
    //             const conversation = this.completeConversation(childData);
    //             if(conversation){
    //                 callback(conversation)
    //             }else {
    //                 callback(null)
    //             }
    //             // this.BSConversationDetail.next(conversation);
    //         });
    //     }

    // }
    // /**
    //  * dispose reference di conversations
    //  */
    // dispose() {
    //     this.conversations = [];
    //     this.uidConvSelected = '';
    //     //this.ref.off();
    //     // this.ref.off("child_changed");
    //     // this.ref.off("child_removed");
    //     // this.ref.off("child_added");
    //     this.logger.printDebug('DISPOSE::: ', this.ref)
    // }


    // // ---------------------------------------------------------- //
    // // BEGIN PRIVATE FUNCTIONS
    // // ---------------------------------------------------------- //
    // /**
    //  *
    //  */
    // // private getConversationsFromStorage() {
    // //     const that = this;
    // //     this.databaseProvider.getConversations()
    // //     .then((conversations: [ConversationModel]) => {
    // //         that.loadedConversationsStorage.next(conversations);
    // //     })
    // //     .catch((e) => {
    // //         console.log('error: ', e);
    // //     });
    // // }


    // // /** 
    // //  *
    // //  * @param childSnapshot
    // //  */
    // private conversationGenerate(childSnapshot: any): boolean {
    //     const childData: ConversationModel = childSnapshot.val();
    //     childData.uid = childSnapshot.key;
    //     const conversation = this.completeConversation(childData);
    //     if (this.isValidConversation(conversation)) {
    //         this.setClosingConversation(childSnapshot.key, false);
    //         const index = searchIndexInArrayForUid(this.conversations, conversation.uid);
    //         if (index > -1) {
    //             this.conversations.splice(index, 1, conversation);
    //         } else {
    //             this.conversations.splice(0, 0, conversation);
    //         }
    //         //this.databaseProvider.setConversation(conversation);
    //         this.conversations.sort(compareValues('timestamp', 'desc'));
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    // /**
    // *
    // * @param childSnapshot
    // */
    // // private conversationGenerate(childSnapshot: any): ConversationModel {
    // //     console.log('conversationGenerate: ', childSnapshot.val());
    // //     const childData: ConversationModel = childSnapshot.val();
    // //     childData.uid = childSnapshot.key;
    // //     const conversation = this.completeConversation(childData);
    // //     if (this.isValidConversation(conversation)) {
    // //         this.setClosingConversation(childSnapshot.key, false);
    // //         const index = searchIndexInArrayForUid(this.conversations, conversation.uid);
    // //         if (index > -1) {
    // //             this.conversations.splice(index, 1, conversation);
    // //         } else {
    // //             this.conversations.splice(0, 0, conversation);
    // //         }
    // //         //this.databaseProvider.setConversation(conversation);
    // //         this.conversations.sort(compareValues('timestamp', 'desc'));
    // //         if (conversation.is_new) {
    // //             this.soundMessage();
    // //         }
    // //         return conversation;
    // //     } else {
    // //         return null;
    // //     }
    // // }

    // // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    // /**
    //  * 1 -  completo la conversazione con i parametri mancanti
    //  * 2 -  verifico che sia una conversazione valida
    //  * 3 -  salvo stato conversazione (false) nell'array delle conversazioni chiuse
    //  * 4 -  aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
    //  *      o sostituisco la conversazione con quella preesistente
    //  * 5 -  salvo la conversazione nello storage
    //  * 6 -  ordino l'array per timestamp
    //  * 7 -  pubblico conversations:update
    //  */
    // //TODO-GAB: ora emit singola conversation e non dell'intero array di conversations
    // private added(childSnapshot: any) {
    //     if (this.conversationGenerate(childSnapshot)) {
    //         const index = searchIndexInArrayForUid(this.conversations, childSnapshot.key);
    //         if (index > -1) {
    //             const conversationAdded = this.conversations[index]
    //             this.conversationAdded.next(conversationAdded);
    //         }
    //     } else {
    //         this.logger.printError('ChatConversationsHandler::ADDED::conversations with conversationId: ', childSnapshot.key, 'is not valid')
    //     }
    // }

    // /**
    //  * 1 -  completo la conversazione con i parametri mancanti
    //  * 2 -  verifico che sia una conversazione valida
    //  * 3 -  aggiungo alla pos 0 la nuova conversazione all'array di conversazioni 
    //  * 4 -  salvo la conversazione nello storage
    //  * 5 -  ordino l'array per timestamp
    //  * 6 -  pubblico conversations:update
    //  * 7 -  attivo sound se è un msg nuovo
    //  */

    // //TODO-GAB: ora emit singola conversation e non dell'intero array di conversations
    // private changed(childSnapshot: any) {
    //     if (this.conversationGenerate(childSnapshot)) {
    //         const index = searchIndexInArrayForUid(this.conversations, childSnapshot.key);
    //         if (index > -1) {
    //             const conversationChanged = this.conversations[index]
    //             this.conversationChanged.next(conversationChanged);
    //         }
    //     } else {
    //         this.logger.printError('ChatConversationsHandler::CHANGED::conversations with conversationId: ', childSnapshot.key, 'is not valid')
    //     }
    // }

    // /**
    //  * 1 -  cerco indice conversazione da eliminare
    //  * 2 -  elimino conversazione da array conversations
    //  * 3 -  elimino la conversazione dallo storage
    //  * 4 -  pubblico conversations:update
    //  * 5 -  elimino conversazione dall'array delle conversazioni chiuse
    //  */
    // //TODO-GAB: ora emit singola conversation e non dell'intero array di conversations
    // private removed(childSnapshot: any) {
    //     const index = searchIndexInArrayForUid(this.conversations, childSnapshot.key);
    //     if (index > -1) {
    //         const conversationRemoved = this.conversations[index]
    //         this.conversations.splice(index, 1);
    //         // this.conversations.sort(compareValues('timestamp', 'desc'));
    //         //this.databaseProvider.removeConversation(childSnapshot.key);
    //         this.conversationRemoved.next(conversationRemoved);
    //     }
    //     // remove the conversation from the isConversationClosingMap
    //     this.deleteClosingConversation(childSnapshot.key);
    // }


    // /**
    //  * Completo conversazione aggiungendo:
    //  * 1 -  nel caso in cui sender_fullname e recipient_fullname sono vuoti, imposto i rispettivi id come fullname,
    //  *      in modo da avere sempre il campo fullname popolato
    //  * 2 -  imposto conversation_with e conversation_with_fullname con i valori del sender o al recipient,
    //  *      a seconda che il sender corrisponda o meno all'utente loggato. Aggiungo 'tu:' se il sender coincide con il loggedUser
    //  *      Se il sender NON è l'utente loggato, ma è una conversazione di tipo GROUP, il conversation_with_fullname
    //  *      sarà uguale al recipient_fullname
    //  * 3 -  imposto stato conversazione, che indica se ci sono messaggi non letti nella conversazione
    //  * 4 -  imposto il tempo trascorso tra l'ora attuale e l'invio dell'ultimo messaggio
    //  * 5 -  imposto avatar, colore e immagine
    //  * @param conv
    //  */
    // private completeConversation(conv): ConversationModel {
    //     this.logger.printDebug('completeConversation', conv)
    //     conv.selected = false;
    //     if (!conv.sender_fullname || conv.sender_fullname === 'undefined' || conv.sender_fullname.trim() === '') {
    //         conv.sender_fullname = conv.sender;
    //     }
    //     if (!conv.recipient_fullname || conv.recipient_fullname === 'undefined' || conv.recipient_fullname.trim() === '') {
    //         conv.recipient_fullname = conv.recipient;
    //     }
    //     let conversation_with_fullname = conv.sender_fullname;
    //     let conversation_with = conv.sender;
    //     if (conv.sender === this.loggedUserId) {
    //         conversation_with = conv.recipient;
    //         conversation_with_fullname = conv.recipient_fullname;
    //         conv.sender_fullname = this.translationMap.get('YOU')
    //         // conv.last_message_text = LABEL_TU + conv.last_message_text;
    //     } else if (conv.channel_type === TYPE_GROUP) {
    //         conversation_with = conv.recipient;
    //         conversation_with_fullname = conv.sender_fullname;
    //         // conv.last_message_text = conv.last_message_text;
    //     }
    //     conv.conversation_with_fullname = conversation_with_fullname;
    //     conv.status = this.setStatusConversation(conv.sender, conv.uid);
    //     conv.time_last_message = this.getTimeLastMessage(conv.timestamp);
    //     conv.avatar = avatarPlaceholder(conversation_with_fullname);
    //     conv.color = getColorBck(conversation_with_fullname);
    //     //conv.image = this.imageRepo.getImagePhotoUrl(conversation_with);
    //     // getImageUrlThumbFromFirebasestorage(conversation_with, this.FIREBASESTORAGE_BASE_URL_IMAGE, this.urlStorageBucket);
    //     return conv;
    // }

    // /** */
    // private setStatusConversation(sender: string, uid: string): string {
    //     let status = '0'; // letto
    //     if (sender === this.loggedUserId || uid === this.uidConvSelected) {
    //         status = '0';
    //     } else {
    //         status = '1'; // non letto
    //     }
    //     return status;
    // }

    // /**
    //  * calcolo il tempo trascorso da ora al timestamp passato
    //  * @param timestamp
    //  */
    // private getTimeLastMessage(timestamp: string) {
    //     const timestampNumber = parseInt(timestamp, 10) / 1000;
    //     const time = getFromNow(timestampNumber);
    //     return time;
    // }

    // /**
    //  * attivo sound se è un msg nuovo
    //  */
    // // private soundMessage() {
    // //     console.log('****** soundMessage *****', this.audio);
    // //     const that = this;
    // //     this.audio.pause();
    // //     this.audio.currentTime = 0;
    // //     clearTimeout(this.setTimeoutSound);
    // //     this.setTimeoutSound = setTimeout(() => {
    // //         that.audio.play()
    // //         .then(() => {
    // //             console.log('****** soundMessage played *****');
    // //         })
    // //         .catch((error: any) => {
    // //             console.log('***soundMessage error*', error);
    // //         });
    // //     }, 1000);
    // // }

    // /**
    //  *  check if the conversations is valid or not
    //  */
    // private isValidConversation(convToCheck: ConversationModel): boolean {

    //     if (!this.isValidField(convToCheck.uid)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.is_new)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.last_message_text)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.recipient)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.recipient_fullname)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.sender)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.sender_fullname)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.status)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.timestamp)) {
    //         return false;
    //     }
    //     if (!this.isValidField(convToCheck.channel_type)) {
    //         return false;
    //     }
    //     return true;
    // }

    // /**
    //  *
    //  * @param field
    //  */
    // private isValidField(field: any): boolean {
    //     return (field === null || field === undefined) ? false : true;
    // }

    // // ---------------------------------------------------------- //
    // // END PRIVATE FUNCTIONS
    // // ---------------------------------------------------------- //
}