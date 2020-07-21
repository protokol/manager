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
}
