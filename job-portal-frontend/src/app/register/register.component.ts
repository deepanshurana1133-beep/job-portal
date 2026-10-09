import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
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

          console.log('Registration successful:', response);

          this.successMessage =
            'Account created successfully! Redirecting to login...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },

        error: (error) => {

          console.error('Registration error:', error);

          this.errorMessage =
            error.error?.message ||
            'Registration failed. Please try again.';
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}