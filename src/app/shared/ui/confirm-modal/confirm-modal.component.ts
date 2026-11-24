import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      (click)="cancelled.emit()"
    >
      <div
        (click)="$event.stopPropagation()"
        [ngClass]="
          themeService.isDarkMode()
            ? 'bg-[#0e0c1c] border-white/10 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        "
        class="w-full max-w-sm rounded-2xl border p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0"
          >
            <i class="fa-regular fa-trash-can text-base"></i>
          </div>
          <div>
            <h3 class="text-base font-bold">{{ title }}</h3>
            <p
              [ngClass]="themeService.isDarkMode() ? 'text-slate-400' : 'text-slate-500'"
              class="text-xs sm:text-sm mt-1"
            >
              {{ message }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            (click)="cancelled.emit()"
            [ngClass]="
              themeService.isDarkMode()
                ? 'bg-[#171429] border-white/10 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            "
            class="px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            (click)="confirmed.emit()"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmModalComponent {
  themeService = inject(ThemeService);

  @Input() isOpen = false;
  @Input() title = 'Delete Post';
  @Input() message = 'Are you sure you want to delete this post? This action cannot be undone.';
  @Input() confirmText = 'Delete';
  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
