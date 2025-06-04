import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { MenuItem } from '../+state/menu/menu.state';
import { Store } from '@ngrx/store';
import { selectToken } from '../+state/login/login.selectors';
// import { loadMenuSuccess } from '../shared.module';
import { selectMenuItems } from '../+state/menu/menu.selectors';
import { BaseService } from '../services/base.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MenuComponent implements OnInit {
  token$: any;
  currentPagename = 'main-app';
  @Input() parentStyle: boolean = false;
  private _menuItems$: Observable<MenuItem[]> = of([]);

  //setting menu items when submenu calls this component again .....
  @Input()
  set menuItems$(value: MenuItem[] | Observable<MenuItem[]> | undefined) {
    if (Array.isArray(value)) {
      this._menuItems$ = of(value);
    } else if (value instanceof Observable) {
      this._menuItems$ = value;
    } else {
      this._menuItems$ = of([]);
    }
  }

  get menuItems$(): Observable<MenuItem[]> {
    return this._menuItems$;
  }

  constructor(private router: Router,private store: Store,  private baseService : BaseService)  {
    // Retrieve token from local storage on initialization
    // const savedMenu:any = localStorage.getItem('menuData');
    // if (savedMenu) {
    //   //this.store.dispatch(loadMenuSuccess({ menuItems:JSON.parse(savedMenu) }));
    //   //this.menuItems$ = this.store.select(selectMenuItems);
    // }
    // this.menuItems$ = this.store.select(selectMenuItems);



    this.store.select(selectMenuItems).subscribe(menuItems => {
      if (!menuItems || menuItems.length === 0) {
        const savedMenu:any = localStorage.getItem('menuData');
        this.menuItems$ = JSON.parse(savedMenu);
      } else {
        this.menuItems$ = menuItems;
      }
    });

  }

  ngOnInit() {
    //Remove all external dependencies for debugging
    let url = this.router.url;
    this.currentPagename = url.split('/')[1];
  }

  navigateTo(menuItem: any) {
    // Check if the menuItem has a URL and isPage is true
    if (menuItem.isPage && menuItem.url) {
      // Navigate to the specified URL with query parameters
      this.router.navigate([`/${menuItem.url.toLowerCase()}`], { queryParams: { menuId: menuItem.id } });
    }
}

  isMenuActive(menutext:any){
    if(menutext.toLowerCase() == this.currentPagename){
      return true;
    }
    return false;
  }
 

}
