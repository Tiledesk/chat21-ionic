
import { Injectable } from '@angular/core';
// services
import { NotificationsService } from '../abstract/notifications.service';
import { LoggerInstance } from '../logger/loggerInstance';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
// firebase
import firebase from "firebase/app";
import 'firebase/messaging';
import 'firebase/auth';
// chat21
import { Chat21Service } from './chat-service';
import { Chat21HttpService } from '../native/chat21http.service';

@Injectable({
    providedIn: 'root'
  })
export class MQTTNotifications extends NotificationsService {
    
  public BUILD_VERSION: string;
  private FCMcurrentToken: string;
  private userId: string;
  private tenant: string;
  private vapidkey: string;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public chat21HttpService: Chat21HttpService
  ) {
    super();
  }

  initialize(tenant: string, vapId: string): void {
    this.tenant = tenant;
    this.vapidkey = vapId;
    return;
  }
    
  getNotificationPermissionAndSaveToken(currentUserUid) {
    console.log("[MQTTNotificationService] getNotificationPermissionAndSaveToken()",currentUserUid );
    this.userId = currentUserUid;
    if (firebase.messaging.isSupported()) {
      console.log("[MQTTNotificationService] firebase.messaging.isSupported -> YES");
      const messaging = firebase.messaging();
      // messaging.requestPermission()
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            this.logger.log('[MQTTNotificationService] >>>> requestPermission Notification permission granted.');

            return messaging.getToken({ vapidKey: this.vapidkey })
        }
      }).then(FCMtoken => {
        this.logger.log('[MQTTNotificationService] >>>> requestPermission FCMtoken', FCMtoken)
        // Save FCM Token in Chat21
        this.FCMcurrentToken = FCMtoken;
        this.saveToken(FCMtoken, currentUserUid)
      }).catch((err) => {
        this.logger.error('[MQTTNotificationService] >>>> requestPermission ERR: Unable to get permission to notify.', err);
      });
    } else {
      this.logger.log('[MQTTNotificationService] >>>> FIREBASE MESSAGING IS NOT SUPPORTED')
    }
  }


  removeNotificationsInstance(callback: (string) => void) {
    var self = this;
      // firebase.auth().onAuthStateChanged(function (user) {
      //     if (user) {
      //         self.logger.debug('[FIREBASE-NOTIFICATIONS] - FB User is signed in. ', user)
      //         self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > this.userId', self.userId);
      //         self.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > FCMcurrentToken', self.FCMcurrentToken);
      //         // this.logger.log('[FIREBASE-NOTIFICATIONS] >>>> removeNotificationsInstance > this.tenant', this.tenant);
      //     } else {
      //         self.logger.debug('[FIREBASE-NOTIFICATIONS] - No FB user is signed in. ', user)
      //     }
      // });
      const urlNodeFirebase = '/apps/' + self.tenant
      const connectionsRefinstancesId = urlNodeFirebase + '/users/' + self.userId + '/instances/'
      self.logger.log('[MQTTNotificationService] >>>> connectionsRefinstancesId ', connectionsRefinstancesId);
      let connectionsRefURL = '';
      if (connectionsRefinstancesId) {
        connectionsRefURL = connectionsRefinstancesId + self.FCMcurrentToken;
        const connectionsRef = firebase.database().ref().child(connectionsRefURL);
        self.logger.log('[MQTTNotificationService] >>>> connectionsRef ', connectionsRef);
        self.logger.log('[MQTTNotificationService] >>>> connectionsRef url ', connectionsRefURL);
        connectionsRef.off()
        connectionsRef.remove().then(() => {
          self.logger.log("[MQTTNotificationService] >>>> removeNotificationsInstance > Remove succeeded.")
          callback('success')
        }).catch((error) => {
          self.logger.error("[MQTTNotificationService] >>>> removeNotificationsInstance Remove failed: " + error.message)
          callback('error')
        }).finally(() => {
          self.logger.log('[MQTTNotificationService] COMPLETED');
        })
      }
  }
    
  private saveToken(FCMcurrentToken, currentUserUid) {
    this.logger.log('[MQTTNotificationService] >>>> getPermission > updateToken ', FCMcurrentToken);
    if (!currentUserUid || !FCMcurrentToken) {
      return
    };
    const device_model = {
      device_model: navigator.userAgent,
      language: navigator.language,
      platform: 'ionic',
      platform_version: this.BUILD_VERSION
    }
    this.chat21HttpService.chatClient.saveInstance(FCMcurrentToken,device_model,(err, response) => {
      if (err) {
        this.logger.error('[MQTTNotificationService] Error saving FCMcurrentToken on chat21 App Instance', FCMcurrentToken);
      }
    });
  }

}