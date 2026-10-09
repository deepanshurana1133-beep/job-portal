import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from '../api-error-message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    const registerData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: 'job_seeker'
    };

    this.http
      .post<any>(
        `${environment.apiUrl}/user/register`,
        registerData
      )
      .subscribe({
        next: (response) => {

          this.successMessage =
            'Account created successfully! Redirecting to login...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },

        error: (error) => {
          this.errorMessage = apiErrorMessage(
            error,
            'Registration failed. Please try again.',
          );
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}