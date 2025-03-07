import { AppConfigProvider } from 'src/app/services/app-config';
import { TiledeskAuthService } from 'src/chat21-core/providers/tiledesk/tiledesk-auth.service';
import { EventsService } from 'src/app/services/events-service';
import { ProjectService } from '../../services/projects/project.service';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';
import { Project } from 'src/chat21-core/models/projects';
import { CustomTranslateService } from 'src/chat21-core/providers/custom-translate.service';

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
  public MT: boolean;

  constructor(
    private projectService: ProjectService,
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
    this.events.subscribe('storage:last_project',project =>{
      this.logger.log('[NAVBAR] stored_project ', project)
      if (project && project !== 'undefined') {
        this.project = project;
        this.USER_ROLE = project.role;
      }
    })
  }

  getOSCODE() {
    this.public_Key = this.appConfigProvider.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[NAVBAR] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[NAVBAR] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
        // this.logger.log('NavbarComponent public_Key key', key)
        if (key.includes("PAY")) {
            // this.logger.log('PUBLIC-KEY (Navbar) - key', key);
            let pay = key.split(":");
            // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
            if (pay[1] === "F") {
                this.isVisible = false;
                // this.logger.log('PUBLIC-KEY (Navbar) - pay isVisible', this.isVisible);
            } else {
                this.isVisible = true;
                // this.logger.log('PUBLIC-KEY (Navbar) - pay isVisible', this.isVisible);
            }
        }

        if (key.includes("MTT")) {
            // this.logger.log('PUBLIC-KEY (Navbar) - key', key);
            let mt = key.split(":");
            // this.logger.log('PUBLIC-KEY (Navbar) - mt key&value', mt);
            if (mt[1] === "F") {
                this.MT = false;
                // this.logger.log('PUBLIC-KEY (Navbar) - mt is', this.MT);
            } else {
                this.MT = true;
                // this.logger.log('PUBLIC-KEY (Navbar) - mt is', this.MT);
            }
        }
    });

    if (!this.public_Key.includes("MTT")) {
        this.MT = false;
        // this.logger.log('PUBLIC-KEY (Navbar) - mt is', this.MT);
    }

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
