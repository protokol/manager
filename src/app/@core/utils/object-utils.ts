export abstract class ObjectUtils {
  static removeEmpty(obj) {
    return Object.entries(obj).forEach(([key, val]) => {
      if (val && typeof val === 'object') {
        ObjectUtils.removeEmpty(val);
      } else if (val == null) {
        delete obj[key];
      }
    });
  }
}
