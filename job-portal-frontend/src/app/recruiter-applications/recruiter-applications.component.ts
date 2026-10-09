import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

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
  updatingApplicationId: string | null = null;

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
        `${environment.apiUrl}/applications/recruiter`,
        { headers }
      )
      .subscribe({
        next: (response) => {
          this.applications = response;
          this.loading = false;
        },

        error: (error) => {
          this.errorMessage = apiErrorMessage(
            error,
            'Unable to load applications.',
          );

          this.loading = false;
        }
      });
  }

  updateStatus(
    applicationId: string,
    status: 'Accepted' | 'Rejected'
  ): void {

    this.errorMessage = '';
    this.successMessage = '';

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first.';
      return;
    }
    if (this.updatingApplicationId) {
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {
      status: status
    };

    this.updatingApplicationId = applicationId;

    this.http
      .patch<{ emailSent: boolean }>(
        `${environment.apiUrl}/applications/${applicationId}/status`,
        body,
        { headers }
      )
      .subscribe({
        next: (response) => {

          this.successMessage = response.emailSent
            ? `Application ${status.toLowerCase()} successfully, and the applicant was notified by email.`
            : `Application ${status.toLowerCase()} successfully, but the applicant notification email could not be sent.`;

          this.updatingApplicationId = null;
          this.getApplications();
        },

        error: (error) => {
          this.errorMessage = apiErrorMessage(
            error,
            'Unable to update the application status.',
          );
          this.updatingApplicationId = null;
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
      `${environment.apiUrl}/applications/${applicationId}/resume`;

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
          this.errorMessage =
            'Resume open nahi ho pa raha hai.';
        }
      });
  }

  backToDashboard(): void {
    this.router.navigate(['/recruiter-dashboard']);
  }
}
