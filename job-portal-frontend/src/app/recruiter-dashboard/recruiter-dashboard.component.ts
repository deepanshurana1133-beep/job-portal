import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrl: './recruiter-dashboard.component.css'
})
export class RecruiterDashboardComponent {

  constructor(private router: Router) {}

  createJob() {
    this.router.navigate(['/create-job']);
  }

  viewJobs() {
    this.router.navigate(['/recruiter-jobs']);
  }

  viewApplications() {
    this.router.navigate(['/recruiter-applications']);
  }

  logout() {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login']);
  }
}