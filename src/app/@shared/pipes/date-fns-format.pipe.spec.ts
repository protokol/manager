import { DateFnsFormatPipe } from './date-fns-format.pipe';
import { DateUtils } from '@core/utils/date-utils';

describe('DateFnsFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new DateFnsFormatPipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform short time format', () => {
    const pipe = new DateFnsFormatPipe();
    expect(pipe.transform(new Date(2000, 0, 1), DateUtils.ShortDate)).toBe(
      '01.01.2000'
    );
  });

  it('should transform default format', () => {
    const pipe = new DateFnsFormatPipe();
    expect(pipe.transform(new Date(2000, 0, 1, 11, 11))).toBe(
      '01.01.2000 11:11'
    );
  });
});
