
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../auth/AuthContext';
import { getGames, saveGames } from '../../lib/storage';
import { detectCoreFromFilename, SUPPORTED_EXTENSIONS } from '../../lib/romMapping';
import { putRom } from '../../lib/romStore';
import { fetchWikiMetadata } from '../../lib/wikiMeta';

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function shortHash(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h.toString(16).slice(0, 8);
}

export default function ImportRoms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sendPublic, setSendPublic] = useState(false);
  const [status, setStatus] = useState({ running: false, ok: 0, skipped: 0, errors: 0 });
  const [log, setLog] = useState([]);

  const username = user?.username;

  const supportedLabel = useMemo(() => {
    return SUPPORTED_EXTENSIONS.join(', ');
  }, []);

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setStatus({ running: true, ok: 0, skipped: 0, errors: 0 });
    setLog([]);

    const games = getGames();
    const updates = [...games];

    let okCount = 0;
    for (const file of files) {
      try {
        const det = detectCoreFromFilename(file.name);
        if (!det?.core) {
          setStatus((s) => ({ ...s, skipped: s.skipped + 1 }));
          setLog((l) => [...l, `⏭️ Ignorado (extensão não suportada): ${file.name}`]);
          continue;
        }

        const rel = file.webkitRelativePath || file.name;
        const parts = rel.split('/').filter(Boolean);
        const tail = parts.length > 1 ? parts.slice(1).join('/') : parts[0];
        const romPath = `u/${username}/${tail}`;

        await putRom({ path: romPath, owner: username, file });

        const meta = await fetchWikiMetadata(file.name);
        const cleanedName = meta?.title || file.name.replace(/\.[^.]+$/, '');
        const nome = cleanedName;
        const descricao = meta?.description || `ROM importada (${det.console}).`;
        const capa = meta?.original || meta?.thumb || '';
        const id = `${slugify(nome)}-${shortHash(romPath)}`;

        const game = {
          id,
          nome,
          descricao,
          capa,
          core: det.core,
          console: det.console,
          url: `rom://${romPath}`,
          romPath,
          owner: username,
          status: sendPublic ? 'pending' : 'private',
          createdAt: Date.now(),
          wiki: meta ? { lang: meta.lang, pageUrl: meta.pageUrl, title: meta.title, query: meta.query } : null,
          source: 'import',
        };

        // evita duplicar pelo romPath
        const existingIdx = updates.findIndex((g) => g.romPath === romPath);
        if (existingIdx >= 0) updates[existingIdx] = { ...updates[existingIdx], ...game };
        else updates.push(game);

        okCount += 1;
        setStatus((s) => ({ ...s, ok: s.ok + 1 }));
        setLog((l) => [...l, `✅ Importado: ${file.name} → ${det.console} (${det.core})${sendPublic ? ' (pendente)' : ''}`]);
      } catch (err) {
        setStatus((s) => ({ ...s, errors: s.errors + 1 }));
        setLog((l) => [...l, `❌ Erro em ${file.name}: ${err?.message || String(err)}`]);
      }
    }

    saveGames(updates);
    setStatus((s) => ({ ...s, running: false }));

    // limpa o input para permitir importar a mesma pasta novamente, se quiser
    try { e.target.value = ''; } catch {}

    // leva o usuário para a lista dos jogos importados
    if (okCount > 0) navigate('/me/my-games');
  };

  return (
    <div className="appShell">
      <TopBar />
      <div className="container">
        <div className="card">
          <h2>Importar ROMs (PT-BR)</h2>
          <p className="muted">
            Selecione uma pasta. As ROMs serão salvas no seu navegador em <b>{`u/${username}/...`}</b> (IndexedDB).<br />
            Extensões suportadas: <span className="codeInline">{supportedLabel}</span>
          </p>

          <label className="rowInline">
            <input type="checkbox" checked={sendPublic} onChange={(e) => setSendPublic(e.target.checked)} />
            <span>Enviar para o público (vai para aprovação do Admin)</span>
          </label>

          <div className="rowInline" style={{ marginTop: 12 }}>
            <input
              type="file"
              multiple
              // @ts-ignore
              webkitdirectory="true"
              directory=""
              onChange={onPick}
              className="fileInput"
            />
          </div>

          <div style={{ marginTop: 12 }} className="chips">
            <span className="chip">Importados: {status.ok}</span>
            <span className="chip">Ignorados: {status.skipped}</span>
            <span className="chip">Erros: {status.errors}</span>
            {status.running && <span className="chip">Processando...</span>}
          </div>

          <div className="logBox">
            {log.length === 0 ? <div className="muted">Nenhuma ação ainda.</div> : log.map((line, i) => <div key={i}>{line}</div>)}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="btn" to="/me/my-games">Ver meus jogos</Link>
            <Link className="btn" to="/">Ir para a Home</Link>
          </div>

          <p className="muted" style={{ marginTop: 12 }}>
            Dica: nomes de ROM com (USA), [!], etc. são “limpos” automaticamente para melhorar a busca na Wikipedia.
          </p>
        </div>
      </div>
    </div>
  );
}
