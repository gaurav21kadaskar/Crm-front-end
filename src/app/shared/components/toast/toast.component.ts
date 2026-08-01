import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast-' + toast.type">
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .toast {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      min-width: 300px;
      max-width: 400px;
      padding: 1rem;
      background: var(--surface);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      border-left: 4px solid var(--primary-color);
      animation: slideIn 0.3s ease-out forwards;
    }

    .toast-success { border-left-color: var(--success); }
    .toast-error { border-left-color: var(--danger); }
    .toast-info { border-left-color: var(--info); }
    .toast-warning { border-left-color: var(--warning); }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .toast-message {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0 0 0 1rem;
      line-height: 1;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
