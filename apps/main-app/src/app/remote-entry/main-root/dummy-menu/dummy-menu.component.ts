import { Component } from '@angular/core';

export interface MenuDataModel {
  id: number;
  url: string;
  isPage: boolean;
  parentId: number;
  menutext: string;
}

@Component({
  selector: 'app-dummy-menu',
  templateUrl: './dummy-menu.component.html',
  styleUrls: ['./dummy-menu.component.scss']
})
export class DummyMenuComponent {
  menuData: MenuDataModel[] = [
    {
      id: 1,
      url: '',
      isPage: false,
      parentId: 0,
      menutext: 'finance',
    },
    {
      id: 2,
      url: '',
      isPage: false,
      parentId: 1,
      menutext: 'abc',
    },
    {
      id: 3,
      url: '/ssds/sdds1',
      isPage: true,
      parentId: 2,
      menutext: 'a',
    },
    {
      id: 4,
      url: '/ssds/sdds',
      isPage: true,
      parentId: 2,
      menutext: 'abc',
    },
    {
      id: 5,
      url: '/ssds/sdds',
      isPage: true,
      parentId: 1,
      menutext: 'c',
    },
    {
      id: 6,
      url: '',
      isPage: false,
      parentId: 0,
      menutext: 'Restaurant',
    },
  ];

  // Function to check if a menu item has children based on the 'id'
  hasChildren(id: number): boolean {
    return this.menuData.some((menu) => menu?.parentId === id && !menu?.isPage);
  }

  // Function to get child items based on the 'parentId'
  getChildren(id: number): MenuDataModel[] {
    return this.menuData.filter((menu) => menu?.parentId === id);
  }
}
