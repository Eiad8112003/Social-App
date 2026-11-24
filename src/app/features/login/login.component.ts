import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  showPassword = false;
  isSubmitting = false;
  errorMessage = '';

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return fieldName === 'emailOrUsername'
        ? 'Email or Username is required.'
        : 'Password is required.';
    }

    if (field.errors['minlength']) {
      return `Password must be at least ${field.errors['minlength'].requiredLength} characters.`;
    }

    return 'Invalid input.';
  }

  clearError(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onSocialLogin(provider: string): void {
    this.errorMessage = `${provider} login is not configured yet. Please sign in with your email or username.`;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please enter valid credentials in all required fields.';
      return;
    }

    this.isSubmitting = true;
    const { emailOrUsername, password } = this.loginForm.value;

    this.authService.signin({ login: emailOrUsername.trim(), password }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success || res.message === 'signed in successfully' || res.data?.token) {
          this.router.navigate(['/main/feed']);
        } else {
          this.errorMessage = res.message || 'Invalid email/username or password.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.errorMessage = typeof apiError === 'string' ? apiError : 'Invalid email/username or password. Please try again.';
      },
    });
  }
}

