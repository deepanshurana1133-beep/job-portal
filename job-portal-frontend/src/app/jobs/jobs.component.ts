import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getJobs();
  }

  getJobs(): void {
    this.http
      .get<any[]>('http://localhost:3000/jobs')
      .subscribe({
        next: (response) => {
          console.log('Jobs:', response);
          this.jobs = response;
        },
        error: (error) => {
          console.error('Jobs error:', error);
          this.errorMessage =
            'Jobs load nahi ho pa rahe hain';
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