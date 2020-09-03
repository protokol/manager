import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  UserOutline,
  LockOutline,
  WalletOutline,
  DashOutline,
  BlockOutline,
  SearchOutline,
  FundOutline,
  ApiOutline,
  ClusterOutline,
  BookOutline,
  LoadingOutline,
  DeleteOutline,
  QuestionCircleOutline,
  StarOutline,
} from '@ant-design/icons-angular/icons';

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  UserOutline,
  LockOutline,
  WalletOutline,
  DashOutline,
  BlockOutline,
  SearchOutline,
  FundOutline,
  ApiOutline,
  ClusterOutline,
  BookOutline,
  LoadingOutline,
  DeleteOutline,
  QuestionCircleOutline,
  StarOutline,
];

@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [{ provide: NZ_ICONS, useValue: icons }],
})
export class IconsProviderModule {}
