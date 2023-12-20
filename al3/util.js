function convertAl3Ascii(str) {
  return str.replace(/'c/g, 'ć')
            .replace(/[\^ˆ]c/g, 'ĉ')
            .replace(/"e/g, 'ë')
            .replace(/'g/g, 'ǵ')
            .replace(/[\^ˆ]g/g, 'ĝ')
            .replace(/'n/g, 'ń')
            .replace(/'s/g, 'ś')
            .replace(/[\^ˆ]s/g, 'ŝ');
}
