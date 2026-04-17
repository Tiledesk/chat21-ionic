import { ConversationModel } from 'src/chat21-core/models/conversation';
import { EventsService } from './../../services/events-service';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { WebsocketService } from 'src/app/services/websocket/websocket.service';
import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { AppStorageService } from 'src/chat21-core/providers/abstract/app-storage.service';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { TiledeskService } from 'src/app/services/tiledesk/tiledesk.service';
import { WebSocketJs } from 'src/app/services/websocket/websocket-js';
import { AppConfigProvider } from 'src/app/services/app-config';
import { ConvertRequestToConversation } from 'src/chat21-core/utils/convertRequestToConversation';
import { compareValues, getUserStatusFromProjectUser } from 'src/chat21-core/utils/utils';
import { ProjectService } from 'src/app/services/projects/project.service';
import { ProjectUser } from 'src/chat21-core/models/project_user';

@Component({
  selector: 'app-project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.scss'],
})
export class ProjectItemComponent implements OnInit {
  private logger: LoggerService = LoggerInstance.getInstance();

  @Input() projectID: string;
  @Output() projectIdEvent = new EventEmitter<string>()
  @Output() openUnsevedConvsEvent = new EventEmitter<any>()

  private unsubscribe$: Subject<any> = new Subject<any>();
  /** ID progetti in cui l'utente è Available (per filtrare il count unserved) */
  private availableProjectIds: Set<string> = new Set();
  project: any;
  tiledeskToken: string;

  unservedRequestCount: number = 0;
  unservedConversations: ConversationModel[] = [];
  currentUserRequestCount: number;
  ROLE_IS_AGENT: boolean;
  currentUserId: string;
  public translationMap: Map<string, string>;
 
  window_width_is_60: boolean;
  newInnerWidth: any;
  avaialble_status_for_tooltip: string;
  
  constructor(
    public wsService: WebsocketService,
    public appStorageService: AppStorageService,
    private translateService: CustomTranslateService,
    public tiledeskAuthService: TiledeskAuthService,
    public projectService: ProjectService,
    public webSocketJs: WebSocketJs,
    private appConfigProvider: AppConfigProvider,
    public events: EventsService,
    public convertRequestToConversation: ConvertRequestToConversation
  ) { }

  ngOnInit() {
    this.getStoredTokenAndConnectWS();
    this.getStoredCurrenUser();
    this.translations();
    this.listenToPostMsgs();
    this.onInitWindowWidth();
  }

  ngOnDestroy() {
    this.logger.log('[PROJECT-ITEM] > ngOnDestroy')
    this.wsService.unsubscribeFromAllProjectConversations();
    this.unsubscribe$.next()
    this.unsubscribe$.complete()

  }

  openUnservedConvs() {
    this.openUnsevedConvsEvent.emit({event: 'notificationsorprjctbtn', data: this.unservedConversations})
  }
  openUnservedConvsAndGoToProjectList() {
    this.openUnsevedConvsEvent.emit({event:'pinbtn', data: this.unservedConversations})
  }

  getStoredTokenAndConnectWS() {
    this.tiledeskToken = this.appStorageService.getItem('tiledeskToken');
    this.logger.log('[PROJECT-ITEM] - STORED TILEDEK TOKEN ', this.tiledeskToken)
    this.connetWebsocket(this.tiledeskToken)
  }

  connetWebsocket(tiledeskToken) {

    this.logger.log('[WEBSOCKET-JS] connetWebsocket called in [PROJECT-ITEM] tiledeskToken ', tiledeskToken)
    const appconfig = this.appConfigProvider.getConfig();
    this.logger.log('[WEBSOCKET-JS] connetWebsocket called in [PROJECT-ITEM] wsUrl ', appconfig.wsUrl)
    const WS_URL = appconfig.wsUrl + '?token=' + tiledeskToken
    this.logger.log('[WEBSOCKET-JS] connetWebsocket called in [PROJECT-ITEM] wsUrl ', WS_URL)
    this.webSocketJs.init(
      WS_URL,
      undefined,
      undefined,
      undefined
    );

    this.getLastProjectStoredAndSubscToWSAvailabilityAndConversations();
  }

  listenToPostMsgs() {
    window.addEventListener("message", (event) => {
      if (event && event.data) {
        if (event.data === 'hasChangedProject') {
          this.unservedRequestCount = 0;
          this.wsService.unsubscribeFromAllProjectConversations();
          this.getLastProjectStoredAndSubscToWSAvailabilityAndConversations();
        }
      }
    })
  }


