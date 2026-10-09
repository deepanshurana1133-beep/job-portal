import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css'
})
export class MyApplicationsComponent implements OnInit {

  applications: any[] = [];
  errorMessage = '';
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getMyApplications();
  }

  getMyApplications() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
      this.loading = false;
      return;
    }

    this.http.get<any[]>(
      `${environment.apiUrl}/applications/my`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: (response) => {
        this.applications = response;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = apiErrorMessage(
          error,
          'Unable to load your applications.',
        );
        this.loading = false;
      }
    });
  }
}
