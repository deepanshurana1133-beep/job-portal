import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

@Component({
  selector: 'app-update-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-job.component.html',
  styleUrl: './update-job.component.css'
})
export class UpdateJobComponent implements OnInit {

  jobId = '';

  job = {
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    jobType: '',
    skills: ''
  };

  message = '';
  errorMessage = '';
  loading = true;
  saving = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {

    this.jobId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.jobId) {
      this.errorMessage = 'Job ID not found';
      this.loading = false;
      return;
    }

    this.getJob();
  }

  getJob() {

    this.http.get<any>(
      `${environment.apiUrl}/jobs/${this.jobId}`
    ).subscribe({
      next: (response) => {

        this.job = {
          title: response.title || '',
          company: response.company || '',
          location: response.location || '',
          description: response.description || '',
          salary: response.salary || '',
          jobType: response.jobType || '',
          skills: Array.isArray(response.skills)
            ? response.skills.join(', ')
            : ''
        };
        this.loading = false;
      },

      error: (error) => {
        this.loading = false;
        this.errorMessage = apiErrorMessage(error, 'Unable to load the job.');
      }
    });
  }

  updateJob() {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
      return;
    }
    if (this.saving) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const jobData = {
      title: this.job.title,
      company: this.job.company,
      location: this.job.location,
      description: this.job.description,
      salary: this.job.salary,
      jobType: this.job.jobType,
      skills: this.job.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '')
    };

    this.saving = true;
    this.http.patch(
      `${environment.apiUrl}/jobs/${this.jobId}`,
      jobData,
      { headers }
    ).subscribe({
      next: (response) => {

        this.message = 'Job updated successfully!';
        this.errorMessage = '';
        this.saving = false;
      },

      error: (error) => {

        this.errorMessage = apiErrorMessage(error, 'Unable to update the job.');
        this.message = '';
        this.saving = false;
      }
    });
  }

  backToJobs(): void {
    this.router.navigate(['/recruiter-jobs']);
  }

}
