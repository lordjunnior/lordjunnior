/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Folder, 
  FileCode, 
  Search, 
  ArrowLeft, 
  LogOut, 
  X, 
  Loader2, 
  Play, 
  Plus, 
  Check, 
  AlertCircle,
  Database,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  googleSignIn, 
  logout, 
  listDriveContents, 
  fetchDriveFileBlob, 
  uploadLibraryBackup, 
  downloadLibraryBackup, 
  DriveItem, 
  getAccessToken,
  auth
} from '../utils/googleDrive';
import { User } from 'firebase/auth';
import { System, Game } from '../types';
import { soundEngine } from './RetroSoundEngine';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: System[];
  setSystems: React.Dispatch<React.SetStateAction<System[]>>;
  onPlayCustomRom: (systemId: string, gameTitle: string, romBlobUrl: string, romName: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  systems,
  setSystems,
  onPlayCustomRom
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // File explorer state
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [driveItems, setDriveItems] = useState<DriveItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Import dialog states
  const [selectedRom, setSelectedRom] = useState<DriveItem | null>(null);
  const [importSystemId, setImportSystemId] = useState<string>('nes');
  const [importTitle, setImportTitle] = useState<string>('');

  // Setup login on open check
  useEffect(() => {
    if (isOpen) {
      soundEngine.playSelect();
      const currentToken = getAccessToken();
      if (currentToken) {
        setToken(currentToken);
        // Sync with firebase auth state
        const firebaseAuthUser = auth.currentUser;
        if (firebaseAuthUser) {
          setUser(firebaseAuthUser);
        }
        loadFolder('root');
      }
    }
  }, [isOpen]);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      soundEngine.playToggle();
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setSuccessMsg(`Bem-vindo, ${res.user.displayName}! Google Drive conectado.`);
        loadFolder('root');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar com o Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    soundEngine.playBack();
    const confirmed = window.confirm('Deseja realmente desconectar sua conta do Google Drive?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setDriveItems([]);
      setFolderHistory([]);
      setCurrentFolderId('root');
    } catch (err: any) {
      setErrorMsg('Erro ao desconectar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolder = async (folderId: string, isBackingUp: boolean = false) => {
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const items = await listDriveContents(folderId);
      setDriveItems(items);
      setCurrentFolderId(folderId);
    } catch (err: any) {
      setErrorMsg('Erro ao navegar nos arquivos do Google Drive.');
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    soundEngine.playToggle();
    setFolderHistory(prev => [...prev, currentFolderId]);
    loadFolder(folderId);
  };

  const navigateBack = () => {
    if (folderHistory.length === 0) return;
    soundEngine.playBack();
    const prevHistory = [...folderHistory];
    const prevFolder = prevHistory.pop() || 'root';
    setFolderHistory(prevHistory);
    loadFolder(prevFolder);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playToggle();
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const items = await listDriveContents(currentFolderId, searchQuery);
      setDriveItems(items);
    } catch (err: any) {
      setErrorMsg('Nenhum resultado para a busca.');
    } finally {
      setIsSearching(false);
    }
  };

  // Import game into selected system console
  const handleImportRom = (rom: DriveItem) => {
    soundEngine.playToggle();
    setSelectedRom(rom);
    // Sanitize title
    const cleanTitle = rom.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    setImportTitle(cleanTitle);

    // Auto-detect system shortName based on suffix
    const ext = rom.name.split('.').pop()?.toLowerCase();
    if (ext === 'nes') setImportSystemId('nes');
    else if (ext === 'sfc' || ext === 'smc') setImportSystemId('snes');
    else if (ext === 'gba') setImportSystemId('gba');
    else if (ext === 'gb' || ext === 'gbc') setImportSystemId('gb');
    else if (ext === 'z64' || ext === 'n64') setImportSystemId('n64');
    else if (ext === 'bin') setImportSystemId('megadrive');
  };

  const executeImport = () => {
    if (!selectedRom) return;
    soundEngine.playSelect();

    setSystems(prevSystems => {
      const updated = prevSystems.map(sys => {
        if (sys.id === importSystemId) {
          // Check for duplication
          if (sys.games.some(g => g.id === selectedRom.id)) {
            setErrorMsg('Este jogo já foi importado neste console.');
            return sys;
          }

          const newGame: Game = {
            id: selectedRom.id,
            title: importTitle,
            developer: 'Importado de Drive',
            publisher: 'Google Cloud Drive',
            year: new Date().getFullYear().toString(),
            genre: 'Custom / ROM',
            players: '1-2 Players',
            rating: 5,
            description: `Jogo importado diretamente do seu Google Drive. Arquivo original: "${selectedRom.name}". Tamanho: ${selectedRom.size ? (parseInt(selectedRom.size) / (1024 * 1024)).toFixed(2) + ' MB' : 'Desconhecido'}.`,
            image: '/covers/default_cover.jpg', // Placeholder cover
            romUrl: `DRIVE_FILE_ID:${selectedRom.id}`, // Custom flag
            favorite: false
          };

          const newGamesList = [...sys.games, newGame];
          
          // Save to local storage for persistent retro hubs
          localStorage.setItem(`retro_custom_system_${importSystemId}`, JSON.stringify(newGamesList));

          return {
            ...sys,
            gameCount: newGamesList.length,
            games: newGamesList
          };
        }
        return sys;
      });

      return updated;
    });

    setSuccessMsg(`"${importTitle}" importado com sucesso para ${importSystemId.toUpperCase()}!`);
    setSelectedRom(null);
  };

  // Play ROM instantly from Drive
  const handlePlayDriveFile = async (rom: DriveItem) => {
    soundEngine.playSelect();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const blob = await fetchDriveFileBlob(rom.id);
      const url = URL.createObjectURL(blob);
      
      // Auto-detect system console
      const ext = rom.name.split('.').pop()?.toLowerCase();
      let detectedSystemId = 'nes';
      if (ext === 'nes') detectedSystemId = 'nes';
      else if (ext === 'sfc' || ext === 'smc') detectedSystemId = 'snes';
      else if (ext === 'gba') detectedSystemId = 'gba';
      else if (ext === 'gb' || ext === 'gbc') detectedSystemId = 'gb';
      else if (ext === 'z64' || ext === 'n64') detectedSystemId = 'n64';
      else if (ext === 'bin') detectedSystemId = 'megadrive';

      onPlayCustomRom(detectedSystemId, rom.name.replace(/\.[^/.]+$/, ''), url, rom.name);
      onClose(); // Hide modal to see the active console in the workspace!
    } catch (err: any) {
      setErrorMsg('Falha ao baixar ROM executável do Drive. Verifique suas conexões e limites.');
    } finally {
      setIsLoading(false);
    }
  };

  // Backup entire systems, customized libraries and imported games
  const handleBackupToCloud = async () => {
    soundEngine.playToggle();
    const confirmed = window.confirm(
      'Fazer backup agora? Isso irá salvar sua biblioteca customizada e lista de jogos importados no Google Drive (arquivo retro_hub_backup.json).'
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Gather only custom configs from local storage to keep sizes minimal
      const backupData: Record<string, any> = {};
      const consoleKeys = ['nes', 'snes', 'gba', 'gb', 'n64', 'megadrive', 'genesis'];
      consoleKeys.forEach(sysId => {
        const custom = localStorage.getItem(`retro_custom_system_${sysId}`);
        if (custom) {
          backupData[sysId] = JSON.parse(custom);
        }
      });

      await uploadLibraryBackup(backupData);
      setSuccessMsg('Backup de segurança realizado com sucesso em seu Google Drive!');
      loadFolder(currentFolderId);
    } catch (err: any) {
      setErrorMsg('Falha ao criar arquivo de backup na nuvem.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    soundEngine.playSelect();
    const confirmed = window.confirm(
      'Deseja restaurar sua biblioteca a partir do backup em nuvem? Os jogos importados localmente serão substituídos pelo arquivo salvo no Google Drive.'
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const cloudData = await downloadLibraryBackup();
      if (!cloudData) {
        setErrorMsg('Nenhum arquivo de backup ("retro_hub_backup.json") localizado em seu Google Drive.');
        return;
      }

      // Merge and update browser localStorage
      Object.keys(cloudData).forEach(sysId => {
        localStorage.setItem(`retro_custom_system_${sysId}`, JSON.stringify(cloudData[sysId]));
      });

      // Reload files in browser state
      setSystems(prevSystems => {
        return prevSystems.map(sys => {
          const cloudGames = cloudData[sys.id];
          if (cloudGames) {
            return {
              ...sys,
              gameCount: cloudGames.length,
              games: cloudGames
            };
          }
          return sys;
        });
      });

      setSuccessMsg('Sua biblioteca retro foi perfeitamente restaurada a partir do Google Drive!');
    } catch (err: any) {
      setErrorMsg('Falha ao descarregar backup da nuvem.');
    } finally {
      setIsSyncing(false);
    }
  };

  const isZipOrRom = (name: string): boolean => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return ['zip', 'nes', 'sfc', 'smc', 'gba', 'gb', 'gbc', 'n64', 'z64', 'bin'].includes(ext);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Cybernetic Gamepad Console Glass Panel */}
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0c0c0e] border-2 border-red-600/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(230,0,18,0.25)] flex flex-col font-mono text-zinc-100 z-10 animate-scale-up">
        
        {/* Glowing Retro Console Neon Header */}
        <div className="flex justify-between items-center bg-black/50 px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-red-500 animate-pulse" />
            <div>
              <span className="text-[10px] font-retro text-[#E60012] block tracking-widest leading-none">
                MÓDULO DE REDE NUVEM
              </span>
              <h2 className="text-sm font-black font-display text-white mt-0.5 tracking-wider">
                CENTRAL DE CONEXÃO GOOGLE DRIVE
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600 border border-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Alerts Banner */}
        {errorMsg && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center gap-2.5 text-xs text-emerald-400">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Layout Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Left Panel: Auth & Sync Desk Dashboard */}
          <div className="w-full md:w-80 bg-black/30 border-r border-white/5 p-6 flex flex-col justify-between gap-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-black text-zinc-400 tracking-wider">STATUS DE AUTORIZAÇÃO</h3>
                <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                  Conecte seu Google Drive para gerenciar ROMs, descarregar jogos diretamente na cabine emuladora e sincronizar backups.
                </p>
              </div>

              {/* Login State Card */}
              {!token ? (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full gsi-material-button flex items-center justify-center p-0 rounded-xl cursor-pointer hover:shadow-lg hover:shadow-red-500/5 transition-all"
                  id="google-signin-btn"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents" style={{ fontSize: '13px' }}>Conectar Drive</span>
                  </div>
                </button>
              ) : (
                <div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                      {user?.displayName ? user.displayName[0].toUpperCase() : 'G'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate text-white">{user?.displayName || 'Jogador Nuvem'}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'drive_user@gmail.com'}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full py-1.5 rounded-lg border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition cursor-pointer text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar Conta</span>
                  </button>
                </div>
              )}

              {/* Sync Dashboard Features */}
              {token && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] font-bold text-zinc-500 tracking-wider">SALVAMENTO RETRO NUVEM</h4>
                  
                  <button
                    onClick={handleBackupToCloud}
                    disabled={isSyncing}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                    <span>Backup de Biblioteca</span>
                  </button>

                  <button
                    onClick={handleRestoreFromCloud}
                    disabled={isSyncing}
                    className="w-full py-2 bg-[#121214] hover:bg-zinc-900 border border-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                    <span>Restaurar Backup</span>
                  </button>

                  <div className="text-[10px] text-zinc-500 text-left font-sans leading-normal bg-white/5 p-3 rounded-lg border border-white/5 mt-2">
                    💡 <strong>O que salva?</strong> Jogos customizados criados ou importados em qualquer console deste Hub Retro local.
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostic watermark info */}
            <div className="text-[9px] text-zinc-600 text-center border-t border-white/5 pt-4">
              <span>CLOUD_VERSION: 1.0.0_STABLE</span>
            </div>
          </div>

          {/* Right Panel: Interactive Google Drive Files Explorer */}
          <div className="flex-1 flex flex-col min-h-0 p-6 bg-black/10">
            {!token ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <Cloud className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm">Nuvem Protegida por Cadastro</h3>
                  <p className="text-zinc-500 text-xs font-sans max-w-sm mx-auto">
                    Faça login com sua conta do Google para escanear roms, downloads de arquivos e retro-sync de sua biblioteca.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                {/* Search & Breadcrumb bar */}
                <div className="flex gap-2">
                  <form onSubmit={handleSearch} className="flex-1 flex gap-1 bg-zinc-900 rounded-xl border border-white/10 px-3 py-1.5 focus-within:border-red-500 transition">
                    <Search className="w-4 h-4 text-zinc-400 mt-1" />
                    <input
                      type="text"
                      placeholder="Buscar por ROMs (ex: .zip, mario, nes)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-0 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button type="submit" className="hidden" />
                  </form>

                  {folderHistory.length > 0 && (
                    <button
                      onClick={navigateBack}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 border border-white/5 cursor-pointer flex items-center gap-1 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>
                  )}
                </div>

                {/* Main Explorer Item Grid Grid */}
                <div className="flex-1 overflow-y-auto border border-white/5 rounded-2xl bg-[#09090b]/40 divide-y divide-white/5">
                  {isSearching ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                  ) : driveItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 font-sans">
                      <p className="text-sm font-semibold text-zinc-400">Esta pasta está vazia</p>
                      <p className="text-xs text-zinc-500 max-w-xs">Nenhum arquivo ou subpasta localizada neste diretório do Drive.</p>
                    </div>
                  ) : (
                    driveItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3.5 hover:bg-white/5 transition group cursor-default"
                      >
                        {/* Left Side: Meta/Indicator */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {item.mimeType === 'application/vnd.google-apps.folder' ? (
                            <Folder className="w-5 h-5 text-amber-400 flex-shrink-0 cursor-pointer" onClick={() => navigateToFolder(item.id, item.name)} />
                          ) : (
                            <FileCode className={`w-5 h-5 flex-shrink-0 ${isZipOrRom(item.name) ? 'text-red-500' : 'text-zinc-500'}`} />
                          )}

                          <div className="min-w-0 text-left">
                            <p 
                              className={`text-xs truncate font-bold ${
                                item.mimeType === 'application/vnd.google-apps.folder' 
                                  ? 'text-amber-300 cursor-pointer hover:underline' 
                                  : 'text-zinc-200'
                              }`}
                              onClick={() => {
                                if (item.mimeType === 'application/vnd.google-apps.folder') {
                                  navigateToFolder(item.id, item.name);
                                }
                              }}
                            >
                              {item.name}
                            </p>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {item.mimeType === 'application/vnd.google-apps.folder' 
                                ? 'PASTA' 
                                : item.size 
                                  ? `${(parseInt(item.size) / (1024 * 1024)).toFixed(2)} MB` 
                                  : 'ARQUIVO'}
                            </span>
                          </div>
                        </div>

                        {/* Right Side: Action Trigger buttons */}
                        <div className="flex items-center gap-2">
                          {item.mimeType !== 'application/vnd.google-apps.folder' && isZipOrRom(item.name) && (
                            <>
                              <button
                                onClick={() => handlePlayDriveFile(item)}
                                disabled={isLoading}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                                title="Fazer download automático e jogar agora nesta cabine!"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>JOGAR</span>
                              </button>

                              <button
                                onClick={() => handleImportRom(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                                title="Cadastrar ROM na biblioteca local"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>CADASTRAR</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Custom ROM Configuration Dialog box modal overlay */}
        {selectedRom && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
            <div className="bg-zinc-950 border-2 border-red-600/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(230,0,18,0.3)] text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-display font-black text-white text-sm">CADASTRAR NOVA ROM DO DRIVE</h3>
              </div>
              
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Configure os parâmetros de sua ROM para salvá-la localmente. O arquivo original permanecerá seguro em seu Google Drive.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold block mb-1">ARQUIVO DE ORIGEM</label>
                  <p className="text-xs text-zinc-300 font-sans break-all truncate bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{selectedRom.name}</p>
                </div>

                <div>
                  <label className="text-[9px] text-zinc-500 font-bold block mb-1">CONSERVAR TÍTULO DO JOGO</label>
                  <input
                    type="text"
                    required
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-zinc-500 font-bold block mb-1">SELECIONAR SISTEMA / CONSOLE</label>
                  <select
                    value={importSystemId}
                    onChange={(e) => setImportSystemId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {systems.map(sys => (
                      <option key={sys.id} value={sys.id}>
                        {sys.name} ({sys.shortName.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={executeImport}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer transition text-center"
                >
                  Confirmar Cadastro
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRom(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs cursor-pointer transition text-center animate-pulse"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
