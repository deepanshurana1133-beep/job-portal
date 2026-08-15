import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css'
})
export class CreateJobComponent {

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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createJob() {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
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

    this.http.post(
      'http://localhost:3000/jobs',
      jobData,
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('Job created successfully:', response);

        this.message = 'Job created successfully!';
        this.errorMessage = '';

        this.job = {
          title: '',
          company: '',
          location: '',
          description: '',
          salary: '',
          jobType: '',
          skills: ''
        };
      },

      error: (error) => {
        console.error('Create Job error:', error);
        this.errorMessage = 'Job create nahi ho pa rahi hai';
        this.message = '';
      }
    });
  }

}
