import { Component } from '@angular/core';
import { CurrentlyUsingComponent } from '../currently-using/currently-using.component';

@Component({
  selector: 'app-page-1',
  standalone: true,
  imports: [CurrentlyUsingComponent],
  templateUrl: './page-1.component.html',
  styleUrl: './page-1.component.scss'
})
export class Page1Component {

}
