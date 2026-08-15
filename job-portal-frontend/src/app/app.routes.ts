import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { JobsComponent } from './jobs/jobs.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { RecruiterDashboardComponent } from './recruiter-dashboard/recruiter-dashboard.component';
import { RecruiterJobsComponent } from './recruiter-jobs/recruiter-jobs.component';
import { CreateJobComponent } from './create-job/create-job.component';
import { UpdateJobComponent } from './update-job/update-job.component';
import { RecruiterApplicationsComponent } from './recruiter-applications/recruiter-applications.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
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
  component: MyApplicationsComponent
},
{
  path: 'jobs/:id',
  component: JobDetailsComponent
},
{
  path: 'recruiter-dashboard',
  component: RecruiterDashboardComponent
},
{
  path: 'recruiter-jobs',
  component: RecruiterJobsComponent
},
{
  path: 'create-job',
  component: CreateJobComponent
},
{
  path: 'update-job/:id',
  component: UpdateJobComponent
},
{
  path: 'recruiter-applications',
  component: RecruiterApplicationsComponent
}
];
