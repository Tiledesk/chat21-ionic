import { Injectable, OnInit } from "@angular/core";
import { PLAN_NAME } from "src/chat21-core/utils/constants";
import { LoggerService } from "src/chat21-core/providers/abstract/logger.service";
import { LoggerInstance } from "src/chat21-core/providers/logger/loggerInstance";
import { Project } from 'src/chat21-core/models/projects';
import { ProjectService } from "../services/projects/project.service";
import { AppConfigProvider } from "../services/app-config";

@Injectable({
    providedIn: 'root'
})
export class ProjectPlanUtils {
    
    project: Project

    private logger: LoggerService = LoggerInstance.getInstance()
    constructor(
        private projectService: ProjectService
    ){ 
    }

    checkProjectProfileFeature(project: Project, feature: string): boolean{
        
        this.logger.log('[PROJECT_PROFILE] checkProjectProfileFeature -->', feature, project)

        // this.project = await this.projectService.getProjectById(projectId).toPromise()
        this.project = project;

        if(this.project.profile.type === 'free'){
            this.logger.log('[PROJECT_PROFILE] USECASE: Free Plan')
            if(this.project.trialExpired === false){
                // ------------------------------------------------------------------------ 
                // USECASE: Free Plan (TRIAL ACTIVE i.e. Scale trial)
                // ------------------------------------------------------------------------
                return true
            }else {
                // ------------------------------------------------------------------------
                // USECASE: Free Plan (TRIAL EXPIRED)
                // ------------------------------------------------------------------------
                return false
            }
        }else if(this.project.profile.type === 'payment'){
            // ------------------------------------------------------------------------ 
            // USECASE: PAYMENT Plan (TRIAL ACTIVE i.e. Scale trial)
            // ------------------------------------------------------------------------
            this.logger.log('[PROJECT_PROFILE] USECASE: payment')
            
            /** check if the subscription is Active or NOT */
            if(this.project.isActiveSubscription === false){
                return false
            }

            /** get che current keyName for the current project (usefull to compare later)*/
            /** before: MAKE A COMPARE BETWEEN OLD AND NEW PROJECT TYPE
             * LEGEND: 
             * - A --> D
             * - B --> E
             * - C --> F
             */
            let currentPlanNameKey: string[] = ['A']
            switch(this.project.profile.name.toUpperCase()){
                case PLAN_NAME.A.toUpperCase(): {
                    this.logger.log('case A')
                    currentPlanNameKey = Object.keys(PLAN_NAME).filter(x => PLAN_NAME[x].toUpperCase() == PLAN_NAME.D.toUpperCase());
                    break;
                }
                case PLAN_NAME.B.toUpperCase(): {
                    this.logger.log('case B')
                    currentPlanNameKey = Object.keys(PLAN_NAME).filter(x => PLAN_NAME[x].toUpperCase() == PLAN_NAME.E.toUpperCase());
                    break;
                }
                case PLAN_NAME.C.toUpperCase(): {
                    this.logger.log('case C')
                    currentPlanNameKey = Object.keys(PLAN_NAME).filter(x => PLAN_NAME[x].toUpperCase() == PLAN_NAME.F.toUpperCase());
                    break;
                }
                default: {
                    currentPlanNameKey = Object.keys(PLAN_NAME).filter(x => PLAN_NAME[x].toUpperCase() == this.project.profile.name.toUpperCase());
                    break;
                }
                    
            }
            
            /** compare enums: current action enum plan >= current prject profile enum name (UPPERCASE)  */
            // if(currentPlanNameKey.length>0){
            //     let actionPlanNameKey: string[] = Object.keys(PLAN_NAME).filter(x => PLAN_NAME[x].toUpperCase() == actionPlanAvailability.toUpperCase());
            //     this.logger.log('check plan availability: currentPlanNameKey VS actionPlanNameKey -->', currentPlanNameKey[0], actionPlanNameKey[0])
            //     // this.logger.log('check plan availability: PLAN currentPlanNameKey VS PLAN actionPlanNameKey -->', PLAN_NAME[currentPlanNameKey[0]]> PLAN_NAME[actionPlanNameKey[0]])
            //     return currentPlanNameKey[0] >= actionPlanNameKey[0] ? true: false; 
            // }
            
            /**check only CUSTOM PLAN */
            this.logger.log('[PROJECT_PROFILE] USECASE: currentPlanNameKey', currentPlanNameKey[0], PLAN_NAME.F)
            if(PLAN_NAME[currentPlanNameKey[0]] === PLAN_NAME.F){
                return this.checkIfIsEnabledInProject(feature)
            }
            
            return false
        }        
        
    }

    public checkIfIsEnabledInProject(featureKey: string): boolean{
        
        this.logger.log('[PROJECT_PROFILE] checkIfIsEnabledInProject -->', featureKey, this.project)
        if (this.project.profile['customization'] === undefined){
            // ------------------------------------------------------------------------ 
            // USECASE: customization obj not exist
            // ------------------------------------------------------------------------
            return false
        } else if(this.project.profile['customization'] && this.project.profile['customization'][featureKey]){
            // ------------------------------------------------------------------------ 
            // USECASE: customization obj exist AND customization.actions obj not exist
            // ------------------------------------------------------------------------
            return true
        } 
        return false
    }

    checkPlanIsExpired(project: Project): boolean {
        let check: boolean = false
    
        //case FREE plan
        if(project && project.trialExpired && project.profile.type=== 'trial'){
          check = true
        }else if(project && !project.trialExpired && project.profile.type=== 'trial'){
          check = false
        }
    
        //case PAYMENT plan
        if(project && project.isActiveSubscription && project.profile.type=== 'payment'){
          check = true
        }else if(project && !project.isActiveSubscription && project.profile.type=== 'payment'){
          check = false
        }
    
        return check
    }

}
