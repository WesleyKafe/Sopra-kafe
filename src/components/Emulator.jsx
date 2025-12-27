import React, { useEffect, useRef } from 'react';

const Emulator = ({ gameUrl, core }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Limpa qualquer emulador anterior para não encavalar
    if (window.EJS_player) {
      window.EJS_player = null;
    }
    const existingScript = document.getElementById('emulator-script');
    if (existingScript) existingScript.remove();

    // 2. Configurações Globais do EmulatorJS
    window.EJS_player = '#game';
    window.EJS_core = core; // Ex: 'snes', 'segaMD'
    window.EJS_gameUrl = gameUrl;
    window.EJS_pathtodata = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/'; // Puxa o motor da CDN
    window.EJS_startOnLoaded = true;
    window.EJS_DEBUG_XX = true; // Ajuda a ver erros se tiver

    // 3. Injeta o script do emulador dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js';
    script.id = 'emulator-script';
    script.async = true;
    
    document.body.appendChild(script);

    // Cleanup quando sair da tela
    return () => {
      const scriptToRemove = document.getElementById('emulator-script');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [gameUrl, core]); // Recarrega se mudar o jogo

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
      <div id="game"></div>
    </div>
  );
};

export default Emulator;