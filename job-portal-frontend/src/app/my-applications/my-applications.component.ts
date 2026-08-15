import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css'
})
export class MyApplicationsComponent implements OnInit {

  applications: any[] = [];
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getMyApplications();
  }

  getMyApplications() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.errorMessage = 'Please login first';
      return;
    }

    this.http.get<any[]>(
      'http://localhost:3000/applications/my',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: (response) => {
        console.log('My Applications:', response);
        this.applications = response;
      },
      error: (error) => {
        console.error('My Applications error:', error);
        this.errorMessage =
          error.error?.message || 'Applications load nahi ho pa rahi hain';
      }
    });
  }
}
