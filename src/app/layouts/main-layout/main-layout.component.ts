import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { SocialDataService } from '../../core/services/social-data.service';
import { CreatePostModalComponent } from '../../shared/ui/create-post-modal/create-post-modal.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CreatePostModalComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  themeService = inject(ThemeService);
  socialService = inject(SocialDataService);

  isMobileSidebarOpen = false;

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  openCreatePostModal(): void {
    this.socialService.openCreatePostModal();
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }
}
