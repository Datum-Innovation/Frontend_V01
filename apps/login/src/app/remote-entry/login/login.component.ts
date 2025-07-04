import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationConstant, AuthService, BaseService, selectToken } from '@dfinance-frontend/shared';
import { EndpointConstant } from '@dfinance-frontend/shared';
import { Store } from '@ngrx/store';
import { setToken } from '@dfinance-frontend/shared';
import { Branch, Company } from '../model/login.interface';
import {  loadMenuSuccess,selectMenuItems } from '@dfinance-frontend/shared';
import { ShortcutMenuService } from '../../services/shortcutmenu.service';

@Component({
  selector: 'dfinance-frontend-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm!: FormGroup;
  applicationConstant = ApplicationConstant;
  selectedCompany = {} as Company;
  companies = [] as Array<Company>;
  selectedBranch = {} as Branch;
  branches = [] as Array<Branch>;
  selectedCompanyId!: number;
  selectedBranchId!: number;
  destroySubscription: Subject<void> = new Subject<void>();
  isLoading = false;
  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private baseService: BaseService,
    private router: Router,
    private store: Store,
    private authService: AuthService,
    private shortcutmenuservice:ShortcutMenuService   
  ) {}

  ngOnInit(): void {
    // Check if the user is logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.applicationConstant?.appRouting?.MAIN_APP);
    }
    this.loginForm = this.formBuilder.group({
      company: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      branch: [{value: '', disabled: true}, Validators.required],
    });
    this.fetchCompanies()
  }

  fetchCompanies(): void {
    console.log("Login api :",EndpointConstant.COMPANIES)
    this.loginService
    .getDetails(EndpointConstant.COMPANIES)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.companies = response?.data;
        //console.log("companie:"+JSON.stringify(response?.data,null,2))
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }

  onCompanySelect(): void {
    this.selectedCompanyId = this.loginForm?.get('company')?.value;
    this.selectedCompany = this.companies?.find(obj => obj?.id == this.selectedCompanyId) as Company;
    if (this.selectedCompanyId) {
      this.loginForm.get('branch')?.enable();
      this.generateApiConnectionUUID();
      console.log("selectedCompanyId:"+this.selectedCompanyId)
      this.SetDbConnection();
      console.log("SetDbConnection")
      // this.fetchBranches();
    }
  }

  fetchBranches(): void {
    this.isLoading = true;
    this.loginService
      .getDetails(EndpointConstant.BRANCHES)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.branches = response?.data || [];
          this.isLoading = false;
          if (this.branches.length > 0) {
            this.selectedBranchId = this.branches[0].id;
            this.selectedBranch = this.branches[0];
            this.loginForm.patchValue({
              branch: this.selectedBranchId
            });
          }
        },
        error: (error) => {
          console.error('Error fetching branches:', error);
          this.isLoading = false;
        }
      });
  }

  // SetDbConnection(): void {
  //   this.isLoading = true;
  //   this.loginService
  //     .getDetails(EndpointConstant.SETCONNECTION + this.selectedCompanyId)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //         if (response?.data) {
  //           this.baseService.setLocalStorgeItem('skey', response.data);
  //         }
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('Error setting DB connection:', error);
  //         this.isLoading = false;
  //       }
  //     });
  // }

  SetDbConnection(): void {
   
    this.loginService
      .getDetails(EndpointConstant.SETCONNECTION + this.selectedCompanyId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: () => this.fetchBranches(),
        error: (err) => console.error('error setting DB connection', err)
        });
      }
 

  onBranchSelect(): void {
    this.selectedBranchId = this.loginForm?.get('branch')?.value;
    this.selectedBranch = this.branches?.find(obj => obj?.id == this.selectedBranchId) as Branch;
  }

  fetchSecondarymenu(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.shortcutmenuservice
        .getDetails(EndpointConstant.FILLSHORTCUTMENU)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            console.log('API Response:', response);
            if (response?.data?.result) {
              let secondaryMenu = JSON.stringify(response.data.result);
              this.baseService.setLocalStorgeItem('secondary-menu', secondaryMenu);
            }
            resolve();
          },
          error: (error) => {
            console.error('Error fetching secondary menu:', error);
            reject(error);
          },
        });
    });
  }
  
   onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
  
    this.isLoading = true;
  
    const payload = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      company: {
        id: this.selectedCompanyId,
        value: this.selectedCompany?.name,
      },
      branch: {
        id: this.selectedBranchId,
        value: this.selectedBranch?.name,
      },
    };
  
    this.loginService
      .saveDetails(EndpointConstant.LOGIN, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
  
        next: (response) => {
          this.isLoading = false;
  
          // Save user details to local storage
          const token = response?.token;
          this.baseService.setLocalStorgeItem('username', this.loginForm.value.username);
          this.baseService.setLocalStorgeItem('access_token', token);
          const branchId = response?.users.branchId;
          this.baseService.setLocalStorgeItem('current_branch', branchId);
          this.baseService.setLocalStorgeItem('settings', response?.settings);
  
          // Set numeric format
          this.setNumericFormat(response?.settings);
  
          // Store menu data in local storage
          const menuItems = response?.userPageListView;
          if (menuItems) {
            this.store.dispatch(loadMenuSuccess({ menuItems }));
            localStorage.setItem('menuData', JSON.stringify(menuItems));
          }
  
          // Fetch secondary menu and navigate after completion
          this.fetchSecondarymenu()
            .then(() => {
              this.router.navigateByUrl(this.applicationConstant?.appRouting?.MAIN_APP);
            })
            .catch((error) => {
              console.error('Error during fetchSecondarymenu:', error);
            });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Invalid request';
this.baseService.showCustomDialogue(errorMessage);

          this.isLoading = false;
          console.error('Login failed', error);
        },
      });
  }
  

  
  

  setNumericFormat(settings: any) {
    let appSettings = JSON.parse(settings);

    // Ensure that appSettings is an array
    if (Array.isArray(appSettings)) {
        let numericFormat = appSettings.find((setting: any) => setting.Key === "NumericFormat");
        let decimalPlaces = this.getDecimalPlaces(numericFormat.Value);
        if (numericFormat) {
            this.baseService.setLocalStorgeItem('numericformat', decimalPlaces.toString());
        }
    } else {
        console.error("Settings is not an array:", appSettings);
    }
  }

  getDecimalPlaces(numericFormat: string): number {
    // Extract the number after "N"
    const decimalPlaces = parseInt(numericFormat.replace("N", ""), 10);

    // Check if it's a valid number
    if (!isNaN(decimalPlaces)) {
        return decimalPlaces;
    } else {
        // Handle the case where the format is not valid
        console.error("Invalid numeric format:", numericFormat);
        return 0; // Default to 0 decimal places if invalid
    }
  }

  generateApiConnectionUUID(){
    this.baseService.setLocalStorgeItem('skey',this.generateUUID());
  }
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
  }

  
}
