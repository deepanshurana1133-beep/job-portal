import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-recruiter-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recruiter-jobs.component.html',
  styleUrl: './recruiter-jobs.component.css'
})
export class RecruiterJobsComponent implements OnInit {

  jobs: any[] = [];
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRecruiterJobs();
  }

  getRecruiterJobs() {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(
      'http://localhost:3000/jobs/recruiter',
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('Recruiter Jobs:', response);
        this.jobs = response;
      },

      error: (error) => {
        console.error('Recruiter Jobs error:', error);
        this.errorMessage = 'Jobs load nahi ho pa rahi hain';
      }
    });
  }
  deleteJob(jobId: string) {

  const confirmDelete = confirm(
    'Are you sure you want to delete this job?'
  );

  if (!confirmDelete) {
    return;
  }

  const token = localStorage.getItem('accessToken');

  if (!token) {
    this.errorMessage = 'Please login first';
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.delete(
    `http://localhost:3000/jobs/${jobId}`,
    { headers }
  ).subscribe({
    next: () => {

      console.log('Job deleted successfully');

      this.jobs = this.jobs.filter(
        job => job._id !== jobId
      );
    },

    error: (error) => {

      console.error('Delete Job error:', error);

      this.errorMessage =
        'Job delete nahi ho pa rahi hai';
    }
  });
}
}
