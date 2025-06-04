import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'dfinance-frontend-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  secodaryMenu:any = [];  
  @Input() pageName: string = "";
  username:any = "";
  isDropdownOpen = false;
  isSubmenuActive = false;
  constructor(private router: Router, private baseService: BaseService) { }

  ngOnInit() {
    this.username = this.baseService.getLocalStorgeItem('username');
    this.secodaryMenu = JSON.parse(this.baseService.getLocalStorgeItem('secondary-menu') || '[]');
    // const currentUrl = this.router.url; // Get the current URL

    // const parts = currentUrl.split('/'); // Split the URL by '/'
    // const lastPart = parts[parts.length - 1]; // Get the last part of the URL
    // const parts1 = lastPart.split('?');
    // const lastPart1 = parts1[0];
    // // Convert last part to title  case
    // this.pageName = this.convertToTitleCase(lastPart1);
    // this.pageName = this.pageName.replace(/-/g, ' ');
    // console.log('Last part of the current URL in camel case:', this.pageName);
  }

  convertToTitleCase(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }
  logout() {
    this.baseService.clearLocalStorage();
    this.router.navigate(['/login']);
  }

  toggleUserDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSubmenu(): void {
    this.isSubmenuActive = !this.isSubmenuActive;console.log(this.isSubmenuActive);
  }

  // Close the dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.user-avatar-container');
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }
}
