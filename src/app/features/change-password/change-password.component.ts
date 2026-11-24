import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);

  private passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      confirmNewPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('newPassword')?.value;
    const confirmPass = g.get('confirmNewPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    if (
      fieldName === 'confirmNewPassword' &&
      this.passwordForm.errors?.['mismatch'] &&
      (field?.touched || field?.dirty)
    ) {
      return true;
    }
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (
      fieldName === 'confirmNewPassword' &&
      this.passwordForm.errors?.['mismatch'] &&
      (field?.touched || field?.dirty)
    ) {
      return 'Passwords do not match.';
    }
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'This field is required.';
    if (field.errors['pattern']) {
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special char.';
    }
    return 'Invalid input.';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success || res.message === 'success' || res.token) {
          this.successMessage = 'Password updated successfully!';
          this.passwordForm.reset();
        } else {
          this.errorMessage = res.message || 'Failed to update password.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.errorMessage =
          typeof apiError === 'string'
            ? apiError
            : 'Failed to change password. Please verify your current password.';
      },
    });
  }
}
