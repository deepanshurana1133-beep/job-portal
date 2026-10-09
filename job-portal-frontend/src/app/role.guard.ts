import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getAccessTokenClaims } from './auth-token';

export const recruiterGuard: CanActivateFn = () => {

  const router = inject(Router);

  const role = getAccessTokenClaims()?.role;

  if (role === 'recruiter') {
    return true;
  }

  return router.createUrlTree(['/jobs']);
};