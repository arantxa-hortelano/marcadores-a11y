/* Utilidades de contraste de color (WCAG 2.2) */

function parseColorToRgb(colorStr) {
  if (!colorStr || colorStr === 'transparent') return null;
  var tmp = document.createElement('div');
  tmp.style.cssText = 'display:none;color:' + colorStr;
  document.body.appendChild(tmp);
  var computed = getComputedStyle(tmp).color;
  document.body.removeChild(tmp);
  var m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return {
    r: parseInt(m[1]),
    g: parseInt(m[2]),
    b: parseInt(m[3]),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1
  };
}

function relativeLuminance(rgb) {
  var r = rgb.r / 255;
  var g = rgb.g / 255;
  var b = rgb.b / 255;
  r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(c1, c2) {
  var l1 = relativeLuminance(c1);
  var l2 = relativeLuminance(c2);
  var lighter = Math.max(l1, l2);
  var darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function blendWithBackground(fg, bg) {
  if (fg.a >= 1) return fg;
  var a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1
  };
}

function getEffectiveBackground(el) {
  var current = el.parentElement;
  while (current && current !== document.documentElement) {
    var bg = getComputedStyle(current).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      var parsed = parseColorToRgb(bg);
      if (parsed && parsed.a > 0) return parsed;
    }
    current = current.parentElement;
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

function isLargeText(el) {
  var style = getComputedStyle(el);
  var fontSize = parseFloat(style.fontSize);
  var fontWeight = parseInt(style.fontWeight) || 400;
  var isBold = fontWeight >= 700;
  return fontSize >= 18 || (isBold && fontSize >= 14);
}
