import { Pipe, PipeTransform } from '@angular/core';
import format from 'date-fns/format';
import { DateUtils } from '@core/utils/date-utils';

@Pipe({
  name: 'dateFnsFormat',
})
export class DateFnsFormatPipe implements PipeTransform {
  transform(
    value: Date | string | number,
    dateFormat: string = DateUtils.LongDate
  ): string {
    const date =
      typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : value;
    return format(date, dateFormat);
  }
}
