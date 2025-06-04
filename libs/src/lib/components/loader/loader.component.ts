import { Component, Input } from '@angular/core';

@Component({
  selector: 'dfinance-frontend-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {
  @Input() loadingFlag:boolean = false;
}
