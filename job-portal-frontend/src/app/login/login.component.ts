import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    this.errorMessage = '';

    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http
      .post<any>('http://localhost:3000/auth/login', loginData)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);

          localStorage.setItem(
            'accessToken',
            response.accessToken
          );

          this.router.navigate(['/jobs']);
        },

        error: (error) => {
          console.error('Login error:', error);

          this.errorMessage =
            error.error?.message || 'Invalid email or password';
        }
      });
  }
}
