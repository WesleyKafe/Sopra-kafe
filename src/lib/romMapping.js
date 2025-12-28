
// Mapeamento de extensões -> cores do EmulatorJS.
// Lista ampla (nem todas as cores estarão disponíveis dependendo do loader usado),
// mas cobre praticamente tudo que o EmulatorJS costuma suportar.
export const EXT_TO_CORE = {
  // Nintendo
  '.nes': { core: 'nes', console: 'NES' },
  '.fds': { core: 'nes', console: 'Famicom Disk System' },
  '.sfc': { core: 'snes', console: 'SNES' },
  '.smc': { core: 'snes', console: 'SNES' },
  '.fig': { core: 'snes', console: 'SNES' },
  '.swc': { core: 'snes', console: 'SNES' },
  '.gba': { core: 'gba', console: 'GBA' },
  '.gb': { core: 'gb', console: 'Game Boy' },
  '.gbc': { core: 'gbc', console: 'Game Boy Color' },
  '.n64': { core: 'n64', console: 'Nintendo 64' },
  '.z64': { core: 'n64', console: 'Nintendo 64' },
  '.v64': { core: 'n64', console: 'Nintendo 64' },
  '.nds': { core: 'nds', console: 'Nintendo DS' },

  // Sony
  '.iso': { core: 'psx', console: 'PlayStation' },
  '.bin': { core: 'psx', console: 'PlayStation' },
  '.cue': { core: 'psx', console: 'PlayStation' },
  '.pbp': { core: 'psx', console: 'PlayStation' },
  '.chd': { core: 'psx', console: 'PlayStation' },

  // Sega
  '.smd': { core: 'segaMD', console: 'Mega Drive' },
  '.gen': { core: 'segaMD', console: 'Mega Drive' },
  '.md': { core: 'segaMD', console: 'Mega Drive' },
  '.32x': { core: 'sega32x', console: 'Sega 32X' },
  '.sms': { core: 'segaMS', console: 'Master System' },
  '.gg': { core: 'segaGG', console: 'Game Gear' },
  '.sg': { core: 'segaSG', console: 'SG-1000' },
  '.cdi': { core: 'segaCD', console: 'Sega CD' },
  '.chd.sega': { core: 'segaCD', console: 'Sega CD' },

  // Atari
  '.a26': { core: 'atari2600', console: 'Atari 2600' },
  '.bin2600': { core: 'atari2600', console: 'Atari 2600' },
  '.a78': { core: 'atari7800', console: 'Atari 7800' },
  '.lynx': { core: 'lynx', console: 'Atari Lynx' },
  '.j64': { core: 'jaguar', console: 'Atari Jaguar' },
  '.jag': { core: 'jaguar', console: 'Atari Jaguar' },

  // NEC / Hudson
  '.pce': { core: 'pce', console: 'PC Engine' },
  '.sgx': { core: 'pce', console: 'SuperGrafx' },
  '.cue.pce': { core: 'pcecd', console: 'PC Engine CD' },
  '.iso.pce': { core: 'pcecd', console: 'PC Engine CD' },

  // SNK
  '.ngp': { core: 'ngp', console: 'Neo Geo Pocket' },
  '.ngc': { core: 'ngp', console: 'Neo Geo Pocket Color' },
  '.neo': { core: 'neogeo', console: 'Neo Geo' },

  // Arcade
  '.zip': { core: 'arcade', console: 'Arcade' },
  '.7z': { core: 'arcade', console: 'Arcade' },

  // Outros
  '.ws': { core: 'ws', console: 'WonderSwan' },
  '.wsc': { core: 'ws', console: 'WonderSwan Color' },
};

export const SUPPORTED_EXTENSIONS = Object.keys(EXT_TO_CORE);

export function detectCoreFromFilename(filename) {
  const lower = (filename || '').toLowerCase();

  // Casos especiais (extensões duplas)
  if (lower.endsWith('.cue') || lower.endsWith('.bin') || lower.endsWith('.iso') || lower.endsWith('.pbp') || lower.endsWith('.chd')) {
    return EXT_TO_CORE[lower.slice(lower.lastIndexOf('.'))] || null;
  }

  const dot = lower.lastIndexOf('.');
  if (dot === -1) return null;
  const ext = lower.slice(dot);
  return EXT_TO_CORE[ext] || null;
}
