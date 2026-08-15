import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent implements OnInit {

  jobs: any[] = [];
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getJobs();
  }

  getJobs() {
    this.http
      .get<any[]>('http://localhost:3000/jobs')
      .subscribe({
        next: (response) => {
          console.log('Jobs:', response);
          this.jobs = response;
        },
        error: (error) => {
          console.error('Jobs error:', error);
          this.errorMessage = 'Jobs load nahi ho pa rahe hain';
        }
      });
  }
  applyForJob(jobId: string) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    alert('Please login first');
    return;
  }

  const applicationData = {
    jobId: jobId,
    resume: 'resume.pdf'
  };

  this.http.post(
    'http://localhost:3000/applications',
    applicationData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).subscribe({
    next: (response) => {
      console.log('Application successful:', response);
      alert('Application submitted successfully!');
    },
    error: (error) => {
      console.error('Application error:', error);
      alert(
        error.error?.message || 'Application submit nahi ho paayi'
      );
    }
  });
}
}
