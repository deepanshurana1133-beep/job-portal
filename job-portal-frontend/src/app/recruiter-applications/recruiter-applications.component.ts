import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recruiter-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-applications.component.html',
  styleUrl: './recruiter-applications.component.css'
})
export class RecruiterApplicationsComponent implements OnInit {

  applications: any[] = [];

  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getApplications();
  }

  getApplications(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login as a recruiter first.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<any[]>(
        'http://localhost:3000/applications/recruiter',
        { headers }
      )
      .subscribe({
        next: (response) => {
          console.log('Recruiter Applications:', response);

          this.applications = response;
          this.loading = false;
        },

        error: (error) => {
          console.error('Applications error:', error);

          this.errorMessage =
            error.error?.message ||
            'Applications load nahi ho pa rahi hain.';

          this.loading = false;
        }
      });
  }

  updateStatus(
    applicationId: string,
    status: 'Accepted' | 'Rejected'
  ): void {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first.';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {
      status: status
    };

    this.http
      .patch(
        `http://localhost:3000/applications/${applicationId}/status`,
        body,
        { headers }
      )
      .subscribe({
        next: () => {

          this.successMessage =
            `Application ${status.toLowerCase()} successfully.`;

          this.getApplications();
        },

        error: (error) => {

          console.error('Status update error:', error);

          this.errorMessage =
            error.error?.message ||
            'Application status update nahi ho paaya.';
        }
      });
  }

  viewResume(applicationId: string): void {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first.';
      return;
    }

    const url =
      `http://localhost:3000/applications/${applicationId}/resume`;

    /*
     * Resume endpoint protected hai, isliye token ke saath
     * request bhej kar PDF browser me open karenge.
     */

    this.http
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      })
      .subscribe({
        next: (blob) => {

          const fileURL = URL.createObjectURL(blob);

          window.open(fileURL, '_blank');
        },

        error: (error) => {

          console.error('Resume error:', error);

          this.errorMessage =
            'Resume open nahi ho pa raha hai.';
        }
      });
  }

  backToDashboard(): void {
    this.router.navigate(['/recruiter-dashboard']);
  }
}
