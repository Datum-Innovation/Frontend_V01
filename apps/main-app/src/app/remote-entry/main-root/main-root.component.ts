import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { BaseService, EndpointConstant, loadMenuSuccess, selectToken } from '@dfinance-frontend/shared';
import { MenuItem,selectMenuItems } from '@dfinance-frontend/shared';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MainRootService } from '../../services/main-root.service';

@Component({
  selector: 'dfinance-frontend-main-root',
  templateUrl: './main-root.component.html',
  styleUrls: ['./main-root.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MainRootComponent implements OnInit {
  token$: any;
  
  destroySubscription: Subject<void> = new Subject<void>();
  secondaryMenu:any = [];
  constructor(private store: Store,
    private mainrootservice:MainRootService,    
    private baseService: BaseService,
  ) {}

  ngOnInit() {
    this.token$ = this.store.select(selectToken);
    this.fetchShortcutMenu(); 
  }

  fetchShortcutMenu(){
    this.mainrootservice
      .getDetails(EndpointConstant.FILLSHORTCUTMENU)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // Check if 'secondary-menu' exists in local storage
          const existingMenu = this.baseService.getLocalStorgeItem('secondary-menu');

          // if (!existingMenu) {
          //   // If not found, set the value
          //   this.secondaryMenu = JSON.stringify(response?.data.result);
          //   this.baseService.setLocalStorgeItem('secondary-menu',this.secondaryMenu);
          // }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }






 




}
