import { Pipe, PipeTransform } from '@angular/core';
import { DateTime, LocaleOptions } from "luxon";

@Pipe({
  name: 'feedDatePipe'
})
export class FeedDatePipe implements PipeTransform {

  transform(value: number, format: string = 'full'): string {
    const date = DateTime.fromMillis(value);
    return date.setLocale("fr").toLocaleString(
      (format == 'full' ? DateTime.DATETIME_HUGE : DateTime.DATETIME_SHORT_WITH_SECONDS) as (LocaleOptions & Intl.DateTimeFormatOptions)
    );
    // DATETIME_HUGE | DATETIME_SHORT_WITH_SECONDS | https://moment.github.io/luxon/#/formatting
  }

}
