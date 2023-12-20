$(() => {
    $('#noun-form').on('submit', e => e.preventDefault());
});

function showDeclension() {
  let input = $('#noun-input');
  let word = input.val();
  word = convertAl3Ascii(word);
  input.val(word);
  let [declined, ok] = decline(word);
  if (ok) {
    display(declined);
  } else {
    alert(`"${word}" is not a valid noun.`);
  }
}

function decline(word) {
  let ending = word.slice(-1);
  let declined;
  if (isVowel(ending)) {
    declined = declineVowel(word);
  } else if (isNasalLiquid(ending)) {
    declined = declineNasalLiquid(word);
  } else if (isFricative(ending)) {
    declined = declineFricative(word);
  } else if (isAffricate(ending)) {
    declined = declineAffricate(word);
  }
  return [declined, isValidNoun(word)];
}

function isValidNoun(word) {
  if (word.length == 0) return false;

  let ending = word.slice(-1);
  return 'aeëioumnrsśŝćĉ'.includes(ending);
}

function loadInputButtons() {
    var list = document.getElementsByClassName('special-char');
    for (var i = 0; i < list.length; i++) {
        list[i].setAttribute('onmousedown', 'inputLetter(this)');
        list[i].setAttribute('onmouseup', 'resetButton(this)');
    }
}

function inputLetter(elem) {
    document.getElementById("noun-input").value += elem.value;
    elem.style.background = "#47C2BE";
}

function resetButton(elem) {
    document.getElementById("noun-input").focus();
    elem.style.background = "#287775";
}

function isVowel(letter) {
  return 'aeëiou'.includes(letter);
}

function isNasalLiquid(letter) {
  return 'mnr'.includes(letter);
}

function isFricative(letter) {
  return 'sśŝ'.includes(letter);
}

function isAffricate(letter) {
  // Note: yes this excludes ǵĝ but this is just for checking on nouns endings.
  return 'ćĉ'.includes(letter);
}

//accepts an array of 8 elements for the sg and pl forms of each case
function display(array) {
    document.getElementById("nomsg").innerHTML = array[0];
    document.getElementById("nompl").innerHTML = array[1];
    document.getElementById("accsg").innerHTML = array[2];
    document.getElementById("accpl").innerHTML = array[3];
    document.getElementById("gensg").innerHTML = array[4];
    document.getElementById("genpl").innerHTML = array[5];
    document.getElementById("oblsg").innerHTML = array[6];
    document.getElementById("oblpl").innerHTML = array[7];
    document.getElementById("decl-table").style.display = "inline-block";
}

function vowelChg(vowel, type) {
    if (type == "NOM V") {
        switch (vowel) {
            case "a":
                return "e";
            case "e":
                return "er";
            case "ë":
                return "ëa";
            case "i":
                return "ei";
            case "o":
                return "a";
            case "u":
                return "au";
            default:
                return ""
        }
    } else if (type == "GEN V") {
        switch (vowel) {
            case "a":
                return "e";
            case "e":
                return "e";
            case "ë":
                return "a";
            case "i":
                return "e";
            case "o":
                return "a";
            case "u":
                return "a";
            default:
                return ""
        }
    } else if (type == "NOM FR") {
        switch (vowel) {
            case "a":
                return "ai";
            case "e":
                return "i";
            case "ë":
                return "ëa";
            case "i":
                return "ei";
            case "o":
                return "a";
            case "u":
                return "uo";
            default:
                return ""
        }
    }
}

function declineVowel(n) {
    var results = [];
    var end = n.slice(-1);
    //nom sg
    results[0] = n;

    //nom pl
    results[1] = n.slice(0,-1) + vowelChg(end, "NOM V");

    //acc sg
    results[2] = n + "c";

    //acc pl
    if (n.slice(-2) == "na" || n.charAt(n.length-2) == "ńa")
        results[3] = n.slice(0,-1) + "na";
    else
        results[3] = n + "na";


    //gen sg
    results[4] = n.slice(0,-1) + vowelChg(end, "GEN V") + "m";

    //gen pl
    results[5] = n.slice(0,-1) + vowelChg(end, "GEN V") + "m" + end;

    //obl sg
    results[6] = n + "s";

    //obl pl
    results[7] = n + "f";

    return results;
}
function declineNasalLiquid(n) {
    var results = [];
    var end = n.slice(-1);
    //nom sg
    results[0] = n;

    //nom pl
    results[1] = n + "i";

    //acc sg
    if (end == "r")
        results[2] = n.slice(0,-2) + "r" + n.charAt(n.length-2) + "c";
    else
        results[2] = n + "ec";

    //acc pl
    if (end == "m")
        results[3] = n + "ma";
    else
        results[3] = n + "na";

    //gen sg
    if (end == "m")
        results[4] = n + "ba";
    else if (end == "n")
        results[4] = n + "da";
    else
        results[4] = n + "da";

    //gen pl
    if (end == "m")
        results[5] = n + "mu";
    else
        results[5] = n + "emu";

    //obl sg
    if (end == "r")
        results[6] = n.slice(0,-2) + "r" + n.charAt(n.length-2) + "s";
    else
        results[6] = n + "as";

    //obl pl
    results[7] = n + "fa";

    return results;
}
function declineFricative(n) {
    var results = [];
    var end = n.slice(-1);
    //nom sg
    results[0] = n;

    //nom pl
    results[1] = n.slice(0,-2) + vowelChg(n.charAt(n.length-2), "NOM FR") + end;

    //acc sg
    results[2] = n + "de";

    //acc pl
    results[3] = n + "na";

    //gen sg
    var syllonset = n.charAt(n.length-3);
    var combo = "";
    if (end == "ś") {
        if (syllonset == "t")
            combo = "ć";
        else if (syllonset == "d")
            combo = "ǵ";
        else if (isVowel(syllonset) || isFricative(syllonset) || isAffricate(syllonset))
            combo = syllonset + end;
        else
            combo = syllonset + n.charAt(n.length-2)+ end;
    } else if (end == "ŝ") {
        if (syllonset == "t")
            combo = "ĉ";
        else if (syllonset == "d")
            combo = "ĝ";
        else if (isVowel(syllonset) || isFricative(syllonset) || isAffricate(syllonset))
            combo = syllonset + end;
        else
            combo = syllonset + n.charAt(n.length-2)+ end;
    } else {
        if (isVowel(syllonset) || isFricative(syllonset) || isAffricate(syllonset))
            combo = syllonset + end;
        else
            combo = syllonset + n.charAt(n.length-2) + end;
    }
    results[4] = n.slice(0,-3) + combo + n.charAt(n.length-2) + "m";

    //gen pl
    results[5] = n.slice(0,-3) + combo + n.charAt(n.length-2) + "da";

    //obl sg
    results[6] = n;

    //obl pl
    results[7] = n + "of";

    return results;
}
function declineAffricate(n) {
    var results = [];
    var end = n.slice(-1);
    //nom sg
    results[0] = n;

    //nom pl
    results[1] = n.slice(0,-2) + vowelChg(n.charAt(n.length-2), "NOM FR") + end;

    //acc sg
    results[2] = n + "e";

    //acc pl
    results[3] = n + "ina";

    //gen sg
    results[4] = n + "em";

    //gen pl
    results[5] = n + "emu";

    //obl sg
    results[6] = n + "es";

    //obl pl
    results[7] = n + "of";

    return results;
}
