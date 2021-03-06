import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from './core/services/app-route-guard.service';

const routes: Routes = [
  { path: '', canActivate: [RouteGuardService], loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './auth/login/login.module#LoginPageModule' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'listhome', loadChildren: './player/player.module#PlayerPageModule' },
  { path: 'player', loadChildren: './downloadplayer/player.module#PlayerPageModule' },
  { path: 'journal', loadChildren: './journal/journal.module#JournalPageModule' }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
