export const USER_ROLES = ['job_seeker', 'recruiter'] as const;
export type UserRole = (typeof USER_ROLES)[number];
