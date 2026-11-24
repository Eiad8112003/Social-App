import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  photo?: string;
  cover?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    tokenType?: string;
    expiresIn?: string;
    user: User;
  };
  errors?: string;
}

export interface SigninPayload {
  login: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  rePassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly baseUrl = 'https://route-posts.routemisr.com';
  
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getToken());

  signin(payload: SigninPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/signin`, payload).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          this.saveSession(res.data.token, res.data.user);
        }
      })
    );
  }

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/signup`, payload);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/forgot-password`, { email });
  }

  changePassword(password: string, newPassword: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/users/change-password`, {
      password,
      newPassword,
    }).pipe(
      tap((res) => {
        const newToken = res.token || res.data?.token;
        if (newToken) {
          localStorage.setItem('userToken', newToken);
          this.token.set(newToken);
        }
      })
    );
  }

  saveSession(token: string, user: User): void {
    localStorage.setItem('userToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  getToken(): string | null {
    return localStorage.getItem('userToken');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
