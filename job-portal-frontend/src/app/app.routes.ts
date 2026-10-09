import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { JobsComponent } from './jobs/jobs.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { RecruiterDashboardComponent } from './recruiter-dashboard/recruiter-dashboard.component';
import { CreateJobComponent } from './create-job/create-job.component';
import { RecruiterJobsComponent } from './recruiter-jobs/recruiter-jobs.component';
import { RecruiterApplicationsComponent } from './recruiter-applications/recruiter-applications.component';
import { authGuard } from './auth.guard';
import { recruiterGuard } from './role.guard';
import { WelcomeComponent } from './welcome/welcome.component';
import { RegisterComponent } from './register/register.component';
import { UpdateJobComponent } from './update-job/update-job.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
  path: 'welcome',
  component: WelcomeComponent
},
{
  path: 'register',
  component: RegisterComponent
},
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'jobs',
    component: JobsComponent
  },
  {
  path: 'my-applications',
  component: MyApplicationsComponent,
  canActivate: [authGuard]
},
{
  path: 'recruiter-dashboard',
  component: RecruiterDashboardComponent,
  canActivate: [authGuard, recruiterGuard]
},
{
  path: 'create-job',
  component: CreateJobComponent,
  canActivate: [authGuard, recruiterGuard]
},
{
  path: 'update-job/:id',
  component: UpdateJobComponent,
  canActivate: [authGuard, recruiterGuard]
},
{
  path: 'recruiter-jobs',
  component: RecruiterJobsComponent,
  canActivate: [authGuard, recruiterGuard]
},
{
  path: 'recruiter-applications',
  component: RecruiterApplicationsComponent,
  canActivate: [authGuard, recruiterGuard]
},
{
  path: 'jobs/:id',
  component: JobDetailsComponent
},
{
  path: '**',
  redirectTo: 'welcome'
}
];
