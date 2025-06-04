import { Component } from "@angular/core";
import { MenuItem } from "./models/menuitem.model";

@Component({
  selector: 'dfinance-frontend-dynamic-menu-creation',
  templateUrl: './dynamic-menu-creation.component.html',
  styleUrls: ['./dynamic-menu-creation.component.scss']
})
export class DynamicMenuCreationComponent {
  title = "dynamic-sidebar-menu";
  finalMenu: any[] = [];
  menuLoaded!: Boolean;
  menu!: MenuItem[];
  
  ngOnInit(): void {
    this.menu = [
      {
        id: "1",
        text: "Item1",
        action: '',
        icon: "home",
        menuFatherId: '',
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "2",
        text: "Item2",
        action: '',
        icon: "location_on",
        menuFatherId: '',
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "3",
        text: "Item3",
        action: '',
        icon: "phone_enabled",
        menuFatherId: '',
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "4",
        text: "Item1.1",
        action: "/action",
        icon: "voicemail",
        menuFatherId: "1",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "5",
        text: "Item1.2",
        action: "/action",
        icon: "home",
        menuFatherId: "1",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "6",
        text: "Item2.1",
        action: '',
        icon: "vpn_key",
        menuFatherId: "2",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "7",
        text: "Item2.1.1",
        action: '',
        icon: "sentiment_satisfied_alt",
        menuFatherId: "6",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "8",
        text: "Item2.1.2",
        action: '',
        icon: "sentiment_satisfied_alt",
        menuFatherId: "6",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "9",
        text: "Item2.1.1.1",
        action: "/action",
        icon: "rss_feed",
        menuFatherId: "7",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "10",
        text: "Item2.1.1.2",
        action: "/action",
        icon: "rss_feed",
        menuFatherId: "7",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
      {
        id: "11",
        text: "Item3.1",
        action: "/action",
        icon: "add_circle_outline",
        menuFatherId: "3",
        opacity: undefined,
        children: [],
        isCollapsed:undefined
      },
    ];
    this.renderMenu(this.menu);
  }

  renderMenu(menu: MenuItem[]) {
    while (menu.length > 0) {
      menu.forEach((menuItem) => {
        menuItem.children = [];

        if (!menuItem.menuFatherId) {
          const index: number = menu.indexOf(menuItem);
          if (index !== -1) {
            menu.splice(index, 1);
          }
          menuItem.opacity = 0;
          this.finalMenu.push(menuItem);
        } else {
          const father = menuItem.menuFatherId;

          this.serachFather(this.finalMenu, father, menuItem, menu);
        }
      });
    }
    this.menuLoaded = true;
  }

  serachFather(menuArray: MenuItem[], father: any, menuItem: MenuItem, menu: any) {
    menuArray.forEach((menuPainted) => {
      if (menuPainted.id === father) {
        menuItem.opacity = menuPainted.opacity + 1;
        menuPainted.children.push(menuItem);

        const index: number = menu.indexOf(menuItem);
        if (index !== -1) {
          menu.splice(index, 1);
        }
      } else {
        this.serachFather(menuPainted.children, father, menuItem, menu);
      }
    });
  }

}
