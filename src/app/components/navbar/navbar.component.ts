import { AppConfigProvider } from 'src/app/services/app-config';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { EventsService } from 'src/app/services/events-service';
import { ProjectService } from '../../services/projects/project.service';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { Project } from 'src/chat21-core/models/projects';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';
import { ProjectUsersService } from 'src/app/services/project_users/project-users.service';
import { ProjectUser } from 'src/chat21-core/models/projectUsers';
import { PERMISSIONS } from 'src/app/utils/permissions.constants';
import { getOSCode, hasRole } from 'src/app/utils/utils';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  @Input() isSoundEnabled: boolean;
  @Output() onSoundChange = new EventEmitter<string>();

  private logger: LoggerService = LoggerInstance.getInstance();
  private tiledeskToken: string;

  public projects: Project[] = [];
  public project: any = [];
  private USER_ROLE: string;

  public translationsMap: Map<string, string> = new Map();

  public openDropdownProjects: boolean = false
  private public_Key: string;
  public isVisible: boolean;
  public isVisibleMT: boolean;

  public projectUser: ProjectUser;
  public roles: { [key: string]: boolean }
  PERMISSIONS = PERMISSIONS;
  constructor(
    private projectService: ProjectService,
    public projectUsersService: ProjectUsersService,
    private tiledeskAuthService: TiledeskAuthService,
    private appConfigProvider: AppConfigProvider,
    private translateService: CustomTranslateService, 
    private events: EventsService,
    private cdref: ChangeDetectorRef, 
  ) { }

  ngOnInit() {
    this.initTranslations();
    this.listenToUserGoOnline();
    this.getStoredProjectAndUserRole();
    this.getOSCODE();
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  initTranslations(){
    let keys= [
      "NAVBAR.SIMULATE_VISITOR",
      "NAVBAR.PROJECT_SETTINGS",
      "NAVBAR.VIEW_ALL_PROJECTS",
      "NAVBAR.ADD_PROJECT",
      "NAVBAR.RECENT_PROJECTS",
      "NAVBAR.OTHER_PROJECTS",
      "LABEL_CHAT"
    ]

    this.translationsMap = this.translateService.translateLanguage(keys)
  }

  listenToUserGoOnline(){
    this.events.subscribe('go:online', (isOnline)=> {
      this.logger.log('[NAVBAR] listen to go:online --> ', isOnline);
      if(isOnline){
        this.tiledeskToken = this.tiledeskAuthService.getTiledeskToken();
        this.getProjects()
      }
    });
  }

  getProjects() {
    this.logger.log('[NAVBAR] calling getProjects ... ');
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[NAVBAR] getProjects PROJECTS ', projects);
      if (projects) {
          // this.projects = projects;
          this.projects = projects.filter((project: any) => {
              // this.logger.log('[NAVBAR] getProjects PROJECTS status ', project.id_project.status);
              return project.id_project.status === 100;
          });
          this.logger.log('[NAVBAR] getProjects this.projects ', this.projects);
      }
    }, (error) => {
        this.logger.error('[NAVBAR] getProjects - ERROR ', error)
    }, () => {
        this.logger.log('[NAVBAR] getProjects - COMPLETE')
    });
  }

  getStoredProjectAndUserRole() {
    this.events.subscribe('storage:last_project',async (project) =>{
      this.logger.log('[NAVBAR] stored_project ', project)
      if (project && project !== 'undefined') {
        this.project = project;
        this.USER_ROLE = project.role;
        this.projectUser = await this.projectUsersService.getProjectUserByProjectId(project.id_project.id)
        this.roles = this.checkRoles()
        this.logger.log('[SIDEBAR] roles ', this.roles)
      }
    })
  }

  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[NAVBAR] AppConfigService getAppConfig public_Key', this.public_Key)
    
    this.isVisibleMT = getOSCode("MTT", this.public_Key);

  }

  checkRoles(): { [key: string]: boolean } {
    const permissionKeys = [
      'CHANGE_PROJECT',
      'SIMULATE_CONV',
    ] as const;

    const roles: { [key: string]: boolean } = {};
    for (const key of permissionKeys) {
      const permission = PERMISSIONS[key];
      roles[permission] = hasRole(this.projectUser, permission);
    }
    
    return roles;

  }


  onClickSound(event: string){
    this.onSoundChange.emit(event)
  }


  testWidgetPage() {
    const simulateVisitorBtnElem = <HTMLElement>document.querySelector('.simulate-visitor-btn');
    simulateVisitorBtnElem.blur();
    // + '&isOpen=true'
    const url = this.appConfigProvider.getConfig().widgetBaseUrl + 'assets/twp/index.html?tiledesk_projectid=' + this.project.id_project.id + '&project_name=' + encodeURIComponent(this.project.id_project.name) + '&role=' + this.USER_ROLE
    window.open(url, '_blank');
  }

  onClickDropdownOption(event: string){
    const baseUrl = this.appConfigProvider.getConfig().dashboardUrl
    let url = baseUrl
    if(event === 'projectSettings'){
      url = baseUrl + '#/project/' + this.project.id_project.id + '/project-settings/general' + '?token=' + this.tiledeskToken
    }else if(event ==='allProjects'){
      url = baseUrl + '#/projects/' + '?token=' + this.tiledeskToken
    }else if(event === 'addProject'){
      url = baseUrl + '#/create-new-project/' + '?token=' + this.tiledeskToken
    }
    console.log('onClickDropdownOption-->', url)
    window.open(url, '_blank');
  }

  goToHome(id_project: string, project_name: string,) {
    // this.logger.log('!NAVBAR  goToHome prjct ', prjct)
    this.logger.log('[NAVBAR] goToHome id_project ', id_project, 'project_name', project_name)
    // RUNS ONLY IF THE THE USER CLICK OVER A PROJECT WITH THE ID DIFFERENT FROM THE CURRENT PROJECT ID
    const baseUrl = this.appConfigProvider.getConfig().dashboardUrl
    if (id_project !== this.project.id_project.id) {
      // this.subscription.unsubscribe();
      // this.unsubscribe$.next();
      // this.unsubscribe$.complete();

      const url = this.appConfigProvider.getConfig().dashboardUrl + `#/project/${id_project}/home`
      window.open(url, '_blank');

    }
}

}
