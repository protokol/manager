export abstract class ElectronUtils {
  static isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
