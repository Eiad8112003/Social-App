import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialDataService } from '../../../core/services/social-data.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-create-post-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post-modal.component.html',
  styleUrl: './create-post-modal.component.css',
})
export class CreatePostModalComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);

  postContent: string = '';
  selectedImage: string | undefined = undefined;
  visibility: string = 'Public';

  closeModal(): void {
    this.socialService.closeCreatePostModal();
  }

  submitPost(): void {
    if (!this.postContent.trim() && !this.selectedImage) return;
    this.socialService.addNewPost(this.postContent, this.selectedImage);
    this.postContent = '';
    this.selectedImage = undefined;
  }

  attachSampleImage(): void {
    if (this.selectedImage) {
      this.selectedImage = undefined;
    } else {
      this.selectedImage = 'assets/post_mountain.png';
    }
  }
}
