import { useState, useCallback, useEffect, useRef } from 'react';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SyncResult {
  success: boolean;
  message: string;
  timestamp: Date;
  details?: any;
}

interface ErrorFix {
  problem: string;
  solution: string;
  command?: string;
}

interface LovableSyncConfig {
  checkInterval: number;
  autoFix: boolean;
  remotes: string[];
}

const DEFAULT_CONFIG: LovableSyncConfig = {
  checkInterval: 300000,
  autoFix: true,
  remotes: ['origin', 'antigravity', 'lovable'],
};

const KNOWN_ERRORS: ErrorFix[] = [
  {
    problem: 'TypeScript errors',
    solution: 'Remove imports inválidos e corrija tipos',
    command: 'tsc --noEmit',
  },
  {
    problem: 'ESLint errors',
    solution: 'Corrija erros de lint ou execute lint:fix',
  },
  {
    problem: 'Node version mismatch',
    solution: 'Use versão compatível do Node.js',
  },
  {
    problem: 'Module not found',
    solution: 'Execute npm install para instalar dependências',
    command: 'npm install',
  },
  {
    problem: 'Merge conflicts',
    solution: 'Resolva conflitos manualmente ou use git merge --abort',
    command: 'git merge --abort',
  },
  {
    problem: 'Uncommitted changes',
    solution: 'Faça commit das alterações ou descarte com git stash',
    command: 'git stash',
  },
];

