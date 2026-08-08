// Loads duck descriptions from descriptions.txt
// Format per line: id///short description///full description
var _descCache = null;

async function loadDescriptions() {
  if (_descCache) return _descCache;
  try {
    var text = await fetch('descriptions.txt?v=' + Date.now()).then(function(r) { return r.text(); });
    var result = {};
    text.split('\n').forEach(function(line) {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      var parts = line.split('///');
      if (parts.length >= 3) {
        var id = parts[0].trim().toLowerCase();
        result[id] = {
          short: parts[1].trim(),
          full:  parts[2].trim(),
        };
      }
    });
    _descCache = result;
    return result;
  } catch(e) {
    console.log('Could not load descriptions.txt, using fallback');
    return {};
  }
}