  public translations() {
    const keys = [
      'LABEL_AVAILABLE',
      'LABEL_NOT_AVAILABLE',
      'LABEL_BUSY',
      'VIEW_ALL_CONVERSATIONS',
      'UnassignedConversations',
      // 'CONVERSATIONS_IN_QUEUE',
      // 'CONVERSATION_IN_QUEUE',
      // 'NO_CONVERSATION_IN_QUEUE',
      'PINNED_PROJECT',
      'CHANGE_PINNED_PROJECT',
      "CHANGE_TO_YOUR_STATUS_TO_AVAILABLE",
      "CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE"
    ];
    this.translationMap = this.translateService.translateLanguage(keys);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[PROJECT-ITEM] - INNER WIDTH ', this.newInnerWidth)

    // if (this.newInnerWidth <= 150) {
    //   this.window_width_is_60 = true;
    // } else {
    //   this.window_width_is_60 = false;
    // }
  }

  onInitWindowWidth(): any {
    const actualWidth = window.innerWidth;
    this.logger.log('[PROJECT-ITEM] - ACTUAL Width ', actualWidth);

  }

  getStoredCurrenUser() {
    const storedCurrentUser = this.appStorageService.getItem('currentUser');
    this.logger.log('[PROJECT-ITEM] - STORED CURRENT USER ', storedCurrentUser)
    if (storedCurrentUser && storedCurrentUser !== 'undefined') {
      const currentUser = JSON.parse(storedCurrentUser)
      this.logger.log('[PROJECT-ITEM] - STORED CURRENT USER OBJCT', currentUser);
      this.currentUserId = currentUser.uid
      this.logger.log('[PROJECT-ITEM] - CURRENT USER ID', this.currentUserId);
    } else {
      this.logger.error('[PROJECT-ITEM] - STORED CURRENT USER OBJCT NOT FOUND IN STORAGE');
    }
  }

  getStoredProject(): ProjectUser | null {
    try {
      const raw = localStorage.getItem('last_project');

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      if (this.isValidStoredProject(parsed)) {
        return parsed;
      }

      // modello sbagliato → pulizia
      this.logger.warn('[PROJECT-ITEM] Invalid stored project schema, clearing storage');
      localStorage.removeItem('last_project');
      return null;

    } catch (err) {
      this.logger.error('[PROJECT-ITEM] Error parsing stored project', err);
      localStorage.removeItem('last_project');
      return null;
    }
  }

  getLastProjectStoredAndSubscToWSAvailabilityAndConversations() {

    let stored_project = this.getStoredProject();

    const applySubscriptions = (projects: ProjectUser[], currentProject: ProjectUser) => {
      this.project = currentProject;
      if (!stored_project) {
        localStorage.setItem('last_project', JSON.stringify(currentProject));
      }
      projects.forEach((p) => (p.teammateStatus = getUserStatusFromProjectUser(p as any)));
      const ids = this.wsService.subscriptionToWsConversationsForOnlineProjects(projects);
      this.availableProjectIds = new Set(ids || []);
      this.doProjectSubscriptions(currentProject);
    };

    if (!stored_project) {
      this.logger.log('[PROJECT-ITEM] No valid stored project, fetching remote');
      this.projectService.getProjects().subscribe(projects => {
        let project: ProjectUser | undefined;

        if (this.projectID) {
          project = projects.find( p => p.id_project?._id === this.projectID );
        }

        if (!project) {
          project = projects[0];
        }

        if (!project) {
          this.logger.warn('[PROJECT-ITEM] No projects returned from API');
          return;
        }

        applySubscriptions(projects, project);

      }, error => {
        this.logger.error('[PROJECT-ITEM] GET PROJECTS ERROR', error);
      });

      return;
    }

    this.projectService.getProjects().subscribe(projects => {
      const currentProject = projects.find(p => p.id_project?._id === stored_project.id_project?._id) || stored_project;
      applySubscriptions(projects, currentProject);
    }, error => {
      this.logger.error('[PROJECT-ITEM] GET PROJECTS ERROR (stored)', error);
      this.project = stored_project;
      this.doProjectSubscriptions(stored_project);
    });
  }

  doProjectSubscriptions(project) {
    this.events.publish('storage:last_project', project)
    this.logger.log('[PROJECT-ITEM] doProjectSubscriptions project ', project)
    if (project) {
      const user_role = this.project.role
      this.logger.log('[PROJECT-ITEM] - user_role ', user_role)
      //TODO: recuperare id da root project (DA VERIFICARE)
      this.projectIdEvent.emit(project.id_project._id)

      if (user_role === 'agent') {
        this.ROLE_IS_AGENT = true;

      } else {
        this.ROLE_IS_AGENT = false;
      }


      this.logger.log('[PROJECT-ITEM] - LAST PROJECT PARSED > user_role ', user_role)
      //TODO: recuperare project_user_ID da API --> aggiugere metodo
      this.wsService.subscriptionToWsCurrentProjectUserAvailability(project.id_project._id, this.project._id);
      this.listenTocurrentProjectUserUserAvailability$(project)

      // Le conversations sono già sottoscritte per tutti i progetti online in subscriptionToWsConversationsForOnlineProjects
      this.updateUnservedRequestCount();

    }
  }

