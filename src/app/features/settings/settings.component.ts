import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocialDataService } from '../../core/services/social-data.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'account' | 'security' | 'appearance' | 'notifications' = 'account';

  // Password Change Form
  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
        ],
      ],
      confirmNewPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  isSubmittingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  // Profile Edit State
  isUploadingPhoto = false;
  photoError = '';
  photoSuccess = '';

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('newPassword')?.value;
    const confirmPass = g.get('confirmNewPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  setTab(tab: 'account' | 'security' | 'appearance' | 'notifications'): void {
    this.activeTab = tab;
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File): void {
    this.isUploadingPhoto = true;
    this.photoError = '';
    this.photoSuccess = '';

    this.socialService.uploadProfilePhoto(file).subscribe({
      next: () => {
        this.isUploadingPhoto = false;
        this.photoSuccess = 'Profile photo updated successfully!';
        setTimeout(() => (this.photoSuccess = ''), 3500);
      },
      error: (err) => {
        this.isUploadingPhoto = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.photoError = typeof apiError === 'string' ? apiError : 'Failed to upload photo.';
      },
    });
  }

  onChangePasswordSubmit(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.passwordError = 'Please fill out all required password fields correctly.';
      return;
    }

    this.isSubmittingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isSubmittingPassword = false;
        if (res.success || res.message === 'success' || res.token) {
          this.passwordSuccess = 'Password updated successfully!';
          this.passwordForm.reset();
        } else {
          this.passwordError = res.message || 'Failed to update password.';
        }
      },
      error: (err) => {
        this.isSubmittingPassword = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.passwordError = typeof apiError === 'string' ? apiError : 'Failed to change password. Please verify current password.';
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
