import { SetMetadata } from '@nestjs/common';

export const IS_ONLY_ADMIN_KEY = 'onlyAdmin';
export const IsOnlyAdmin = () => SetMetadata(IS_ONLY_ADMIN_KEY, true);
