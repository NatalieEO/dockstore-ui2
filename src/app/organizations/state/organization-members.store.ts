import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';

import { OrganisationUser } from '../../shared/swagger';

export interface OrganizationMembersState extends EntityState<OrganisationUser> {}

/**
 * idKey is set to id.userId even though it doesn't quite exactly work.
 * Otherwise, Akita will default to Id (which is an Object in the case of OrganisationUser)
 * and will have troubles since it's not a number
 *
 * @export
 * @class OrganizationMembersStore
 * @extends {EntityStore<OrganizationMembersState, OrganisationUser>}
 */
@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'organization-members', idKey: 'id.userId' })
export class OrganizationMembersStore extends EntityStore<OrganizationMembersState, OrganisationUser> {

  constructor() {
    super();
  }

}
