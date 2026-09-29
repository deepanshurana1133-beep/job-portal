import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const recruiterGuard: CanActivateFn = () => {

  const router = inject(Router);

  const role = localStorage.getItem('userRole');

  if (role === 'recruiter') {
    return true;
  }

  router.navigate(['/jobs']);
  return false;
};