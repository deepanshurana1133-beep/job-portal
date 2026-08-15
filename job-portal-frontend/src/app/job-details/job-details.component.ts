import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.css'
})
export class JobDetailsComponent implements OnInit {

  job: any = null;
  selectedFile: File | null = null;

  loading = true;
  applying = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');

    if (!jobId) {
      this.errorMessage = 'Job ID not found';
      this.loading = false;
      return;
    }

    this.getJob(jobId);
  }

  getJob(jobId: string): void {
    this.http
      .get<any>(`http://localhost:3000/jobs/${jobId}`)
      .subscribe({
        next: (response) => {
          console.log('Job details:', response);

          this.job = response;
          this.loading = false;
        },

        error: (error) => {
          console.error('Job details error:', error);

          this.errorMessage =
            'Job details load nahi ho pa rahi hain';

          this.loading = false;
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Only PDF files are allowed';
      this.selectedFile = null;
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;
  }

  applyForJob(): void {
    this.successMessage = '';
    this.errorMessage = '';

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
      return;
    }

    if (!this.job?._id) {
      this.errorMessage = 'Job ID not found';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Please select your resume PDF';
      return;
    }

    this.applying = true;

    const formData = new FormData();

    formData.append('jobId', this.job._id);
    formData.append('resume', this.selectedFile);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .post(
        'http://localhost:3000/applications',
        formData,
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log('Application successful:', response);

          this.successMessage =
            'Application submitted successfully!';

          this.applying = false;
        },

        error: (error) => {
          console.error('Application error:', error);

          this.errorMessage =
            error.error?.message ||
            'Application submit nahi ho pa rahi hai';

          this.applying = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }
}
