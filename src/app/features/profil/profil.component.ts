import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialDataService } from '../../core/services/social-data.service';
import { ThemeService } from '../../core/services/theme.service';
import { ConfirmModalComponent } from '../../shared/ui/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
})
export class ProfilComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);

  activeTab: string = 'Posts';
  tabs: string[] = ['Posts', 'Media', 'Saved', 'About'];

  isUploadingPhoto = false;
  uploadError = '';
  uploadSuccess = '';

  openMenuPostId: string | null = null;
  editingPostId: string | null = null;
  editingContent: string = '';
  pendingDeletePostId: string | null = null;

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleLike(postId: string): void {
    this.socialService.toggleLike(postId);
  }

  toggleSave(postId: string): void {
    this.socialService.toggleSave(postId);
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
    this.uploadError = '';
    this.uploadSuccess = '';

    this.socialService.uploadProfilePhoto(file).subscribe({
      next: (res) => {
        this.isUploadingPhoto = false;
        this.uploadSuccess = 'Profile photo updated successfully!';
        setTimeout(() => (this.uploadSuccess = ''), 3500);
      },
      error: (err) => {
        this.isUploadingPhoto = false;
        const apiError = err.error?.message || err.error?.errors || err.message;
        this.uploadError = typeof apiError === 'string' ? apiError : 'Failed to upload photo. Please try again.';
      },
    });
  }

  togglePostMenu(postId: string, event: Event): void {
    event.stopPropagation();
    this.openMenuPostId = this.openMenuPostId === postId ? null : postId;
  }

  closePostMenu(): void {
    this.openMenuPostId = null;
  }

  isMyPost(post: any): boolean {
    return this.socialService.isMyPost(post);
  }

  startEditPost(post: any): void {
    this.editingPostId = post.id;
    this.editingContent = post.content;
    this.closePostMenu();
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editingContent = '';
  }

  saveEdit(postId: string): void {
    if (!this.editingContent.trim()) return;
    this.socialService.updatePost(postId, this.editingContent.trim()).subscribe();
    this.editingPostId = null;
  }

  deletePost(postId: string): void {
    this.closePostMenu();
    this.pendingDeletePostId = postId;
  }

  confirmDeletePost(): void {
    if (this.pendingDeletePostId) {
      this.socialService.deletePost(this.pendingDeletePostId).subscribe();
      this.pendingDeletePostId = null;
    }
  }

  cancelDeletePost(): void {
    this.pendingDeletePostId = null;
  }
}


