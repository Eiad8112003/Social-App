import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialDataService } from '../../core/services/social-data.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  socialService = inject(SocialDataService);
  themeService = inject(ThemeService);

  activeFilter: string = 'All';

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  markAllAsRead(): void {
    this.socialService.notifications.update((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  }

  get notificationsToday() {
    return this.socialService
      .notifications()
      .filter((n) => n.group === 'Today' && (this.activeFilter === 'All' || !n.isRead));
  }

  get notificationsYesterday() {
    return this.socialService
      .notifications()
      .filter((n) => n.group === 'Yesterday' && (this.activeFilter === 'All' || !n.isRead));
  }
}
