import { PresenceService } from 'src/chat21-core/providers/abstract/presence.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { UserModel } from 'src/chat21-core/models/user';
import { ImageRepoService } from 'src/chat21-core/providers/abstract/image-repo.service';

// Logger
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'component-contacts-directory',
  templateUrl: './contacts-directory.component.html',
  styleUrls: ['./contacts-directory.component.scss'],
})
export class ContactsDirectoryComponent implements OnInit, OnChanges {

  @Input() contacts: Array<UserModel>;
  @Output() onOpenNewChat = new EventEmitter<UserModel>();

  private contactsOrig: Array<UserModel>;
  uidUserSelected: string;
  private logger: LoggerService = LoggerInstance.getInstance();
 
  constructor(
    public imageRepoService: ImageRepoService,
    public presenceService: PresenceService
  ) { }

  /**
   *
   */
  ngOnInit() {
    this.initialize();
  }

  ngOnChanges() {
    this.logger.log('ContactsDirectoryComponent contacts', this.contacts)
    if(this.contacts){
      this.contacts.forEach(contact => {
        contact.imageurl = this.imageRepoService.getImagePhotoUrl(contact.uid)
        this.presenceService.userIsOnline(contact.uid).pipe(filter((isOnline) => isOnline !== null)).subscribe((status)=> {contact.online = status.isOnline })
      });
    }
  }

  initialize() {
    this.contactsOrig = null;
  }
  /**
   *
   * @param ev
   */
  onSearchInput(ev: any) {
    if (!this.contactsOrig) {
      this.contactsOrig = this.contacts;
    }
    this.logger.log('onSearchInput::: ', ev);
    const searchTerm = ev.target.value;
    if (searchTerm && searchTerm.trim() !== '') {
      const searchKey = 'fullname';
      this.contacts = this.filterItems(this.contactsOrig, searchTerm, searchKey);
      this.contacts.sort(this.compareValues(searchKey, 'asc'));
    } else {
      this.contacts = this.contactsOrig;
    }
  }



  /**
   *
   */
  goToChat(user: UserModel) {
    this.uidUserSelected = user.uid
    this.onOpenNewChat.emit(user);
  }


  /**
   * filtro array contatti per parola passata
   * filtro sul campo fullname
   * @param items
   * @param searchTerm
   */
  private filterItems(items: any, searchTerm: string, key: string) {
    return items.filter((item: any) => {
      return item[key].toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) > -1;
    });
  }


  /** */
  private compareValues(key: string, order = 'asc') {
    return (a: any, b: any) => {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }
      const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }


}
