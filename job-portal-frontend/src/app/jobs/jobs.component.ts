import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit {

  jobs: any[] = [];
  errorMessage = '';
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getJobs();
  }

  getJobs(): void {
    this.http
      .get<any[]>(`${environment.apiUrl}/jobs`)
      .subscribe({
        next: (response) => {
          this.jobs = response;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = apiErrorMessage(error, 'Unable to load jobs.');
          this.loading = false;
        }
      });
  }

  viewJob(jobId: string): void {
    this.router.navigate(['/jobs', jobId]);
  }
  viewMyApplications(): void {
     this.router.navigate(['/my-applications']);
}
}