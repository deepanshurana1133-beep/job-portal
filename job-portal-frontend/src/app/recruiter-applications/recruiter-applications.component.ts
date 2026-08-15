import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-recruiter-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-applications.component.html',
  styleUrl: './recruiter-applications.component.css'
})
export class RecruiterApplicationsComponent implements OnInit {

  applications: any[] = [];
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRecruiterApplications();
  }

  getRecruiterApplications() {

    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(
      'http://localhost:3000/applications/recruiter',
      { headers }
    ).subscribe({
      next: (response) => {

        console.log('Recruiter Applications:', response);

        this.applications = response;
      },

      error: (error) => {

        console.error(
          'Recruiter Applications error:',
          error
        );

        this.errorMessage =
          'Applications load nahi ho pa rahi hain';
      }
    });
  }
updateStatus(
  applicationId: string,
  status: 'Accepted' | 'Rejected'
) {

  const token = localStorage.getItem('accessToken');

  if (!token) {
    this.errorMessage = 'Please login first';
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.patch(
    `http://localhost:3000/applications/${applicationId}/status`,
    { status },
    { headers }
  ).subscribe({
    next: (response: any) => {

      console.log('Application status updated:', response);

      const application = this.applications.find(
        app => app._id === applicationId
      );

      if (application) {
        application.status = status;
      }
    },

    error: (error) => {

      console.error(
        'Update application status error:',
        error
      );

      this.errorMessage =
        'Application status update nahi ho pa raha hai';
    }
  });
}
viewResume(applicationId: string) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    this.errorMessage = 'Please login first';
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.get(
    `http://localhost:3000/applications/${applicationId}/resume`,
    {
      headers,
      responseType: 'blob'
    }
  ).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    },

    error: (error) => {
      console.error('Resume view error:', error);

      this.errorMessage =
        'Resume open nahi ho pa rahi hai';
    }
  });
}
}
