export interface AccessTokenClaims {
  role?: 'job_seeker' | 'recruiter';
  exp?: number;
}

export function getAccessTokenClaims(): AccessTokenClaims | null {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) {
      return null;
    }

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as AccessTokenClaims;
    if (
      typeof payload.exp !== 'number' ||
      payload.exp <= Date.now() / 1000 ||
      !['job_seeker', 'recruiter'].includes(payload.role ?? '')
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
