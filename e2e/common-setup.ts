const Application = require('spectron').Application;
const electronPath = require('electron');
const path = require('path');

export default function setup(): void {
  beforeEach(async function () {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')],
      webdriverOptions: {},
    });

    await this.app.start();
  });

  afterEach(async function () {
    if (this.app && this.app.isRunning()) {
      await this.app.stop();
    }
  });
}
