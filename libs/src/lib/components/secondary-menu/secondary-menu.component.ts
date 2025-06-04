import { Component, Input } from '@angular/core';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'dfinance-frontend-secondary-menu',
  templateUrl: './secondary-menu.component.html',
  styleUrls: ['./secondary-menu.component.scss'],
})
export class SecondaryMenuComponent {
  secodaryMenu:any = [];  
  isSubmenuActive = false;
  constructor( 
    private baseService: BaseService,
  ) {}
  ngOnInit(): void {
      this.secodaryMenu = JSON.parse(this.baseService.getLocalStorgeItem('secondary-menu') || '[]');

     
  }
  toggleSubmenu(): void {
    this.isSubmenuActive = !this.isSubmenuActive;console.log(this.isSubmenuActive);
  }
}
