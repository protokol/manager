export abstract class TextUtils {
  static clip(text) {
    if (!text || (text && text.length <= 12)) {
      return text || '';
    }
    return `${text.substring(0, 6)}…${text.slice(-6)}`;
  }

  static capitalizeFirst(str: string) {
    if (str.length > 1) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str;
  }

  static replaceWithTerminalBr(str: string) {
    if (!str) {
      return '';
    }
    return str.replace(/\n/g, '\n\r');
  }

  static strStart(str: string, length: number = 50) {
    if (!str || str.length < length) {
      return str || '';
    }
    return `${str.substring(0, length)}…`;
  }

  static getAttributeRegex() {
    return /^(?!\d)[\w$]+$/;
  }

  static getPassphraseRegex() {
    return /^(\w+\s){11}(\w+)$/;
  }
}
