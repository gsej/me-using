import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SettingsService } from '../settings/settings.service';
import { API_KEY_STORAGE_KEY } from '../constants';

export interface UsingRecord {
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class UsingService implements OnDestroy {
  private usingRecordsSubject = new BehaviorSubject<UsingRecord>({ name: 'No one' });
  public usingRecord$ = this.usingRecordsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private apiUrl: string;
  private refreshInterval = 60000; // 60 seconds in milliseconds
  private autoRefreshSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    this.apiUrl = this.settingsService.settings.apiUrl;
    this.startAutoRefresh();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'x-api-key': localStorage.getItem(API_KEY_STORAGE_KEY) || ''
    });
  }

  loadUsing(): void {
    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<UsingRecord>(`${this.apiUrl}/api/using`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.usingRecordsSubject.next(data);
          this.isLoadingSubject.next(false);
        },
        error: (error) => {
          console.error('Error fetching using record:', error);
          this.errorSubject.next(`Error: ${error.status || 'Unknown'}`);
          this.isLoadingSubject.next(false);
        }
      });
  }

  setUsing(name: string): Observable<any> {
    const payload = {
      name: name,
    };

    return this.http.post(`${this.apiUrl}/api/using`, payload, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.loadUsing();
        })
      );
  }

  /**
   * Starts auto-refreshing the currently using data at the specified interval
   * @param intervalMs Optional custom interval in milliseconds (defaults to this.refreshInterval)
   */
  startAutoRefresh(intervalMs?: number): void {
    // Stop any existing refresh interval
    this.stopAutoRefresh();

    // Set new interval if provided
    if (intervalMs !== undefined) {
      this.refreshInterval = intervalMs;
    }

    // Start new refresh interval
    this.autoRefreshSubscription = interval(this.refreshInterval)
      .subscribe(() => {
        this.loadUsing();
      });
  }

  /**
   * Stops the auto-refresh of data
   */
  stopAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
      this.autoRefreshSubscription = null;
    }
  }

  /**
   * Clean up subscriptions when service is destroyed
   */
  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }
}
