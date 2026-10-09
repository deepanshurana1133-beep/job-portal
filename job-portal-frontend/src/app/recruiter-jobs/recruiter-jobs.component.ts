import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

@Component({
  selector: 'app-recruiter-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-jobs.component.html',
  styleUrl: './recruiter-jobs.component.css'
})
export class RecruiterJobsComponent implements OnInit {

  jobs: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getJobs();
  }

  getJobs(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<any[]>(`${environment.apiUrl}/jobs/recruiter`, { headers })
      .subscribe({
        next: (response) => {
          this.jobs = response;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = apiErrorMessage(error, 'Unable to load your jobs.');
          this.loading = false;
        }
      });
  }

  createJob(): void {
    this.router.navigate(['/create-job']);
  }

  editJob(jobId: string): void {
    this.router.navigate(['/update-job', jobId]);
  }

  backToDashboard(): void {
    this.router.navigate(['/recruiter-dashboard']);
  }

  deleteJob(jobId: string): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first.';
      return;
    }

    const confirmDelete = confirm(
      'Are you sure you want to delete this job?'
    );

    if (!confirmDelete) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .delete(`${environment.apiUrl}/jobs/${jobId}`, { headers })
      .subscribe({
        next: () => {
          alert('Job deleted successfully!');
          this.getJobs();
        },
        error: (error) => {
          this.errorMessage = apiErrorMessage(error, 'Unable to delete the job.');
        }
      });
  }
}
