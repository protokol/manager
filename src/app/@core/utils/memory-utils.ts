export abstract class MemoryUtils {
  static toMb(kb): string {
    if (!kb) {
      return '0';
    }

    return (kb / 1024).toFixed(2);
  }

  static toGb(bytes): string {
    if (!bytes) {
      return '0';
    }

    return (bytes / 1024 / 1024 / 1024).toFixed(2);
  }

  static getBytesFromString(str: string) {
    return new Blob([str]).size;
  }
}
