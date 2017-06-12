import {Component, Input, OnDestroy} from '@angular/core';
import { Router } from '@angular/router';

import { CommunicatorService } from '../shared/communicator.service';
import { DateService } from '../shared/date.service';

import { DockstoreService } from '../shared/dockstore.service';
import { ImageProviderService } from '../shared/image-provider.service';
import { ProviderService } from '../shared/provider.service';

import { Tool } from '../shared/tool';

import { ToolService } from '../shared/tool.service';
import { ContainerService } from './container.service';
import { UserService } from '../loginComponents/user.service';
import { WorkflowObjService } from '../shared/workflow.service';
import { ToolObservableService } from '../shared/tool-observable.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
})
export class ContainerComponent extends Tool implements OnDestroy {
  labels: string[];
  constructor(private dockstoreService: DockstoreService,
              private dateService: DateService,
              private containerService: ContainerService,
              private imageProviderService: ImageProviderService,
              toolService: ToolService,
              communicatorService: CommunicatorService,
              providerService: ProviderService,
              userService: UserService,
              router: Router,
              workflowObjService: WorkflowObjService,
              toolObservableService: ToolObservableService) {
    super(toolService, communicatorService, providerService, userService, router,
      workflowObjService, toolObservableService, 'containers');
  }

  setProperties() {
    let toolRef = this.tool;
    this.labels = this.dockstoreService.getLabelStrings(this.tool.labels);
    toolRef.agoMessage = this.dateService.getAgoMessage(toolRef.lastBuild);
    toolRef.email = this.dockstoreService.stripMailTo(toolRef.email);
    toolRef.buildMode = this.containerService.getBuildMode(toolRef.mode);
    toolRef.lastBuildDate = this.dateService.getDateTimeMessage(toolRef.lastBuild);
    toolRef.lastUpdatedDate = this.dateService.getDateTimeMessage(toolRef.lastUpdated);
    toolRef.buildModeTooltip = this.containerService.getBuildModeTooltip(toolRef.mode);
    toolRef.versionVerified = this.dockstoreService.getVersionVerified(toolRef.tags);
    toolRef.verifiedSources = this.dockstoreService.getVerifiedSources(toolRef);
    toolRef.verifiedLinks = this.dateService.getVerifiedLink();
    if (!toolRef.imgProviderUrl) {
      toolRef = this.imageProviderService.setUpImageProvider(toolRef);
    }
  }
  getValidVersions() {
    console.log('container getValidVersions');
    this.validVersions = this.dockstoreService.getValidVersions(this.tool.tags);
  }

}
