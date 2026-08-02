import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card animate-fade-in hover-lift">
        <div class="auth-header">
          <div class="logo-wrapper">
            <img src="assets/logo.png" alt="Shri Govind Enterprises Logo" class="brand-logo-img" />
          </div>
          <h2 class="company-title">Shri Govind Enterprises</h2>
          <div class="company-address">
            <span>F-B1 NANDADEEP APARTMENT</span>
            <span>12 NATHMANDIR COLONY SOUTH, TUKOGANJ</span>
            <span>INDORE 452001</span>
          </div>
          <p class="signin-subtitle">Sign in to your account</p>
        </div>

        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input 
              id="username" 
              type="text" 
              class="form-control" 
              [ngClass]="{'is-invalid': submitted && f['username'].errors}"
              formControlName="username" 
              placeholder="Enter your username"
            />
            @if (submitted && f['username'].errors) {
              <div class="error-message">Username is required</div>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              id="password" 
              type="password" 
              class="form-control"
              [ngClass]="{'is-invalid': submitted && f['password'].errors}"
              formControlName="password" 
              placeholder="Enter your password"
            />
            @if (submitted && f['password'].errors) {
              <div class="error-message">Password is required</div>
            }
          </div>
          
          <button type="submit" class="btn btn-primary w-100 mt-2" [disabled]="isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
        

      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--bg-color);
      padding: 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--surface-color);
      border-radius: var(--border-radius-lg);
      padding: 2.5rem 2rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(10px);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .logo-wrapper {
      margin-bottom: 0.75rem;
    }

    .brand-logo-img {
      width: 76px;
      height: 76px;
      object-fit: contain;
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .company-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
      letter-spacing: -0.01em;
    }

    .company-address {
      display: flex;
      flex-direction: column;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-secondary);
      line-height: 1.35;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }

    .signin-subtitle {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary, #4f46e5);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loginForm: FormGroup;
  isLoading = false;
  submitted = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 200 || res.message === 'success') {
          this.toast.success('Success', 'Logged in successfully');
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.toast.error('Login Failed', res.message || 'Invalid user or password');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error('Login Failed', err.message);
      }
    });
  }
}
