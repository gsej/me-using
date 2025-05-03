import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsingService, UsingRecord } from '../../services/using.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-currently-using',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currently-using.component.html',
  styleUrls: ['./currently-using.component.scss']
})
export class CurrentlyUsingComponent implements OnInit, OnDestroy {
  currentlyUsing: UsingRecord = { name: '' };
  isLoading: boolean = false;
  error: string | null = null;


  // these are used when updating the currently using
  status: string | null = null;
  errorStatusCode: string | null = null;
  private successTimer: any;


  private subscriptions: Subscription[] = [];

  constructor(private usingService: UsingService) { }

  ngOnInit(): void {
    // Subscribe to the service observables
    this.subscriptions.push(
      this.usingService.usingRecord$.subscribe(record => {
        this.currentlyUsing = record;
      })
    );

    this.subscriptions.push(
      this.usingService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.push(
      this.usingService.error$.subscribe(error => {
        this.error = error;
      })
    );

    // Load the weight records
    this.loadCurrentlyUsing();
  }

  setUsing(name: string): void {

    this.usingService.setUsing(name)
      .subscribe({
        next: () => {
          this.status = 'Success';
          this.errorStatusCode = null; ``
          this.clearStatusAfterDelay();
        },
        error: (error) => {
          console.error('Error submitting weight:', error);
          this.status = 'Error';
          this.errorStatusCode = error.status || 'Unknown';
          this.clearStatusAfterDelay();
        }
      });
  }

  private clearStatusAfterDelay() {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
    this.successTimer = setTimeout(() => {
      this.status = null;
    }, 3000);
  }



  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCurrentlyUsing(): void {
    this.usingService.loadUsing();
  }

  onRetry(): void {
    this.loadCurrentlyUsing();
  }
}
