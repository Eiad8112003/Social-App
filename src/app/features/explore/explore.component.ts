import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialDataService } from '../../core/services/social-data.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css',
})
export class ExploreComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);

  activeTab: string = 'For you';
  tabs: string[] = ['For you', 'Trending', 'People', 'Communities', 'Posts', 'Articles'];

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleFollow(creatorId: string): void {
    this.socialService.toggleFollow(creatorId);
  }

  toggleJoin(communityName: string): void {
    this.socialService.toggleJoinCommunity(communityName);
  }
}
