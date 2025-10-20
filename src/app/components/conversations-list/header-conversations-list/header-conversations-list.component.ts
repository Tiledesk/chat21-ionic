import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { EventsService } from 'src/app/services/events-service'
import { CreateTicketPage } from 'src/app/modals/create-ticket/create-ticket.page'
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service'
@Component({
  selector: 'header-conversations-list',
  templateUrl: './header-conversations-list.component.html',
  styleUrls: ['./header-conversations-list.component.scss'],
})
export class HeaderConversationsList implements OnInit {
  
  @Input() numberOpenConv: number
  @Input() supportMode: boolean
  @Input() archived_btn: boolean
  @Input() writeto_btn: boolean
  @Input() sound_btn: string;
  @Input() isMobile: boolean;
  @Input() isVisibleTKT: boolean = true;
  @Output() onSoundChange = new EventEmitter<string>()
  @Output() openContactsDirectory = new EventEmitter()
  @Output() openProfileInfo = new EventEmitter()

  createTicketModal = null
  public translationMap: Map<string, string>;

  constructor(
    public events: EventsService,
    public modalController: ModalController,
    private translateService: CustomTranslateService,
  ) {

    this.translations();
    // this.listenToCloseCreateTicketModal() // published from create ticket page
  }

  public translations() {
    const keys = [
      'CreateTicket',
      'ViewArchivedConversations',
      'ViewContactsList'
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }

  // listenToCloseCreateTicketModal() {
  //   this.events.subscribe('closeModalCreateTicket', (bool) => {
  //     console.log('[HEADER-CONV] closeModalCreateTicket ', bool)
  //     if (bool === true) {
  //       this.closeCreateTicketModal()

  //     }
  //   })
  // }

  // closeCreateTicketModal() {
  //   if (this.createTicketModal) {
  //     this.createTicketModal.dismiss().then(() => {
  //       this.createTicketModal = null;
  //     });
  //   }
  // }

  ngOnInit() {
    // console.log('DDP HEADER SUPPORT MODE ', this.supportMode)
  }

  // START @Output() //
  /** */
  onOpenProfileInfo(e: any) {
    this.openProfileInfo.emit(e)
  }

  /** */
  onOpenContactsDirectory(e: any) {
    this.openContactsDirectory.emit(e)
  }

  onSoundChangeFN(e: any){
    this.onSoundChange.emit(e)
  }
  // END @Output() //

  onClickArchivedConversation() {
    this.events.publish('profileInfoButtonClick:changed', 'displayArchived')
  }

  async presentCreateTicketModal() {
    // const attributes = {  enableBackdropDismiss: false };
    const modal = await this.modalController.create({
      component: CreateTicketPage,
      // componentProps: attributes,
      swipeToClose: false,
      backdropDismiss: false,
    })
    modal.onDidDismiss().then((detail: any) => {
      // console.log('[DDP-HEADER] ', detail.data)
    })
    modal.present()
    this.createTicketModal = modal
  }
}
