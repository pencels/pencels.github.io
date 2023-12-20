// ranges are inclusive of the first date and exclusive of the second
// [first, second)
// Months start from 0!
const YEAR_START = new Date(2016, 8, 17); // start and end of dining plan term
const YEAR_END = new Date(2017, 5, 18);

// Thanksgiving break
const TH_BREAK_START = new Date(2016, 10, 24);
const TH_BREAK_END = new Date(2016, 10, 26);

// Winter break
const W_BREAK_START = new Date(2016, 11, 10);
const W_BREAK_END = new Date(2017, 0, 7);

// Spring break
const S_BREAK_START = new Date(2017, 2, 25);
const S_BREAK_END = new Date(2017, 3, 1);

const breaks = [TH_BREAK_START, TH_BREAK_END,
   W_BREAK_START, W_BREAK_END,
   S_BREAK_START, S_BREAK_END
];

const MS_PER_DAY = 1000 * 60 * 60 * 24; // milliseconds per day
const DINING_DAYS = nonHolidaysBetween(YEAR_START, YEAR_END);

function budgetOf(plan, balance) {
   var today = new Date();
   var duration = nonHolidaysBetween(YEAR_START, today);

   // Don't count days if year hasn't started yet
   if (duration < 0) duration = 0;

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
