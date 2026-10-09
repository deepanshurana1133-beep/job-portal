import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
  console.log('Login successful:', response);
localStorage.setItem(
  'userRole',
  response.user.role
);
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
          console.error('Login error:', error);
          this.errorMessage =
            error.error?.message || 'Invalid email or password';
        }
      });
  }
  goToRegister(): void {
  this.router.navigate(['/register']);
}
}
