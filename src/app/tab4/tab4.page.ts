import { HelperService } from './../core/services/helper.service';
import { SubscriptionType } from './../core/models/user.model';
import { AuthService } from './../core/services/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})

export class Tab4Page {

  SubscriptionType = SubscriptionType;

  constructor(
    public auth: AuthService,
    public helper: HelperService,
    private router: Router
  ) {
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
