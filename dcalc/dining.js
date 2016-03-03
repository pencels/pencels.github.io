// ranges are inclusive of the first date and exclusive of the second
// [first, second)
const YEAR_START = new Date(2015, 8, 19); // start and end of dining plan term
const YEAR_END = new Date(2016, 5, 12);

const TH_BREAK_START = new Date(2015, 10, 26);
const TH_BREAK_END = new Date(2015, 10, 28);

const W_BREAK_START = new Date(2015, 11, 13);
const W_BREAK_END = new Date(2016, 0, 3);

const S_BREAK_START = new Date(2016, 2, 20);
const S_BREAK_END = new Date(2016, 2, 27);

const breaks = [TH_BREAK_START, TH_BREAK_END,
   W_BREAK_START, W_BREAK_END,
   S_BREAK_START, S_BREAK_END
];

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DINING_DAYS = nonHolidaysBetween(YEAR_START, YEAR_END);

function budgetOf(plan, balance) {
   var today = new Date();
   var duration = nonHolidaysBetween(YEAR_START, today);

   var spent = plan - balance;
   var expected = (plan / DINING_DAYS) * duration;

   return expected - spent;
}

// returns days between dates, accounting for holidays
function nonHolidaysBetween(start, end) {
   var breakdays = 0;

   for (var i = 0; i + 1 < breaks.length; i += 2) {
      if (after(end, breaks[i])) {
         if (before(end, breaks[i + 1])) {
            return daysBetween(start, breaks[i]) - breakdays;
         } else {
            breakdays += daysBetween(breaks[i], breaks[i + 1]);
         }
      }
   }

   return daysBetween(start, end) - breakdays;
}

// returns days between dates
function daysBetween(start, end) {
   var startSeconds = start.getTime();
   var endSeconds = end.getTime();

   var diff = endSeconds - startSeconds;

   var days = Math.floor(diff / MS_PER_DAY);
   return days;
}

// returns true if a date is in between the two others using inclusive start
// exclusive end
function inBetween(date, start, end) {
   return after(date, start) && before(date, end);
}

function after(given, other) {
   return given.getTime() >= other.getTime();
}

function before(given, other) {
   return given.getTime() < other.getTime();
}
