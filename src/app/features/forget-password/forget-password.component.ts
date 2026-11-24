import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'Email address is required.';
    if (field.errors['email']) return 'Please enter a valid email address.';
    return 'Invalid input.';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;
    const email = this.forgotForm.value.email.trim();

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage =
          res?.message || 'If an account exists for that email, a reset link has been sent.';
      },
      error: (err) => {
        this.isSubmitting = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.errorMessage =
          typeof apiError === 'string'
            ? apiError
            : 'Unable to send reset instructions. Please try again.';
      },
    });
  }
}
