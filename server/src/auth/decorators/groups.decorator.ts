// src/auth/decorators/group-ids.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const GROUPS_ANY_KEY = 'groups:any';
export const GROUPS_ALL_KEY = 'groups:all';

export const RequireGroupIdsAny = (...groupIds: number[]) =>
  SetMetadata(GROUPS_ANY_KEY, groupIds);

export const RequireGroupIdsAll = (...groupIds: number[]) =>
  SetMetadata(GROUPS_ALL_KEY, groupIds);
