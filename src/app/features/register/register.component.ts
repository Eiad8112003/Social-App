import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  private passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  registerForm: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['Male', [Validators.required]],
      dateOfBirth: ['1997-05-12', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [true, [Validators.requiredTrue]],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const confirmPass = g.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['mismatch'] && (field?.touched || field?.dirty)) {
      return true;
    }
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['mismatch'] && (field?.touched || field?.dirty)) {
      return 'Passwords do not match.';
    }

    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required.';
    if (field.errors['email']) return 'Please enter a valid email address.';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters.`;
    if (field.errors['pattern']) return 'Password must be at least 8 characters with uppercase, lowercase, number, and special char (e.g. Password123!).';

    return 'Invalid field.';
  }

  clearError() {
    if (this.errorMessage) this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    const val = this.registerForm.value;

    const payload = {
      name: val.fullName.trim(),
      username: val.username.trim(),
      email: val.email.trim(),
      dateOfBirth: val.dateOfBirth,
      gender: val.gender.toLowerCase() === 'female' ? 'female' : 'male',
      password: val.password,
      rePassword: val.confirmPassword,
    };

    this.authService.signup(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success || res.message === 'account created') {
          this.successMessage = 'Account created successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1200);
        } else {
          this.errorMessage = res.message || 'Failed to create account.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.errorMessage = typeof apiError === 'string' ? apiError : 'Registration failed. Please check your details and try again.';
      },
    });
  }
}