export function useLovableSyncAgent(config: LovableSyncConfig = DEFAULT_CONFIG) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncResult[]>([]);
  const [suggestedFix, setSuggestedFix] = useState<ErrorFix | null>(null);
  const [nodeVersion, setNodeVersion] = useState<string>('');
  const [gitStatus, setGitStatus] = useState<any>(null);
  const isRunningRef = useRef(false);

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

  const checkNodeVersion = useCallback(async () => {
    try {
      const nodePath = '/tmp/node-v20.11.0-darwin-x64/bin/node';
      const { stdout } = await runCommand(`${nodePath} --version`);
      setNodeVersion(stdout.trim());
      return stdout.trim();
    } catch {
      try {
        const { stdout } = await runCommand('node --version');
        setNodeVersion(stdout.trim());
        return stdout.trim();
      } catch {
        setNodeVersion('Não detectado');
        return null;
      }
    }
  }, [runCommand]);

  const checkGitStatus = useCallback(async () => {
    try {
      const { stdout } = await runCommand('git status --short');
      const lines = stdout.trim().split('\n').filter(Boolean);
      
      const status = {
        clean: lines.length === 0,
        files: lines.map(line => ({
          status: line.slice(0, 2).trim(),
          file: line.slice(3).trim(),
        })),
        ahead: 0,
        behind: 0,
      };

      const { stdout: ahead } = await runCommand('git rev-list --count @{u}..HEAD');
      const { stdout: behind } = await runCommand('git rev-list HEAD..@{u}');
      
      status.ahead = parseInt(ahead.trim()) || 0;
      status.behind = parseInt(behind.trim()) || 0;

      setGitStatus(status);
      return status;
    } catch (error: any) {
      setGitStatus({ error: error.message });
      return null;
    }
  }, [runCommand]);

  const detectErrors = useCallback(async (): Promise<ErrorFix | null> => {
    const { stdout, stderr, error } = await runCommand('git status --short');
    
    if (stdout.includes('Merge') || stderr.includes('merge')) {
      return KNOWN_ERRORS.find(e => e.problem.includes('Merge')) || null;
    }

    if (error?.message?.includes('npm')) {
      return KNOWN_ERRORS.find(e => e.problem.includes('Module')) || null;
    }

    return null;
  }, [runCommand]);

  const analyzeProblem = useCallback(async (errorMessage: string): Promise<ErrorFix | null> => {
    const lowerError = errorMessage.toLowerCase();

    for (const knownError of KNOWN_ERRORS) {
      if (lowerError.includes(knownError.problem.toLowerCase())) {
        return knownError;
      }
    }

    if (lowerError.includes('typescript') || lowerError.includes('tsc')) {
      return {
        problem: 'Erro de TypeScript',
        solution: 'Verifique os tipos e imports dos arquivos modificados',
      };
    }

    if (lowerError.includes('node') && lowerError.includes('version')) {
      return {
        problem: 'Versão do Node.js incompatível',
        solution: 'Use Node.js v20.x - já disponível em /tmp/node-v20.11.0-darwin-x64/bin/node',
      };
    }

    return null;
  }, []);

  const fixCommonIssues = useCallback(async (): Promise<boolean> => {
    try {
      await runCommand('git add -A');
      return true;
    } catch {
      return false;
    }
  }, [runCommand]);

  const sync = useCallback(async (): Promise<SyncResult> => {
    if (isRunningRef.current) {
      return {
        success: false,
        message: 'Sincronização já está em andamento',
        timestamp: new Date(),
      };
    }

    isRunningRef.current = true;
    setSyncStatus('syncing');
    setSuggestedFix(null);

    const result: SyncResult = {
      success: false,
      message: '',
      timestamp: new Date(),
    };

    try {
      const status = await checkGitStatus();
      
      if (!status?.clean) {
        const { stdout } = await runCommand('git add -A');
        
        const { stdout: diff } = await runCommand('git diff --cached --stat');
        
        if (diff) {
          const { stdout: commitResult } = await runCommand(
            `git commit -m "chore: auto-sync - ${new Date().toISOString()}"`
          );
          result.details = { commit: commitResult };
        }
      }

      for (const remote of config.remotes) {
        try {
          const { stdout, stderr, error } = await runCommand(`git push ${remote} main`);
          
          if (error) {
            const fix = await analyzeProblem(stderr || error.message);
            if (fix) {
              setSuggestedFix(fix);
            }
            throw error;
          }
          
          result.details = { ...result.details, [remote]: stdout };
        } catch (e: any) {
          const fix = await analyzeProblem(e.message);
          if (fix) {
            setSuggestedFix(fix);
            result.message += `\n${remote}: ${fix.solution}`;
          }
          throw e;
        }
      }

      result.success = true;
      result.message = 'Sincronizado com sucesso para todas as remotas!';
      setSyncStatus('success');
      setLastSync(new Date());
      setLastError(null);

    } catch (error: any) {
      result.success = false;
      result.message = error.message || 'Erro desconhecido';
      setSyncStatus('error');
      setLastError(result.message);
      
      const fix = await analyzeProblem(result.message);
      if (fix) {
        setSuggestedFix(fix);
      }

    } finally {
      isRunningRef.current = false;
      setSyncHistory(prev => [result, ...prev].slice(0, 20));
    }

    return result;
  }, [config.remotes, checkGitStatus, runCommand, analyzeProblem]);

  const forceSync = useCallback(async (): Promise<SyncResult> => {
    setSyncStatus('syncing');
    
    try {
      await runCommand('git add -A');
      await runCommand('git commit -m "chore: force sync - ' + new Date().toISOString() + '" || true');
      
      for (const remote of config.remotes) {
        await runCommand(`git push ${remote} main --force`);
      }

      const result: SyncResult = {
        success: true,
        message: 'Sincronização forçada concluída!',
        timestamp: new Date(),
      };
      
      setSyncStatus('success');
      setLastSync(new Date());
      return result;
    } catch (error: any) {
      const result: SyncResult = {
        success: false,
        message: error.message,
        timestamp: new Date(),
      };
      setSyncStatus('error');
      setLastError(error.message);
      return result;
    }
  }, [config.remotes, runCommand]);

  const verifyDeployment = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('https://biz-onboard-plus.lovable.app', {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const getDeploymentStatus = useCallback(async () => {
    const checks = {
      gitConnected: false,
      nodeInstalled: false,
      lastCommit: '',
      branches: [] as string[],
      deployment: false,
    };

    try {
      const { stdout: status } = await runCommand('git remote -v');
      checks.gitConnected = status.includes('lovable');
    } catch {}

    try {
      checks.nodeInstalled = !!(await checkNodeVersion());
    } catch {}

    try {
      const { stdout } = await runCommand('git log -1 --format="%H %s"');
      checks.lastCommit = stdout.trim();
    } catch {}

    try {
      const { stdout } = await runCommand('git branch -a');
      checks.branches = stdout.trim().split('\n');
    } catch {}

    checks.deployment = await verifyDeployment();

    return checks;
  }, [runCommand, checkNodeVersion, verifyDeployment]);

  useEffect(() => {
    checkNodeVersion();
    checkGitStatus();
  }, [checkNodeVersion, checkGitStatus]);

  return {
    syncStatus,
    lastSync,
    lastError,
    syncHistory,
    suggestedFix,
    nodeVersion,
    gitStatus,
    sync,
    forceSync,
    verifyDeployment,
    getDeploymentStatus,
    checkGitStatus,
    analyzeProblem,
    fixCommonIssues,
  };
}

export type { SyncResult, ErrorFix, LovableSyncConfig };
