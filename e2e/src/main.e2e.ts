import { expect } from 'chai';
import { SpectronClient } from 'spectron';

import commonSetup from '../common-setup';

describe('protokol-manager App', function() {
  commonSetup.apply(this);

  let client: SpectronClient;

  beforeEach(function() {
    client = this.app.client;
  });

  it('creates initial window', async () => {
    const count = await client.getWindowCount();
    expect(count).to.equal(1);
  });

  it('should display login title', async () => {
    const elem = await client.$('app-login > div > div > h1');
    const text = await elem.getText();
    expect(text).to.equal('Login');
    expect(true).to.equal(true);
  });
});
