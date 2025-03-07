import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { Component, Input, OnInit, SimpleChange, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';
import { CannedResponsesService } from 'src/app/services/canned-responses/canned-responses.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { UserModel } from 'src/chat21-core/models/user';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { compareValues, htmlEntities } from 'src/chat21-core/utils/utils';
import { getProjectIdSelectedConversation } from 'src/chat21-core/utils/utils-message';
import { PLAN_NAME } from 'src/chat21-core/utils/constants';

@Component({
  selector: 'app-canned-response',
  templateUrl: './canned-response.component.html',
  styleUrls: ['./canned-response.component.scss'],
})
export class CannedResponseComponent implements OnInit {

  // @Input() tagsCannedFilter: any = []
  @Input() conversationWith: string;
  @Input() conversationWithFullname: string;
  @Input() currentString: string;
  @Input() canShowCanned: boolean = true;
  @Input() stylesMap: Map<string, string>;
  @Input() translationMap: Map<string, string>;
  @Output() onLoadedCannedResponses = new EventEmitter<[any]>();
  @Output() onClickCanned = new EventEmitter<any>();
  @Output() onClickAddCannedResponse = new EventEmitter();
  public loggedUser: UserModel
  public projectID: string;
  
  public tagsCanned: any = []
  public tagsCannedFilter: any = []
  public showLoading: boolean = false

  public arrowkeyLocation = -1

  
  private logger: LoggerService = LoggerInstance.getInstance();
  constructor(
    public tiledeskAuthService: TiledeskAuthService,
    public tiledeskService: TiledeskService,
    public cannedResponsesService: CannedResponsesService,
    public appStorageService: AppStorageService,
    public el: ElementRef
  ) { }

  ngOnInit() {
    this.loggedUser = this.tiledeskAuthService.getCurrentUser()
  }

  ngOnChanges(changes: SimpleChange){
    this.logger.debug('[CANNED] - loadTagsCanned strSearch ', this.currentString)
    if(changes && changes['conversationWith'] && (changes['conversationWith'].previousValue !== changes['conversationWith'].currentValue)){
      this.projectID = getProjectIdSelectedConversation(this.conversationWith)
      this.loadStoredCanned(this.projectID)
    }
    if(this.currentString !== undefined){
      this.loadTagsCanned(this.currentString, this.conversationWith)
    }
  }

  // getProjectIdSelectedConversation(conversationWith: string): string{
  //   const conversationWith_segments = conversationWith.split('-')
  //   // Removes the last element of the array if is = to the separator
  //   if (conversationWith_segments[conversationWith_segments.length - 1] === '') {
  //     conversationWith_segments.pop()
  //   }

  //   this.logger.log('[CANNED] - getProjectIdSelectedConversation conversationWith_segments ', conversationWith_segments)
  //   let projectId = ''
  //   if (conversationWith_segments.length === 4) {
  //     projectId = conversationWith_segments[2]
  //     this.logger.log('[CANNED] - getProjectIdSelectedConversation projectId ', projectId)
  //   }
  //   return projectId
  // }


  loadStoredCanned(projectId){
    let storedCanned = this.appStorageService.getItem(projectId+'_canned')
    if(storedCanned){
      this.tagsCannedFilter = JSON.parse(storedCanned)
    }
  }

  // ----------------------------------------------------------
  // @ CANNED RESPONSES methods
  // ----------------------------------------------------------
  loadTagsCanned(strSearch, conversationWith) {
    this.logger.log('[CANNED] - loadTagsCanned strSearch ', strSearch)
    this.logger.log('[CANNED] - loadTagsCanned conversationWith ', conversationWith)

    if (this.projectID) {
      this.logger.log('[CANNED] - loadTagsCanned projectId ', this.projectID)
      this.getAndShowCannedResponses(strSearch, this.projectID)
    } else {
      this.getProjectIdByConversationWith(strSearch, this.conversationWith)
    }
  }

  getProjectIdByConversationWith(strSearch, conversationWith: string) {
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()

    this.tiledeskService.getProjectIdByConvRecipient(tiledeskToken, conversationWith).subscribe((res) => {
      this.logger.log('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT RES', res)
      if (res) {
        const projectId = res.id_project
        this.logger.log('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT projectId ', projectId)
        if (projectId) {
          this.getAndShowCannedResponses(strSearch, projectId)
        }
      }
    }, (error) => {
      this.logger.error('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT - ERROR  ', error)
    }, () => {
      this.logger.log('[CANNED] - loadTagsCanned - GET PROJECTID BY CONV RECIPIENT * COMPLETE *')
    })
  }

  getAndShowCannedResponses(strSearch, projectId) {
    this.logger.log('[CANNED] - loadTagsCanned tagsCanned.length', this.tagsCanned.length)
    //if(this.tagsCanned.length <= 0 ){
    this.tagsCanned = []
    this.showLoading = true;
    this.cannedResponsesService.getAll(projectId).subscribe((res) => {
      this.logger.log('[CANNED] - loadTagsCanned  getCannedResponses RES', res)

      this.tagsCanned = res
      // if (this.HIDE_CANNED_RESPONSES === false) {
      this.showTagsCanned(strSearch)
      // }
    }, (error) => {
      this.logger.error('[CANNED] - loadTagsCanned  getCannedResponses - ERROR  ', error)
    }, () => {
      this.logger.log('[CANNED] - loadTagsCanned  getCannedResponses * COMPLETE *')
      setTimeout(() => {
        this.showLoading = false
      }, 1000);
    })
  }

  showTagsCanned(strSearch) {
    this.logger.log('[CANNED] - showTagsCanned strSearch ', strSearch)
    this.tagsCannedFilter = []
    var tagsCannedClone = JSON.parse(JSON.stringify(this.tagsCanned))
    this.logger.log('[CANNED] - showTagsCanned tagsCannedClone ', tagsCannedClone)
    //this.logger.log("that.contacts lenght:: ", strSearch);
    this.tagsCannedFilter = this.filterItems(tagsCannedClone, strSearch)
    this.logger.log('[CANNED] - showTagsCanned tagsCannedFilter ', this.tagsCannedFilter)

    this.tagsCannedFilter.sort(compareValues('title', 'asc'))
    var strReplace = strSearch
    if (strSearch.length > 0) {
      strReplace = "<b class='highlight-search-string'>" + strSearch + '</b>'
    }
    // for (var i = 0; i < this.tagsCannedFilter.length; i++) {
    //   let text = htmlEntities(this.tagsCannedFilter[i].text);
    //   // const textCanned = "<div class='cannedText'>" + this.replacePlaceholderInCanned(this.tagsCannedFilter[i].text) + '</div>'
    //   const textCanned = "<div class='cannedText'>" + this.replacePlaceholderInCanned(text) + '</div>'
    //   let title = htmlEntities(this.tagsCannedFilter[i].title)
    //   // this.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>" + this.tagsCannedFilter[i].title.toString().replace(strSearch, strReplace.trim()) + '</div>' + textCanned + '</div>'
    //   this.tagsCannedFilter[i].title = "<div class='cannedContent'><div class='cannedTitle'>" + title.toString().replace(strSearch, strReplace.trim()) + '</div>' + textCanned + '</div>'
    // }
    this.tagsCannedFilter.forEach(canned => {
      canned.text = this.replacePlaceholderInCanned(canned.text);
      canned.disabled = true
    });
    this.appStorageService.setItem(this.projectID+'_canned', JSON.stringify(this.tagsCannedFilter))
    this.onLoadedCannedResponses.emit(this.tagsCannedFilter)
    
  }

  filterItems(items, searchTerm) {
    // this.logger.log('[CANNED] filterItems tagsCannedClone ', items, ' searchTerm: ', searchTerm)
    //this.logger.log("filterItems::: ",searchTerm);
    return items.filter((item) => {
      // this.logger.log('[CANNED] filtered tagsCannedClone item ', item)
      return item.title.toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) > -1
    })
  }

  replacePlaceholderInCanned(str) {
    // this.logger.log('[CANNED] - replacePlaceholderInCanned str ', str)
    str = str.replace('$recipient_name', this.conversationWithFullname)
    if (this.loggedUser && this.loggedUser.fullname) {
      str = str.replace('$agent_name', this.loggedUser.fullname)
    }
    return str
  }


  onEditCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    canned.disabled = false
    this.logger.log('[CANNED] onEditCanned ', canned)
    setTimeout(() => {
      this.el.nativeElement.querySelector('#titleCanned_'+canned._id).setFocus()
    }, 500);
  }

  onConfirmEditCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CANNED] onConfirmEditCanned ', canned, ev)
    this.cannedResponsesService.edit(tiledeskToken, canned.id_project, canned).subscribe(cannedRes=> {
      canned.disabled = true
    }, (error) => {
      this.logger.error('[CANNED] - onConfirmEditCanned - ERROR  ', error)
    }, () => {
      this.logger.log('[CANNED] - onConfirmEditCanned * COMPLETE *')
    })
  }
  
  onDeleteCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    const tiledeskToken = this.tiledeskAuthService.getTiledeskToken()
    this.logger.log('[CANNED] onDeleteCanned ', canned)
    this.cannedResponsesService.delete(tiledeskToken, canned.id_project, canned._id).subscribe(cannedRes=> {
      if(cannedRes.status === 1000){
        this.tagsCannedFilter.splice(this.tagsCannedFilter.findIndex(el => el._id === canned._id), 1)
      }
    }, (error) => {
      this.logger.error('[CANNED] - onConfirmEditCanned - ERROR  ', error)
    }, () => {
      this.logger.log('[CANNED] - onConfirmEditCanned * COMPLETE *')
    })
  }

  onPinCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    this.logger.log('[CANNED] onPinCanned ', canned)
  }

  onUnPinCanned(canned, ev){
    ev.preventDefault()
    ev.stopPropagation()
    this.logger.log('[CANNED] onUnPinCanned ', canned)
  }

  onClickCannedFN(canned, event){
    if(!canned.disabled){
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.logger.log('[CANNED] THERE IS CANNED ', canned.text)
      this.onClickCanned.emit(canned)
    }
  }

  onClickAddCannedResponseFN(){
    this.onClickAddCannedResponse.emit()
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // this.logger.log("CONVERSATION-DETAIL handleKeyboardEvent  event.key ", event);

    if (this.tagsCannedFilter.length > 0) {
      if (event.key === 'ArrowDown') {
        this.arrowkeyLocation++
        if (this.arrowkeyLocation === this.tagsCannedFilter.length) {
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
        const canned_selected = this.tagsCannedFilter[this.arrowkeyLocation]
        this.logger.log('[CONVS-DETAIL] replaceTagInMessage  canned_selected ',canned_selected)
        if (canned_selected) {
          this.arrowkeyLocation = -1
          this.tagsCannedFilter = []
          this.onClickCanned.emit(canned_selected)
          // event.preventDefault();
          // return false;
        }
      }
    }
  }

}
