import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css'
})
export class CreateJobComponent {

  title = '';
  company = '';
  location = '';
  salary = '';
  jobType = '';
  skills = '';
  description = '';

  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createJob() {
    this.successMessage = '';
    this.errorMessage = '';

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login as a recruiter first.';
      return;
    }

    if (
      !this.title ||
      !this.company ||
      !this.location ||
      !this.salary ||
      !this.jobType ||
      !this.skills ||
      !this.description
    ) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    const jobData = {
      title: this.title,
      company: this.company,
      location: this.location,
      description: this.description,
      salary: this.salary,
      jobType: this.jobType,

      // Backend ko string[] chahiye
      skills: this.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.loading = true;

    this.http
      .post(
        `${environment.apiUrl}/jobs`,
        jobData,
        { headers }
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Job created successfully!';

          // Form clear
          this.title = '';
          this.company = '';
          this.location = '';
          this.salary = '';
          this.jobType = '';
          this.skills = '';
          this.description = '';
        },

        error: (error) => {
          this.loading = false;

          this.errorMessage = apiErrorMessage(error, 'Unable to create the job.');
        }
      });
  }

  cancel() {
    this.router.navigate(['/recruiter-dashboard']);
  }
}