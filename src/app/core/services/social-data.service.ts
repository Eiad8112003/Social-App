import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Creator {
  id: string;
  name: string;
  username: string;
  role: string;
  location: string;
  avatar: string;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  timeAgo: string;
  content: string;
  image?: string;
  videoDuration?: string;
  linkCard?: {
    title: string;
    url: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface TrendingTopic {
  tag: string;
  postsCount: string;
}

export interface Community {
  name: string;
  members: string;
  iconBg: string;
  icon: string;
  isJoined?: boolean;
}

export interface Collection {
  name: string;
  count: string;
  colorClass: string;
  icon: string;
}

export interface NotificationItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target?: string;
  time: string;
  thumbnail?: string;
  isRead?: boolean;
  type: 'like' | 'follow' | 'comment' | 'share';
  group: 'Today' | 'Yesterday';
}

@Injectable({
  providedIn: 'root',
})
export class SocialDataService {
  private http = inject(HttpClient);
  isCreatePostModalOpen = signal<boolean>(false);

  constructor() {
    if (localStorage.getItem('userToken')) {
      this.loadPostsFromApi();
      this.loadProfileFromApi();
      this.loadSuggestionsFromApi();
      this.loadNotificationsFromApi();
    }
  }

  loadPostsFromApi(): void {
    if (!localStorage.getItem('userToken')) return;
    this.http.get<any>('https://route-posts.routemisr.com/posts').subscribe({
      next: (res) => {
        if (res.success && res.data?.posts && Array.isArray(res.data.posts)) {
          const apiPosts: Post[] = res.data.posts.map((p: any) => ({
            id: p._id,
            author: {
              name: p.user?.name || 'Route User',
              username: p.user?.username ? (p.user.username.startsWith('@') ? p.user.username : `@${p.user.username}`) : '@route.user',
              avatar: p.user?.photo || 'assets/avatar_ahmed.png',
              verified: true,
              _id: p.user?._id || p.user?.id,
            },
            timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'recently',
            content: p.body || '',
            image: p.image || undefined,
            likes: p.likesCount || 0,
            comments: p.commentsCount || 0,
            shares: 0,
            isLiked: false,
            isSaved: false,
          }));
          if (apiPosts.length > 0) {
            this.posts.set(apiPosts);
          }
        }
      },
      error: (err) => {
        console.warn('Using fallback mock posts:', err);
      },
    });
  }

  loadProfileFromApi(): void {
    if (!localStorage.getItem('userToken')) return;
    this.http.get<any>('https://route-posts.routemisr.com/users/profile-data').subscribe({
      next: (res) => {
        if (res.success && res.data?.user) {
          const u = res.data.user;
          this.currentUser.set({
            name: u.name || 'Route User',
            username: u.username ? (u.username.startsWith('@') ? u.username : `@${u.username}`) : '@route.user',
            avatar: u.photo || 'assets/avatar_ahmed.png',
            role: 'Frontend Developer | Route Posts Member',
            badge: 'Route Posts Member',
            followers: `${u.followersCount || 0}`,
            following: `${u.followingCount || 0}`,
            postsCount: `${u.postsCount || 0}`,
            savedCount: `${u.bookmarksCount || 0}`,
            bio: 'Building things that matter.',
          });
        }
      },
      error: (err) => console.warn('Profile API fallback:', err),
    });
  }

  loadSuggestionsFromApi(): void {
    if (!localStorage.getItem('userToken')) return;
    this.http.get<any>('https://route-posts.routemisr.com/users/suggestions?page=1&limit=6').subscribe({
      next: (res) => {
        if (res.success && res.data?.suggestions && Array.isArray(res.data.suggestions)) {
          const sugCreators: Creator[] = res.data.suggestions.map((c: any) => ({
            id: c._id,
            name: c.name || 'User',
            username: c.username ? (c.username.startsWith('@') ? c.username : `@${c.username}`) : '@user',
            role: 'Member',
            location: 'Egypt',
            avatar: c.photo || 'assets/avatar_omar.png',
            isFollowing: false,
          }));
          if (sugCreators.length > 0) {
            this.creators.set(sugCreators);
          }
        }
      },
      error: (err) => console.warn('Suggestions API fallback:', err),
    });
  }

  loadNotificationsFromApi(): void {
    if (!localStorage.getItem('userToken')) return;
    this.http.get<any>('https://route-posts.routemisr.com/notifications').subscribe({
      next: (res) => {
        if (res.success && res.data?.notifications && Array.isArray(res.data.notifications)) {
          const notifs: NotificationItem[] = res.data.notifications.map((n: any) => ({
            id: n._id,
            user: {
              name: n.sender?.name || 'Community Member',
              avatar: n.sender?.photo || 'assets/avatar_omar.png',
            },
            action: n.message || 'interacted with your content.',
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            isRead: n.read || false,
            type: n.type || 'like',
            group: 'Today',
          }));
          if (notifs.length > 0) {
            this.notifications.set(notifs);
          }
        }
      },
      error: (err) => console.warn('Notifications API fallback:', err),
    });
  }

  currentUser = signal({
    name: 'Ahmed Reda',
    username: '@ahmed.reda',
    avatar: 'assets/avatar_ahmed.png',
    role: 'Frontend Developer | Traveler | Coffee Lover ☕',
    badge: 'Route Posts member',
    followers: '1.2K',
    following: '284',
    postsCount: '46',
    savedCount: '12',
    bio: 'Building things that matter.',
  });

  creators = signal<Creator[]>([
    {
      id: '1',
      name: 'Mohamed Salah',
      username: '@mohamed.salah',
      role: 'UI/UX Designer',
      location: 'Cairo, Egypt',
      avatar: 'assets/avatar_omar.png',
      isFollowing: false,
    },
    {
      id: '2',
      name: 'Nour Ali',
      username: '@nour.ali',
      role: 'Photographer',
      location: 'Alexandria, Egypt',
      avatar: 'assets/avatar_sara.png',
      isFollowing: false,
    },
    {
      id: '3',
      name: 'Sara Ahmed',
      username: '@sara.ahmed',
      role: 'Frontend Developer',
      location: 'Cairo, Egypt',
      avatar: 'assets/avatar_sara.png',
      isFollowing: false,
    },
    {
      id: '4',
      name: 'Youssef Magdy',
      username: '@youssef.magdy',
      role: 'Travel Enthusiast',
      location: 'Aswan, Egypt',
      avatar: 'assets/avatar_ahmed.png',
      isFollowing: false,
    },
    {
      id: '5',
      name: 'Aya Mohamed',
      username: '@aya.mohamed',
      role: 'Content Creator',
      location: 'Giza, Egypt',
      avatar: 'assets/avatar_sara.png',
      isFollowing: false,
    },
    {
      id: '6',
      name: 'Karim Osama',
      username: '@karim.osama',
      role: 'Full Stack Dev',
      location: 'Cairo, Egypt',
      avatar: 'assets/avatar_omar.png',
      isFollowing: false,
    },
    {
      id: '7',
      name: 'Hoda Mostafa',
      username: '@hoda.mostafa',
      role: 'Graphic Designer',
      location: 'Mansoura, Egypt',
      avatar: 'assets/avatar_sara.png',
      isFollowing: false,
    },
  ]);

  posts = signal<Post[]>([
    {
      id: 'p1',
      author: {
        name: 'Omar Ashraf',
        username: '@omar.ashraf',
        avatar: 'assets/avatar_omar.png',
        verified: true,
      },
      timeAgo: '2h',
      content: 'Sometimes a small idea can change the whole direction.',
      image: 'assets/post_mountain.png',
      likes: 128,
      comments: 24,
      shares: 8,
      isLiked: false,
      isSaved: true,
    },
    {
      id: 'p2',
      author: {
        name: 'Sara Ahmed',
        username: '@sara.ahmed',
        avatar: 'assets/avatar_sara.png',
        verified: true,
      },
      timeAgo: '5h',
      content: 'Focus on your goals and the rest will follow.',
      image: 'assets/post_ambient.png',
      likes: 96,
      comments: 18,
      shares: 5,
      isLiked: true,
      isSaved: true,
    },
    {
      id: 'p3',
      author: {
        name: 'Nour Ali',
        username: '@nour.ali',
        avatar: 'assets/avatar_sara.png',
        verified: true,
      },
      timeAgo: '1d',
      content: 'Collect moments, not things.',
      image: 'assets/post_city.png',
      videoDuration: '0:45',
      likes: 142,
      comments: 32,
      shares: 12,
      isLiked: false,
      isSaved: true,
    },
    {
      id: 'p4',
      author: {
        name: 'Youssef Magdy',
        username: '@youssef.magdy',
        avatar: 'assets/avatar_ahmed.png',
        verified: true,
      },
      timeAgo: '2d',
      content: 'The mountains are calling and I must go! ⛰️',
      image: 'assets/post_mountain.png',
      likes: 201,
      comments: 45,
      shares: 10,
      isLiked: true,
      isSaved: true,
    },
    {
      id: 'p5',
      author: {
        name: 'Laila Hassan',
        username: '@laila.hassan',
        avatar: 'assets/avatar_sara.png',
        verified: true,
      },
      timeAgo: '3d',
      content: 'Design is not just what it looks like and feels like. Design is how it works.',
      linkCard: {
        title: 'Design Better. Think Better.',
        url: 'behance.net',
      },
      likes: 58,
      comments: 9,
      shares: 2,
      isLiked: false,
      isSaved: true,
    },
  ]);

  trendingTopics = signal<TrendingTopic[]>([
    { tag: 'Design Inspiration', postsCount: '12.4K' },
    { tag: 'Web Development', postsCount: '8.7K' },
    { tag: 'JavaScript', postsCount: '7.1K' },
    { tag: 'UI/UX Design', postsCount: '6.2K' },
    { tag: 'Productivity', postsCount: '5.8K' },
  ]);

  communities = signal<Community[]>([
    {
      name: 'Web Developers',
      members: '12.4K',
      iconBg: 'bg-blue-600/20 text-blue-400',
      icon: 'fa-code',
      isJoined: false,
    },
    {
      name: 'UI/UX Design',
      members: '8.7K',
      iconBg: 'bg-purple-600/20 text-purple-400',
      icon: 'fa-pen-nib',
      isJoined: false,
    },
    {
      name: 'Travel & Photography',
      members: '6.3K',
      iconBg: 'bg-rose-600/20 text-rose-400',
      icon: 'fa-camera',
      isJoined: false,
    },
    {
      name: 'JavaScript World',
      members: '9.1K',
      iconBg: 'bg-amber-600/20 text-amber-400',
      icon: 'fa-code-branch',
      isJoined: false,
    },
    {
      name: 'Freelancers Hub',
      members: '7.8K',
      iconBg: 'bg-emerald-600/20 text-emerald-400',
      icon: 'fa-briefcase',
      isJoined: false,
    },
  ]);

  collections = signal<Collection[]>([
    {
      name: 'Inspiration',
      count: '24 posts',
      colorClass: 'bg-purple-600 text-white',
      icon: 'fa-bookmark',
    },
    {
      name: 'Travel',
      count: '18 posts',
      colorClass: 'bg-emerald-600 text-white',
      icon: 'fa-plane',
    },
    {
      name: 'Design Ideas',
      count: '32 posts',
      colorClass: 'bg-amber-500 text-white',
      icon: 'fa-lightbulb',
    },
    {
      name: 'Motivation',
      count: '16 posts',
      colorClass: 'bg-blue-600 text-white',
      icon: 'fa-bolt',
    },
    {
      name: 'Photography',
      count: '21 posts',
      colorClass: 'bg-pink-600 text-white',
      icon: 'fa-camera',
    },
  ]);

  notifications = signal<NotificationItem[]>([
    {
      id: 'n1',
      user: { name: 'Omar Ashraf', avatar: 'assets/avatar_omar.png' },
      action: 'liked your post.',
      time: '2 minutes ago',
      thumbnail: 'assets/post_mountain.png',
      isRead: false,
      type: 'like',
      group: 'Today',
    },
    {
      id: 'n2',
      user: { name: 'Ahmed Reda', avatar: 'assets/avatar_ahmed.png' },
      action: 'started following you.',
      time: '10 minutes ago',
      isRead: false,
      type: 'follow',
      group: 'Today',
    },
    {
      id: 'n3',
      user: { name: 'Sara Ahmed', avatar: 'assets/avatar_sara.png' },
      action: 'commented on your post:',
      target: '"Amazing post!" 🔥',
      time: '25 minutes ago',
      thumbnail: 'assets/post_ambient.png',
      isRead: false,
      type: 'comment',
      group: 'Today',
    },
    {
      id: 'n4',
      user: { name: 'Nour Ali', avatar: 'assets/avatar_sara.png' },
      action: 'shared your post.',
      time: '35 minutes ago',
      thumbnail: 'assets/post_city.png',
      isRead: false,
      type: 'share',
      group: 'Today',
    },
    {
      id: 'n5',
      user: { name: 'Mohamed Salah', avatar: 'assets/avatar_omar.png' },
      action: 'liked your comment.',
      time: 'Yesterday, 8:15 PM',
      thumbnail: 'assets/post_mountain.png',
      isRead: true,
      type: 'like',
      group: 'Yesterday',
    },
    {
      id: 'n6',
      user: { name: 'Omar Ashraf', avatar: 'assets/avatar_omar.png' },
      action: 'shared your post.',
      time: 'Yesterday, 10:30 PM',
      thumbnail: 'assets/post_mountain.png',
      isRead: true,
      type: 'share',
      group: 'Yesterday',
    },
  ]);

  openCreatePostModal(): void {
    this.isCreatePostModalOpen.set(true);
  }

  closeCreatePostModal(): void {
    this.isCreatePostModalOpen.set(false);
  }

  toggleLike(postId: string): void {
    this.posts.update((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    if (localStorage.getItem('userToken')) {
      this.http.put(`https://route-posts.routemisr.com/posts/${postId}/like`, {}).subscribe({
        error: (err) => console.warn('Like post API error:', err),
      });
    }
  }

  toggleSave(postId: string): void {
    this.posts.update((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, isSaved: !p.isSaved };
        }
        return p;
      })
    );

    if (localStorage.getItem('userToken')) {
      this.http.put(`https://route-posts.routemisr.com/posts/${postId}/bookmark`, {}).subscribe({
        error: (err) => console.warn('Bookmark post API error:', err),
      });
    }
  }

  toggleFollow(creatorId: string): void {
    this.creators.update((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          return { ...c, isFollowing: !c.isFollowing };
        }
        return c;
      })
    );
  }

  toggleJoinCommunity(communityName: string): void {
    this.communities.update((prev) =>
      prev.map((c) => {
        if (c.name === communityName) {
          return { ...c, isJoined: !c.isJoined };
        }
        return c;
      })
    );
  }

  addNewPost(content: string, image?: string): void {
    const userStr = localStorage.getItem('currentUser');
    let authorName = 'Ahmed Reda';
    let authorUsername = '@ahmed.reda';
    let authorAvatar = 'assets/avatar_ahmed.png';

    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) authorName = u.name;
        if (u.username) authorUsername = u.username.startsWith('@') ? u.username : `@${u.username}`;
        if (u.photo) authorAvatar = u.photo;
      } catch {}
    }

    const payload = { body: content };

    this.http.post<any>('https://route-posts.routemisr.com/posts', payload).subscribe({
      next: (res) => {
        const p = res.post || res.data?.post || res.data;
        const newP: Post = {
          id: p?._id || ('p_' + Date.now()),
          author: {
            name: authorName,
            username: authorUsername,
            avatar: authorAvatar,
            verified: true,
          },
          timeAgo: 'Just now',
          content,
          image,
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isSaved: false,
        };
        this.posts.update((prev) => [newP, ...prev]);
        this.closeCreatePostModal();
      },
      error: () => {
        const newP: Post = {
          id: 'p_' + Date.now(),
          author: {
            name: authorName,
            username: authorUsername,
            avatar: authorAvatar,
            verified: true,
          },
          timeAgo: 'Just now',
          content,
          image,
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isSaved: false,
        };
        this.posts.update((prev) => [newP, ...prev]);
        this.closeCreatePostModal();
      },
    });
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);

    return this.http.put<any>('https://route-posts.routemisr.com/users/upload-photo', formData).pipe(
      tap((res) => {
        const photoUrl = res.user?.photo || res.data?.user?.photo || res.photo || res.data?.photo;
        if (photoUrl) {
          this.currentUser.update((curr) =>
            curr ? { ...curr, avatar: photoUrl } : curr
          );
          const userStr = localStorage.getItem('currentUser');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              u.photo = photoUrl;
              localStorage.setItem('currentUser', JSON.stringify(u));
            } catch {}
          }
        }
      })
    );
  }

  isMyPost(post: Post): boolean {
    if (post.id && post.id.startsWith('p_')) return true;

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return false;
    try {
      const u = JSON.parse(userStr);
      const authorObj = post.author as any;

      if (authorObj?._id && u._id && authorObj._id === u._id) {
        return true;
      }
      if (authorObj?.username && u.username) {
        const u1 = authorObj.username.replace('@', '').toLowerCase().trim();
        const u2 = u.username.replace('@', '').toLowerCase().trim();
        if (u1 && u2 && u1 === u2) return true;
      }
    } catch {}

    return false;
  }

  updatePost(postId: string, newBody: string): Observable<any> {
    this.posts.update((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, content: newBody } : p))
    );

    return this.http.put<any>(`https://route-posts.routemisr.com/posts/${postId}`, { body: newBody });
  }

  deletePost(postId: string): Observable<any> {
    this.posts.update((prev) => prev.filter((p) => p.id !== postId));

    return this.http.delete<any>(`https://route-posts.routemisr.com/posts/${postId}`);
  }
}



