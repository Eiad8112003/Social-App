import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SocialDataService } from '../../core/services/social-data.service';
import { ThemeService } from '../../core/services/theme.service';
import { ConfirmModalComponent } from '../../shared/ui/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);

  openMenuPostId: string | null = null;
  editingPostId: string | null = null;
  editingContent: string = '';
  pendingDeletePostId: string | null = null;

  openComposer(): void {
    this.socialService.openCreatePostModal();
  }

  toggleLike(postId: string): void {
    this.socialService.toggleLike(postId);
  }

  toggleSave(postId: string): void {
    this.socialService.toggleSave(postId);
  }

  toggleFollow(creatorId: string): void {
    this.socialService.toggleFollow(creatorId);
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

