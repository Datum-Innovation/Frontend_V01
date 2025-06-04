import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dfinance-frontend-language-localization',
  templateUrl: './language-localization.component.html',
  styleUrls: ['./language-localization.component.scss'],
})
export class LanguageLocalizationComponent {
  constructor(    
    private translateService: TranslateService,
    @Inject(DOCUMENT) private document: Document){

    }
  changeLangage(lang: string) {
    let htmlTag = this.document.getElementsByTagName("html")[0] as HTMLHtmlElement;
    htmlTag.dir = lang === "ar" ? "rtl" : "ltr";
    this.translateService.setDefaultLang(lang);
    this.translateService.use(lang);

    this.loadStyle('ltr.css');
    //this.changeCssFile(lang);
  }

  loadStyle(url: string) {
    // Check if the stylesheet is already loaded
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (!existingLink) {
      // Create a new <link> element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = url;
      link.id = 'theme-style';

      // Add the <link> element to the <head>
      document.head.appendChild(link);
    }
  }

  changeCssFile(lang: string) {
  let headTag = this.document.getElementsByTagName("head")[0] as HTMLHeadElement;
  let existingLink = this.document.getElementById("langCss") as HTMLLinkElement;
  // let bundleName = lang === "ar" ?       "apps/dfinance-host/src/styles-ar.scss":"apps/dfinance-host/src/styles-en.css";
  // if (existingLink) {
  //    existingLink.href = bundleName;
  // } else {
  //    let newLink = this.document.createElement("link");
  //    newLink.rel = "stylesheet";
  //    newLink.type = "text/scss";
  //    newLink.id = "langCss";
  //    newLink.href = bundleName;console.log(newLink);console.log(bundleName);
  //    headTag.appendChild(newLink);
  // }
  }

}
