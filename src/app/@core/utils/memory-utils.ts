export abstract class MemoryUtils {
  static toMb(kb): string {
    if (!kb) {
      return '0';
    }

    return (kb / 1024).toFixed(2);
  }
}
