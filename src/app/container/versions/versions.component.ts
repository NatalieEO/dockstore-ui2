import {Component, Input, OnChanges} from '@angular/core';

import { DateService } from '../../shared/date.service';

import { Versions } from '../../shared/versions';
import { DockstoreService } from '../../shared/dockstore.service';

@Component({
  selector: 'app-versions-container',
  templateUrl: './versions.component.html',
  styleUrls: [ './versions.component.css' ]
})
export class VersionsContainerComponent extends Versions {
  verifiedLink: string;
  @Input() versions: Array<any>;
  @Input() verifiedSource: Array<any>;

  setNoOrderCols(): Array<number> {
    console.log(this.verifiedSource);
    return [ 5, 6 ];
  }
  constructor(dockstoreService: DockstoreService,
              dateService: DateService) {
    super(dockstoreService, dateService);
    this.verifiedLink = dateService.getVerifiedLink();
  }

  getVerifiedSource(name: string) {
    for (const source of this.verifiedSource) {
      if (source.version === name) {
        return source.verifiedSource;
      }

    }
    return '';
  }
}
