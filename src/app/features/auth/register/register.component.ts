import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper animate-fade-in">
      <div class="pro-auth-card">
        <div class="pro-card-header">
          <div class="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </div>
          <div>
            <h2 class="pro-title">Create New User</h2>
            <p class="pro-subtitle">Register an Admin, Customer, or Distributor account</p>
          </div>
        </div>
        
        <div class="pro-card-body">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="pro-form-group">
              <label class="pro-label" for="username">Username *</label>
              <input 
                id="username" 
                type="text" 
                class="pro-input" 
                [ngClass]="{'pro-invalid': submitted && f['username'].errors}"
                formControlName="username" 
                placeholder="Enter username"
              />
              @if (submitted && f['username'].errors?.['required']) {
                <div class="pro-error">Username is required</div>
              }
            </div>

            <div class="pro-form-row">
              <div class="pro-form-group half-width">
                <label class="pro-label" for="firstName">First Name</label>
                <input 
                  id="firstName" 
                  type="text" 
                  class="pro-input" 
                  formControlName="firstName" 
                  placeholder="First name"
                />
              </div>
              <div class="pro-form-group half-width">
                <label class="pro-label" for="lastName">Last Name</label>
                <input 
                  id="lastName" 
                  type="text" 
                  class="pro-input" 
                  formControlName="lastName" 
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div class="pro-form-group">
              <label class="pro-label" for="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                class="pro-input" 
                [ngClass]="{'pro-invalid': submitted && f['email'].errors}"
                formControlName="email" 
                placeholder="name@company.com"
              />
              @if (submitted && f['email'].errors?.['email']) {
                <div class="pro-error">Enter a valid email address</div>
              }
            </div>
            
            <div class="pro-form-group">
              <label class="pro-label" for="password">Password *</label>
              <input 
                id="password" 
                type="password" 
                class="pro-input"
                [ngClass]="{'pro-invalid': submitted && f['password'].errors}"
                formControlName="password" 
                placeholder="Enter password"
              />
              @if (submitted && f['password'].errors?.['required']) {
                <div class="pro-error">Password is required</div>
              }
            </div>

            <div class="pro-form-row">
              <div class="pro-form-group half-width">
                <label class="pro-label" for="fromPin">From PIN *</label>
                <input 
                  id="fromPin" 
                  type="number" 
                  class="pro-input" 
                  [ngClass]="{'pro-invalid': submitted && f['fromPin'].errors}"
                  formControlName="fromPin" 
                  placeholder="e.g. 100001"
                />
                @if (submitted && f['fromPin'].errors?.['required']) {
                  <div class="pro-error">From PIN is required</div>
                }
              </div>
              <div class="pro-form-group half-width">
                <label class="pro-label" for="toPin">To PIN *</label>
                <input 
                  id="toPin" 
                  type="number" 
                  class="pro-input" 
                  [ngClass]="{'pro-invalid': submitted && f['toPin'].errors}"
                  formControlName="toPin" 
                  placeholder="e.g. 100099"
                />
                @if (submitted && f['toPin'].errors?.['required']) {
                  <div class="pro-error">To PIN is required</div>
                }
              </div>
            </div>

            <div class="pro-form-group">
              <label class="pro-label">Select User Role *</label>
              <div class="pro-radio-group">
                <label class="pro-radio-card" [class.selected]="registerForm.get('role')?.value === 'Admin'">
                  <input type="radio" formControlName="role" value="Admin" class="sr-only">
                  <div class="role-icon">⚡</div>
                  <span class="pro-role-title">Admin</span>
                </label>
                
                <label class="pro-radio-card" [class.selected]="registerForm.get('role')?.value === 'Customer'">
                  <input type="radio" formControlName="role" value="Customer" class="sr-only">
                  <div class="role-icon">👤</div>
                  <span class="pro-role-title">Customer</span>
                </label>
                
                <label class="pro-radio-card" [class.selected]="registerForm.get('role')?.value === 'Distributor'">
                  <input type="radio" formControlName="role" value="Distributor" class="sr-only">
                  <div class="role-icon">🏢</div>
                  <span class="pro-role-title">Distributor</span>
                </label>
              </div>
              @if (submitted && f['role'].errors?.['required']) {
                <div class="pro-error">Please select a role.</div>
              }
            </div>
            
            <button type="submit" class="pro-btn-primary" [disabled]="isLoading">
              {{ isLoading ? 'Creating User...' : 'Create Account' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 1.5rem 1rem;
    }

    .pro-auth-card {
      width: 100%;
      max-width: 600px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      padding: 2.25rem;
    }

    .pro-card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }

    .header-icon {
      width: 46px;
      height: 46px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
      flex-shrink: 0;
    }

    .pro-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .pro-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0.2rem 0 0 0;
    }

    .pro-form-group {
      margin-bottom: 1.25rem;
    }

    .pro-form-row {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .pro-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .pro-input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      font-size: 0.9rem;
      color: #0f172a;
      background-color: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.15s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    .pro-input::placeholder {
      color: #94a3b8;
    }

    .pro-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .pro-input.pro-invalid {
      border-color: #ef4444;
    }
    
    .pro-error {
      color: #ef4444;
      font-size: 0.78rem;
      margin-top: 0.35rem;
      font-weight: 500;
    }

    .pro-radio-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .pro-radio-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.875rem 0.5rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      background-color: #ffffff;
      transition: all 0.2s ease;
    }

    .pro-radio-card:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    .pro-radio-card.selected {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.05));
      border-color: #4f46e5;
      color: #4f46e5;
    }

    .role-icon {
      font-size: 1.25rem;
    }

    .pro-role-title {
      font-size: 0.825rem;
      font-weight: 600;
      color: inherit;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    .pro-btn-primary {
      width: 100%;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      font-size: 0.925rem;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1.25rem;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
      font-family: inherit;
    }

    .pro-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
    }

    .pro-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out both;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  registerForm: FormGroup;
  isLoading = false;
  submitted = false;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      fromPin: [null, Validators.required],
      toPin: [null, Validators.required]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    // Map single role back to boolean flags
    const formValue = this.registerForm.value;
    const apiPayload = {
      ...formValue,
      isAdmin: formValue.role === 'Admin',
      isCustomer: formValue.role === 'Customer',
      isDistributor: formValue.role === 'Distributor'
    };
    
    this.authService.register(apiPayload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if(res.status === 200 || res.message === 'success') {
          this.toast.success('Success', 'User created successfully.');
          this.router.navigate(['/dashboard']);
        } else {
          this.toast.error('Registration Failed', res.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error('Registration Failed', err.message);
      }
    });
  }
}
