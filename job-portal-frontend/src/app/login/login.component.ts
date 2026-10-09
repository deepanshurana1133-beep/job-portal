import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient,
    private router: Router
  ) {}

  login() {
    this.errorMessage = '';

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http
      .post<any>(`${environment.apiUrl}/auth/login`, loginData)
      .subscribe({
        next: (response) => {
        localStorage.removeItem('userRole');
        localStorage.setItem(
    'accessToken',
    response.accessToken
  );
if (response.user.role === 'recruiter') {
  this.router.navigate(['/recruiter-dashboard']);
} else {
  this.router.navigate(['/jobs']);
}
},
error: (error) => {
  this.errorMessage = apiErrorMessage(error, 'Invalid email or password');
        }
      });
  }
  goToRegister(): void {
  this.router.navigate(['/register']);
}
}
