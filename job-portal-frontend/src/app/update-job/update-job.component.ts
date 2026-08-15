import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {

    this.jobId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.jobId) {
      this.errorMessage = 'Job ID not found';
      return;
    }

    this.getJob();
  }

  getJob() {

    this.http.get<any>(
      `http://localhost:3000/jobs/${this.jobId}`
    ).subscribe({
      next: (response) => {

        console.log('Job Details:', response);

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
      },

      error: (error) => {
        console.error('Get Job error:', error);
        this.errorMessage = 'Job load nahi ho pa rahi hai';
      }
    });
  }

  updateJob() {

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

    this.http.patch(
      `http://localhost:3000/jobs/${this.jobId}`,
      jobData,
      { headers }
    ).subscribe({
      next: (response) => {

        console.log('Job updated successfully:', response);

        this.message = 'Job updated successfully!';
        this.errorMessage = '';
      },

      error: (error) => {

        console.error('Update Job error:', error);

        this.errorMessage = 'Job update nahi ho pa rahi hai';
        this.message = '';
      }
    });
  }

}
