import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getAccessTokenClaims } from './auth-token';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  if (getAccessTokenClaims()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};