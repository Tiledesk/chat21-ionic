import { MessageModel } from "src/chat21-core/models/message";
import { LoggerService } from "src/chat21-core/providers/abstract/logger.service";
import { LoggerInstance } from "src/chat21-core/providers/logger/loggerInstance";
import { AppConfigProvider } from "../app-config";
import { ConversationModel } from "src/chat21-core/models/conversation";
import { ElementRef, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class TriggerEvents {

    private el: ElementRef;
    private windowContext;
    private logger: LoggerService = LoggerInstance.getInstance()
    
    constructor(
        private appConfig: AppConfigProvider
    ){}

    public setElement(el: ElementRef){
        this.el = el
    }

    public setWindowContext(windowContext){
        this.windowContext = windowContext
    }


    public triggerOnAuthStateChanged(detailObj: {}) {
        this.logger.debug(' ---------------- triggerOnAuthStateChanged ---------------- ', detailObj);
        try {
            const onAuthStateChanged = new CustomEvent('onAuthStateChanged', { detail: detailObj});
            const windowContext = this.windowContext;
            if (windowContext){
                // window.parent.dispatchEvent(onAuthStateChanged);
                windowContext.postMessage({type: "onAuthStateChanged", detail: detailObj}, '*')
                // this.el.nativeElement.dispatchEvent(onAuthStateChanged);
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }
    }

    public triggerAfterSendMessageEvent(messageSent: MessageModel){
        this.logger.debug(' ---------------- triggerAfterSendMessageEvent ---------------- ', messageSent);
        try {
            const onAfterMessageSend = new CustomEvent('onAfterMessageSend', { detail: { message: messageSent } });
            const windowContext = this.windowContext;
            if (windowContext){
                // windowContext.document.dispatchEvent(onAfterMessageSend);
                windowContext.postMessage({type: "onAfterMessageSend", detail: { message: messageSent }}, '*')
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }

    }

    
    public triggerAfterMessageReceived(message: MessageModel){
        this.logger.debug(' ---------------- triggerAfterMessageReceived ---------------- ', message);
        try {
            const onAfterMessageReceived = new CustomEvent('onAfterMessageReceived', { detail: { message: message } });
            const windowContext = this.windowContext;
            if (windowContext){
                // windowContext.document.dispatchEvent(onAfterMessageReceived);
                windowContext.postMessage({type: "onAfterMessageReceived", detail: { message: message }}, '*')
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }

    }

    public triggerOnNewConversationInit(conversation: ConversationModel){
        this.logger.debug(' ---------------- triggerOnNewConversation ---------------- ', conversation);
        try {
            const onNewConversation = new CustomEvent('onNewConversation', { detail: { conversation: conversation} });
            const windowContext = this.windowContext;
            if (windowContext){
                // windowContext.document.dispatchEvent(onNewConversation);
                windowContext.postMessage({type: "onNewConversation", detail: { conversation: conversation}}, '*')
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }

    }

    public triggerOnInit(detailObj: {}) {
        this.logger.debug(' ---------------- triggerOnInitEvent ---------------- ', detailObj);
        try {
            const onBeforeInit = new CustomEvent('onInit', { detail: detailObj });
            const windowContext = this.windowContext;
            if (windowContext){
                // windowContext.document.dispatchEvent(onNewConversation);
                windowContext.postMessage({type: "onInit", detail: detailObj }, '*')
            }
        } catch (e) {
            this.logger.error('[TRIGGER-HANDLER] > Error:' + e);
        }
    }

    
}
