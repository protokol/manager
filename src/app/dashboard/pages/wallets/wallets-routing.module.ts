import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletsComponent } from '@app/dashboard/pages/wallets/wallets.component';
import { WalletDetailsComponent } from '@app/dashboard/pages/wallets/components/wallet-details/wallet-details.component';

const routes: Routes = [
  {
    path: '',
    component: WalletsComponent,
  },
  {
    path: ':id',
    component: WalletDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WalletsRoutingModule {}
