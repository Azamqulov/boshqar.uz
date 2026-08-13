import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
