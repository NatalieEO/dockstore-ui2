/*
 *    Copyright 2017 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { ParamfilesService } from '../../container/paramfiles/paramfiles.service';
import { ga4ghWorkflowIdPrefix } from '../../shared/constants';
import { Files } from '../../shared/files';
import { GA4GHFilesQuery } from '../../shared/ga4gh-files/ga4gh-files.query';
import { GA4GHFilesService } from '../../shared/ga4gh-files/ga4gh-files.service';
import { WebserviceDescriptorType } from '../../shared/models/DescriptorType';
import { WorkflowVersion } from '../../shared/swagger/model/workflowVersion';

@Component({
  selector: 'app-files-workflow',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesWorkflowComponent extends Files implements OnInit, OnChanges {
  @Input() selectedVersion: WorkflowVersion;
  @Input() descriptorType: WebserviceDescriptorType;
  versionsWithParamfiles: Array<any>;
  previousEntryPath: string;
  previousVersionName: string;
  constructor(private paramfilesService: ParamfilesService, private gA4GHFilesService: GA4GHFilesService,
    private gA4GHFilesQuery: GA4GHFilesQuery) {
    super();
  }

  ngOnInit() {
    this.versionsWithParamfiles = this.paramfilesService.getVersions(this.versions);
  }
  ngOnChanges() {
    // Change detection is messed up because of permissions changing
    if (this.previousEntryPath !== this.entrypath || this.previousVersionName !== this.selectedVersion.name) {
      // Only getting files for one descriptor type for workflows (subject to change)
      this.gA4GHFilesService.updateFiles(ga4ghWorkflowIdPrefix + this.entrypath, this.selectedVersion.name,
        [this.gA4GHFilesQuery.convertToToolDescriptorTypeEnum(this.descriptorType)]);
      this.previousEntryPath = this.entrypath;
      this.previousVersionName = this.selectedVersion.name;
    }
    this.versionsWithParamfiles = this.paramfilesService.getVersions(this.versions);
  }
}