  listenTocurrentProjectUserUserAvailability$(project) {
    this.wsService.currentProjectUserAvailability$.pipe(takeUntil(this.unsubscribe$)).subscribe((projectUser) => {
        this.logger.log('[PROJECT-ITEM] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS RES ', projectUser);

        if (project.id_project._id === projectUser['id_project']) {
          project['ws_projct_user_available'] = projectUser['user_available'];
          project['ws_projct_user_isBusy'] = projectUser['isBusy']
          if (this.translationMap) {
            if (projectUser['user_available'] === true) {
              this.avaialble_status_for_tooltip = this.translationMap.get('CHANGE_TO_YOUR_STATUS_TO_UNAVAILABLE')
            } else {
              this.avaialble_status_for_tooltip = this.translationMap.get('CHANGE_TO_YOUR_STATUS_TO_AVAILABLE')
            }
          }
          const projectId = projectUser['id_project'];
          if (projectUser['user_available'] === true) {
            this.availableProjectIds.add(projectId);
          } else {
            this.availableProjectIds.delete(projectId);
          }
          this.recalculateUnservedCount(this.wsService.wsRequestsList);
        }

      }, (error) => {
        this.logger.error('[PROJECT-ITEM] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS error ', error);
      }, () => {
        this.logger.log('[PROJECT-ITEM] - $UBSC TO WS USER AVAILABILITY & BUSY STATUS * COMPLETE *');
      })
  }

  changeAvailabilityState(projectid, available) {
    this.logger.log('[PROJECT-ITEM] - changeAvailabilityState projectid', projectid, ' available: ', available);

    available = !available
    this.logger.log('[PROJECT-ITEM] - changeAvailabilityState projectid', projectid, ' available: ', available);

    this.wsService.updateCurrentUserAvailability(this.tiledeskToken, projectid, available, "").subscribe((projectUser: any) => {

        this.logger.log('[PROJECT-ITEM] - PROJECT-USER UPDATED ', projectUser)
        // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
        // this.usersService.availability_btn_clicked(true)

        if (this.project['id_project']._id === projectUser.id_project) {
          this.project['ws_projct_user_available'] = projectUser.user_available;
          // this.project['ws_projct_user_isBusy'] = projectUser['isBusy']
        }

      }, (error) => {
        this.logger.error('[PROJECT-ITEM] - PROJECT-USER UPDATED - ERROR  ', error);

      }, () => {
        this.logger.log('[PROJECT-ITEM] - PROJECT-USER UPDATED  * COMPLETE *');

      });
  }

  private getRequestProjectId(r: any): string | undefined {
    if (!r?.id_project) return undefined;
    return typeof r.id_project === 'string' ? r.id_project : r.id_project?._id;
  }
 
  private recalculateUnservedCount(requests: any[]) {
    if (!requests) return;

    let count = 0;
    const nextConvs: ConversationModel[] = [];
    const seenUids = new Set<string>();

    for (const r of requests) {
      const projectId = this.getRequestProjectId(r);
      if (!projectId || !this.availableProjectIds.has(projectId)) continue;
      if (r['status'] !== 100 || !this.hasmeInAgents(r['agents'])) continue;

      count += 1;
      const conv = this.convertRequestToConversation.getConvFromRequest(r);
      if (seenUids.has(conv.uid)) continue;
      seenUids.add(conv.uid);
      nextConvs.push(conv);
    }

    nextConvs.sort(compareValues('timestamp', 'desc'));
    this.unservedConversations = nextConvs;

    if (count > this.unservedRequestCount) {
      this.events.publish('unservedRequest:count', count);
    }
    this.logger.log('[PROJECT-ITEM] - unservedRequestCount', count);
    this.unservedRequestCount = count;
  }

  updateUnservedRequestCount() {
    this.wsService.wsRequestsList$
      .pipe(takeUntil(this.unsubscribe$))
      .pipe(skip(1))
      .subscribe(
        (requests) => this.recalculateUnservedCount(requests),
        (error) => this.logger.error('[PROJECT-ITEM] UNSERVED REQUEST COUNT * error * ', error),
        () => this.logger.log('[PROJECT-ITEM] UNSERVED REQUEST COUNT */* COMPLETE */*')
      );
  }

  hasmeInAgents(agents: any[] | undefined): boolean {
    if (!agents) {
      this.logger.log('[PROJECT-ITEM] hasmeInAgents OOPS!!! AGENTS THERE ARE NOT ');
      return false;
    }
    return agents.some((a) => a.id_user === this.currentUserId);
  }

  isValidStoredProject(obj: any): obj is ProjectUser {
    return (
      obj &&
      typeof obj === 'object' &&
      obj.id_project &&
      typeof obj.id_project === 'object' &&
      typeof obj.id_project._id === 'string' &&
      typeof obj._id === 'string' &&
      typeof obj.role === 'string'
    );
  }



}


