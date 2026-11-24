import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full',
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/forget-password/forget-password.component').then(
            (m) => m.ForgetPasswordComponent
          ),
      },
    ],
  },
  {
    path: 'main',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
      {
        path: 'feed',
        loadComponent: () =>
          import('./features/feed/feed.component').then((m) => m.FeedComponent),
      },
      {
        path: 'explore',
        loadComponent: () =>
          import('./features/explore/explore.component').then((m) => m.ExploreComponent),
      },
      {
        path: 'following',
        loadComponent: () =>
          import('./features/explore/explore.component').then((m) => m.ExploreComponent),
      },
      {
        path: 'communities',
        loadComponent: () =>
          import('./features/explore/explore.component').then((m) => m.ExploreComponent),
      },
      {
        path: 'saved',
        loadComponent: () =>
          import('./features/saved/saved.component').then((m) => m.SavedComponent),
      },
      {
        path: 'my-posts',
        loadComponent: () =>
          import('./features/profil/profil.component').then((m) => m.ProfilComponent),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/notification/notification.component').then(
            (m) => m.NotificationComponent
          ),
      },
      {
        path: 'notification',
        loadComponent: () =>
          import('./features/notification/notification.component').then(
            (m) => m.NotificationComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profil/profil.component').then((m) => m.ProfilComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
