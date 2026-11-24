import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SocialDataService, Post } from '../../core/services/social-data.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './saved.component.html',
  styleUrl: './saved.component.css',
})
export class SavedComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);

  activeTab: string = 'All';
  tabs: string[] = ['All', 'Posts', 'Media', 'Articles'];
  sortOrder: string = 'Newest first';

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  get savedPosts(): Post[] {
    let posts = this.socialService.posts().filter((p) => p.isSaved);

    if (this.activeTab === 'Posts') {
      posts = posts.filter((p) => !p.image);
    } else if (this.activeTab === 'Media') {
      posts = posts.filter((p) => !!p.image);
    }

    if (this.sortOrder === 'Oldest first') {
      return [...posts].reverse();
    }

    return posts;
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
}

