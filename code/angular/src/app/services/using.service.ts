import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SettingsService } from '../settings/settings.service';
import { API_KEY_STORAGE_KEY } from '../constants';

export interface UsingRecord {
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class UsingService {
  private usingRecordsSubject = new BehaviorSubject<UsingRecord>({ name: 'Noone' });
  public usingRecord$ = this.usingRecordsSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    this.apiUrl = this.settingsService.settings.apiUrl;
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
          console.error('Error fetching weight records:', error);
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

}
