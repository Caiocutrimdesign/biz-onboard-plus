import { useCallback, useEffect, useRef } from 'react';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SyncResult {
  success: boolean;
  message: string;
  timestamp: Date;
  pushedTo: string[];
}

interface LovableSyncConfig {
  autoSync: boolean;
  syncAfterCommit: boolean;
  verifyDeployment: boolean;
  remotes: string[];
}

const DEFAULT_CONFIG: LovableSyncConfig = {
  autoSync: true,
  syncAfterCommit: true,
  verifyDeployment: true,
  remotes: ['origin', 'lovable'],
};

export function useLovableAutoSync(config: LovableSyncConfig = DEFAULT_CONFIG) {
  const isRunningRef = useRef(false);
  const lastSyncRef = useRef<Date | null>(null);
  const syncHistoryRef = useRef<SyncResult[]>([]);

  const runCommand = useCallback(async (command: string, cwd?: string): Promise<{ stdout: string; stderr: string; error?: Error }> => {
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: cwd || process.cwd(),
        timeout: 60000,
      });
      return { stdout, stderr };
    } catch (error: any) {
      return { 
        stdout: error.stdout || '', 
        stderr: error.stderr || error.message,
        error 
      };
    }
  }, []);

  const checkGitStatus = useCallback(async (): Promise<{ clean: boolean; changes: number }> => {
    try {
      const { stdout } = await runCommand('git status --short');
      const lines = stdout.trim().split('\n').filter(Boolean);
      return {
        clean: lines.length === 0,
        changes: lines.length,
      };
    } catch {
      return { clean: true, changes: 0 };
    }
  }, [runCommand]);

  const commitAndPush = useCallback(async (message?: string): Promise<SyncResult> => {
    if (isRunningRef.current) {
      return {
        success: false,
        message: 'Sincronização já está em andamento',
        timestamp: new Date(),
        pushedTo: [],
      };
    }

    isRunningRef.current = true;
    const result: SyncResult = {
      success: false,
      message: '',
      timestamp: new Date(),
      pushedTo: [],
    };

    try {
      const status = await checkGitStatus();
      
      if (!status.clean) {
        await runCommand('git add -A');
        
        const { stdout: diff } = await runCommand('git diff --cached --stat');
        
        if (diff) {
          const commitMessage = message || `chore: auto-sync - ${new Date().toLocaleString('pt-BR')}`;
          await runCommand(`git commit -m "${commitMessage}"`);
          result.message = 'Alterações commitadas';
        }
      } else {
        result.message = 'Nada para sincronizar';
      }

      for (const remote of config.remotes) {
        try {
          const { stdout, stderr, error } = await runCommand(`git push ${remote} main`);
          
          if (error) {
            console.warn(`Erro ao push para ${remote}:`, stderr);
          } else {
            result.pushedTo.push(remote);
            result.message += ` → ${remote}`;
          }
        } catch (e: any) {
          console.warn(`Erro ao push para ${remote}:`, e.message);
        }
      }

      if (result.pushedTo.length === config.remotes.length) {
        result.success = true;
        lastSyncRef.current = new Date();
      } else if (result.pushedTo.length > 0) {
        result.success = true;
        result.message += ' (parcial)';
      }

    } catch (error: any) {
      result.message = error.message || 'Erro desconhecido';
    } finally {
      isRunningRef.current = false;
      syncHistoryRef.current = [result, ...syncHistoryRef.current.slice(0, 9)];
    }

    return result;
  }, [config.remotes, checkGitStatus, runCommand]);

  const verifyDeployment = useCallback(async (): Promise<{
    deployed: boolean;
    url: string;
    lastUpdate: string;
  }> => {
    try {
      const response = await fetch('https://biz-onboard-plus.lovable.app', {
        method: 'HEAD',
      });
      
      return {
        deployed: response.ok,
        url: 'https://biz-onboard-plus.lovable.app',
        lastUpdate: new Date().toLocaleString('pt-BR'),
      };
    } catch {
      return {
        deployed: false,
        url: 'https://biz-onboard-plus.lovable.web.app',
        lastUpdate: 'Verificação falhou',
      };
    }
  }, []);

  const fullSync = useCallback(async (): Promise<{
    sync: SyncResult;
    deployment: { deployed: boolean; url: string; lastUpdate: string };
  }> => {
    const sync = await commitAndPush();
    const deployment = await verifyDeployment();
    
    return { sync, deployment };
  }, [commitAndPush, verifyDeployment]);

  const forceSync = useCallback(async (): Promise<SyncResult> => {
    isRunningRef.current = true;
    const result: SyncResult = {
      success: false,
      message: '',
      timestamp: new Date(),
      pushedTo: [],
    };

    try {
      await runCommand('git add -A');
      await runCommand('git commit -m "chore: force sync - ' + new Date().toISOString() + '" || true');
      
      for (const remote of config.remotes) {
        try {
          await runCommand(`git push ${remote} main --force`);
          result.pushedTo.push(remote);
        } catch (e) {
          console.warn(`Erro ao forçar push para ${remote}:`, e);
        }
      }

      result.success = result.pushedTo.length > 0;
      result.message = result.success 
        ? `Force sync concluído para ${result.pushedTo.join(', ')}`
        : 'Force sync falhou';
      
      lastSyncRef.current = new Date();
    } catch (error: any) {
      result.message = error.message;
    } finally {
      isRunningRef.current = false;
    }

    return result;
  }, [config.remotes, runCommand]);

  const getStatus = useCallback(() => {
    return {
      isRunning: isRunningRef.current,
      lastSync: lastSyncRef.current,
      history: syncHistoryRef.current,
      remotes: config.remotes,
    };
  }, [config.remotes]);

  return {
    commitAndPush,
    fullSync,
    forceSync,
    verifyDeployment,
    checkGitStatus,
    getStatus,
  };
}

export type { SyncResult, LovableSyncConfig };
