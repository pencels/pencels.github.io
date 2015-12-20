var PLANS = [
   ['Select', 3900],
   ['Lite', 3255],
   ['Budget', 2690],
   ['Lean', 2525]
]

var VIABLE_ALLOWANCE = 10.00;

main();

function main() {
   var plansWrapper = $('.plans');

   for (var i = 0; i < PLANS.length; i++) {
      var planInfo = document.createElement('h3');
      planInfo.innerHTML = 'Triton<br>' + PLANS[i][0];
      var planAmount = document.createElement('p');
      planAmount.innerHTML = '$' + PLANS[i][1];

      var elems = [planInfo, planAmount];
      $('.plans' + (Math.floor(i/2) + 1)).appendChild(createButton(elems));
   }

   $('.balance-input').addEventListener('keyup', update);
}

function createButton(innerElems) {
   var newInfo = document.createElement('div');
   newInfo.setAttribute('class', 'button-info');

   for (var elem of innerElems) {
      newInfo.appendChild(elem);
   }

   var newButton = document.createElement('div');
   newButton.setAttribute('class', 'plan-button');
   newButton.appendChild(newInfo);

   newButton.addEventListener('click', pressButton);

   return newButton;
}

// runs when a plan button has been pressed
function pressButton() {
   var pressed = $('.plan-button.pressed');
   if (pressed) pressed.setAttribute('class', 'plan-button');
   this.setAttribute('class', 'plan-button pressed');

   update();
}

function update() {
   var values = readInput();
   var left = NaN; // how much the person has left
   if (values.indexOf(null) < 0)
      left = budgetOf.apply(this, values);

   left = hth_round(left); // round left to hdrths place

   var infopars = $('div.budget-options').childNodes;
   for (var i = 0; i < infopars.length; i++) {
      infopars[i].innerHTML = ''; // empty paragraphs
   }

   if (isNaN(left)) return;

   var message;
   if (left >= 0) {
      message = 'Congratulations! You have been thrifty and have $' + left +
      ' extra left to spend.';
   } else {
      message = 'Oops, you have been over-spending and need to make up for $' +
                Math.abs(left) + ' spent in excess.';
      allowanceAdvice(values[0], left); // plug it
   }

   $('.budget-results').innerHTML = message;
}

function readInput() {
   var pressedButton = $('.pressed p');
   var currBalance = parseFloat($('.balance-input').value);
   if (pressedButton != null && !isNaN(currBalance)) {
      var planMoney = parseInt(pressedButton.innerHTML.substring(1));
      return [planMoney, currBalance];
   }
   return [null, null];
}

function allowanceAdvice(plan, owe) {
   var advice = $('.budget-advice');
   var daysremaining = nonHolidaysBetween(new Date(), YEAR_END);
   var allowance = hth_round((plan / DINING_DAYS) + (owe / daysremaining));
   advice.innerHTML = '<p>This can be fixed by reducing your daily spending ' +
                      'allowance to $' + allowance + '/day.</p>';
   if (allowance < VIABLE_ALLOWANCE) { // plug food pantry
      advice.innerHTML += '<br><p>Since this new allowance is too low to be ' +
                          'sufficient for daily eating, it\'s recommended ' +
                          'that you check out the Triton Food Pantry:</p>' +
                          '<ul><li>Location: The Original Student Center, ' +
                          'next to the AS Soft Reserves.</li>' +
                          '<li>MWF: 9am - 1pm</li>' +
                          '<li>TuTh: 3pm - 6pm</li></ul>';
   }
}

// rounds to hundredths place
function hth_round(n) {
   n = Math.round(+(n + 'e2'));
   return +(n + 'e-2');
}

function $(elem) {
   return document.querySelector(elem);
}

function $$(elems) {
   return document.querySelectorAll(elems);
}
