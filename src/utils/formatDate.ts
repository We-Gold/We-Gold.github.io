import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(localizedFormat);
dayjs.extend(utc);

// Formats a frontmatter date for display, e.g. "Aug 10, 2026".
//
// Must be `dayjs.utc`, not `dayjs`. A frontmatter `pubDate: 2026-08-10` is a
// calendar date, but `z.coerce.date()` turns it into `new Date("2026-08-10")`,
// which the spec says is UTC midnight — an *instant*. Formatting that instant in
// any timezone behind UTC lands on the previous evening, so the site rendered
// "Aug 9, 2026" for a post dated the 10th. Every date on the site was a day
// early for roughly half the world, including its author.
//
// Reading it back out in UTC undoes the coercion and recovers the date that was
// actually written. There is no time-of-day component to lose.
//
// This only holds because every frontmatter date in src/content/ is written
// unquoted as YYYY-MM-DD, which YAML types as a timestamp and lands on UTC
// midnight. A *quoted* date like "Jun 3 2024" reaches `new Date` as a string
// and is parsed as *local* midnight instead — formatting that in UTC moves it a
// day the other way, ahead of UTC rather than behind. The blog was written that
// way originally and has been converted. Keep new dates unquoted and ISO.
export function formatDate(date: Date | string): string {
    return dayjs.utc(date).format("ll");
}
