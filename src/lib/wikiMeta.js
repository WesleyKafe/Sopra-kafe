
const WIKI_LANGS = ['pt', 'en'];

// limpa nomes típicos de rom: "Game (USA) [!].sfc" -> "Game"
export function cleanRomTitle(name) {
  return (name || '')
    .replace(/\.[^.]+$/, '') // remove extensão
    .replace(/[\[\(].*?[\]\)]/g, ' ') // remove [..] e (..)
    .replace(/[_\.]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchTitle(lang, query) {
  const q = encodeURIComponent(query);
  const url = `https://${lang}.wikipedia.org/w/rest.php/v1/search/page?q=${q}&limit=5`;
  const data = await fetchJson(url);
  const pages = data?.pages || [];
  // pega o primeiro que pareça jogo (heurística simples)
  return pages[0]?.title || null;
}

async function getSummary(lang, title) {
  const t = encodeURIComponent(title);
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${t}`;
  const data = await fetchJson(url);
  const description = data?.extract || data?.description || '';
  const thumb = data?.thumbnail?.source || null;
  const original = data?.originalimage?.source || null;
  const pageUrl = data?.content_urls?.desktop?.page || null;
  return { description, thumb, original, pageUrl, title: data?.title || title };
}

export async function fetchWikiMetadata(rawName) {
  const cleaned = cleanRomTitle(rawName);
  if (!cleaned) return null;

  for (const lang of WIKI_LANGS) {
    try {
      const title = await searchTitle(lang, cleaned);
      if (!title) continue;
      const sum = await getSummary(lang, title);
      // Só aceita se tiver pelo menos descrição ou imagem
      if ((sum.description && sum.description.length > 20) || sum.thumb || sum.original) {
        return { ...sum, lang, query: cleaned };
      }
    } catch {
      // tenta próximo idioma
    }
  }
  return null;
}
