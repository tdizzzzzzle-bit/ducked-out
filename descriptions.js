// Loads duck descriptions from descriptions.txt
// Format: id///display name///image///short description///full description
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
      if (parts.length >= 5) {
        var id = parts[0].trim().toLowerCase();
        result[id] = {
          displayName: parts[1].trim(),
          image:       parts[2].trim(),
          short:       parts[3].trim(),
          full:        parts[4].trim(),
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
