import { networks } from '@env/networks';
import { version } from '@env/.version';
import { links } from '@env/links';
import { api } from '@env/api';

export const environment = {
  version,
  production: true,
  networks,
  links,
  api
};
