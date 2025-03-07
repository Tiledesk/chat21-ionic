import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { NavProxyService } from '../../services/nav-proxy.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
// import { ContactsDirectoryService, CONTACTS_URL } from '../../services/contacts-directory.service';
import { UserModel } from 'src/chat21-core/models/user';
import { EventsService } from '../../services/events-service';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { AppConfigProvider } from 'src/app/services/app-config';

@Component({
  selector: 'app-contacts-directory',
  templateUrl: './contacts-directory.page.html',
  styleUrls: ['./contacts-directory.page.scss'],
})
export class ContactsDirectoryPage implements OnInit {
  
  @Input() isMobile: boolean;
  @Input() stylesMap: Map<string, string>;
  // @Input() user: string;

  public contacts: Array<UserModel>;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    private modalController: ModalController,
    private navService: NavProxyService,
    // private contactsDirectoryService: ContactsDirectoryService,
    private contactsService: ContactsService,
    private appConfigProvider: AppConfigProvider,
    public events: EventsService
  ) {
    const serverBaseUrl = this.appConfigProvider.getConfig().apiUrl
    this.contactsService.initialize(serverBaseUrl)
  }

  ngOnInit() {
    this.initialize();
  }

  /** */
  initialize() {
    this.logger.log('[CONTACT-DIRECTORY-PAGE] - initialize');
    this.contacts = [];
    this.initSubscriptions();
    this.contactsService.loadContactsFromUrl();
  }

  /**
   * initSubscriptions
   */
  initSubscriptions() {
    this.logger.log('[CONTACT-DIRECTORY-PAGE] initSubscriptions to BScontacts');
    const that = this;
    this.contactsService.BScontacts.subscribe((contacts: any) => {
      this.logger.log('[CONTACT-DIRECTORY-PAGE] ***** BScontacts *****', contacts);
      if (contacts) {
        that.contacts = contacts;
      }
    });
  }

  /**
   * setContacts
   * @param data
   */
  setContacts(data: any) {
    this.contacts = [];
    const listOfContacts = JSON.parse(JSON.stringify(data));
    listOfContacts.forEach((user: UserModel) => {
      let fullname = '';
      if (user.firstname && user.firstname !== undefined) {
        fullname += user.firstname;
      }
      if (user.lastname && user.lastname !== undefined) {
        fullname += ' ' + user.lastname;
      }
      user.fullname = fullname;
      this.contacts.push(user);
    });
  }

  /** */
  async onClose() {
    this.logger.log('[CONTACT-DIRECTORY-PAGE] - onClose MODAL')
    this.logger.log('[CONTACT-DIRECTORY-PAGE] - onClose MODAL isModalOpened ', await this.modalController.getTop())
    const isModalOpened = await this.modalController.getTop();

    if (isModalOpened) {
      this.modalController.dismiss({

        confirmed: true
      });
    } else {
      this.navService.pop();
    }
  }

  /**
   *
   * @param user
   */
  openNewChat(user: UserModel) {
    // this.onClose();
    this.logger.log('[CONTACT-DIRECTORY-PAGE] - openNewChat')
    this.events.publish('uidConvSelected:changed', user, 'new');
    this.onClose();
  }

}
