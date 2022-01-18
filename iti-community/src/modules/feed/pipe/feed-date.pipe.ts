import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from "luxon";

@Pipe({
  name: 'feedDatePipe'
})
export class FeedDatePipe implements PipeTransform {

  transform(value: number): string {
    const date = DateTime.fromMillis(value);
    return date.setLocale("fr").toLocaleString(DateTime.DATETIME_HUGE);
    // DATETIME_SHORT_WITH_SECONDS | https://moment.github.io/luxon/#/formatting
  }

}
