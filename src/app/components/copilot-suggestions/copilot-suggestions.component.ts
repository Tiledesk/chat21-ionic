import { AppConfigProvider } from 'src/app/services/app-config';
import { filter } from 'rxjs/operators';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { CopilotService } from 'src/app/services/copilot/copilot.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { UserModel } from 'src/chat21-core/models/user';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { getProjectIdSelectedConversation } from 'src/chat21-core/utils/utils';

@Component({
  selector: 'copilot-suggestions',
  templateUrl: './copilot-suggestions.component.html',
  styleUrls: ['./copilot-suggestions.component.scss'],
})
export class CopilotSuggestionsComponent implements OnInit {

   // @Input() tagsCannedFilter: any = []
  @Input() question: string;
  @Input() conversationWith: string;
  @Input() conversationWithFullname: string;
  @Input() currentString: string;
  @Input() stylesMap: Map<string, string>;
  @Input() translationMap: Map<string, string>;
  @Output() onLoadedSuggestions = new EventEmitter<[any]>();
  @Output() onClickSuggestion = new EventEmitter<any>();

  public loggedUser: UserModel
  public projectID: string;

  public suggestions: any = []
  public showLoading: boolean = false

  public arrowkeyLocation = -1


  private logger: LoggerService = LoggerInstance.getInstance();
  constructor(
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    public copilotService: CopilotService,
    public appConfigProvider: AppConfigProvider,
    public el: ElementRef
  ) { 
    const serverBaseUrl = this.appConfigProvider.getConfig().apiUrl
    this.copilotService.initialize(serverBaseUrl)
  }

  ngOnInit() {
    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
  }

  ngOnChanges(changes: SimpleChange){
    this.logger.debug('[COPILOT] - loadTagsCanned strSearch ', this.currentString)
    if(changes && changes['conversationWith'] && (changes['conversationWith'].previousValue !== changes['conversationWith'].currentValue)){
      this.projectID = getProjectIdSelectedConversation(this.conversationWith)
    }
    this.loadSuggestions(this.conversationWith)
  }


  // ----------------------------------------------------------
  // @ CANNED RESPONSES methods
  // ----------------------------------------------------------
  loadSuggestions(conversationWith) {
    this.logger.log('[COPILOT] - loadTagsCanned conversationWith ', conversationWith)

    if (this.projectID) {
      this.logger.log('[COPILOT] - loadTagsCanned projectId ', this.projectID)
      this.getAndShowSuggestions(this.projectID)
    } else {
      this.getProjectIdByConversationWith(this.conversationWith)
    }
  }

  getProjectIdByConversationWith(conversationWith: string) {
    this.tiledeskService.getProjectIdByConvRecipient(conversationWith).subscribe((res) => {
      this.logger.log('[COPILOT] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT RES', res)
      if (res) {
        const projectId = res.id_project
        this.logger.log('[COPILOT] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT projectId ', projectId)
        if (projectId) {
          this.getAndShowSuggestions(projectId)
        }
      }
    }, (error) => {
      this.logger.error('[COPILOT] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
    }, () => {
      this.logger.log('[COPILOT] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
    })
  }


  getAndShowSuggestions(projectId) {
    this.logger.log('[COPILOT] - loadTagsCanned tagsCanned.length', this.suggestions.length)
    //if(this.tagsCanned.length <= 0 ){
    this.suggestions = []
    this.showLoading = true;
    if(this.question && this.question !== ''){
      this.copilotService.getAllFromQuestion(this.question, projectId, this.conversationWith).subscribe((res) => {
        this.logger.log('[COPILOT] - loadTagsCanned  getCannedResponses RES', res)
        this.suggestions = res.map(el => ({ ...el, disabled : true }))
        this.logger.log('[COPILOT] - loadTagsCanned  getCannedResponses tagsCannedCount', this.suggestions)
      }, (error) => {
        this.logger.error('[COPILOT] - loadTagsCanned  getCannedResponses - ERROR  ', error)
      }, () => {
        this.logger.log('[COPILOT] - loadTagsCanned  getCannedResponses * COMPLETE *')
        this.showLoading = false
        this.onLoadedSuggestions.emit(this.suggestions)
      })
    } else {
      this.copilotService.getAll(projectId, this.conversationWith).subscribe((res) => {
        this.logger.log('[COPILOT] - loadTagsCanned  getCannedResponses RES', res)
        this.suggestions = res.map(el => ({ ...el, disabled : true }))
        this.logger.log('[COPILOT] - loadTagsCanned  getCannedResponses tagsCannedCount', this.suggestions)
      }, (error) => {
        this.logger.error('[COPILOT] - loadTagsCanned  getCannedResponses - ERROR  ', error)
      }, () => {
        this.logger.log('[COPILOT] - loadTagsCanned  getCannedResponses * COMPLETE *')
        this.showLoading = false
        this.onLoadedSuggestions.emit(this.suggestions)
      })
    }
  }


  onClickSuggestionFN(suggestion, event){
    if(!suggestion.disabled){
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.logger.log('[CANNED] THERE IS NOT CANNED ', suggestion.text)
      this.onClickSuggestion.emit(suggestion)
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // this.logger.log("CONVERSATION-DETAIL handleKeyboardEvent  event.key ", event);

    if (this.suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        this.arrowkeyLocation++
        if (this.arrowkeyLocation === this.suggestions.length) {
          this.arrowkeyLocation--
        }
        // this.replaceTagInMessage(this.tagsCannedFilter[this.arrowkeyLocation])
      } else if (event.key === 'ArrowUp') {
        if (this.arrowkeyLocation > 0) {
          this.arrowkeyLocation--
        } else if (this.arrowkeyLocation < 0) {
          this.arrowkeyLocation++
        }
        // this.replaceTagInMessage(this.tagsCannedFilter[this.arrowkeyLocation])
      }

      // set the focus on current canned 
      setTimeout(() => {
        this.el.nativeElement.querySelector('.canned-list').scrollTop = this.arrowkeyLocation * 59 // 59px is the height of the single element
        // this.el.nativeElement.querySelector('#canned-item_'+this.arrowkeyLocation).scrollIntoView({ behavior: 'smooth' })
      }, 0);

      if (event.key === 'Enter') {
        const canned_selected = this.suggestions[this.arrowkeyLocation]
        this.logger.log('[CONVS-DETAIL] replaceTagInMessage  canned_selected ',canned_selected)
        if (canned_selected) {
          this.arrowkeyLocation = -1
          this.onClickSuggestion.emit(canned_selected)
          // event.preventDefault();
          // return false;
        }
      }
    }
  }




}
