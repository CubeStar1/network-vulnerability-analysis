'use client';

import { useEffect, useState } from 'react';
import { useSimulation } from '@/lib/contexts/simulation-context'; 
import { ShieldAlert, AlertTriangle, Info, CheckCircle, XCircle, Hourglass, ServerCrash, UserCheck, WifiOff } from 'lucide-react'; 
import { cn } from '@/lib/utils';

interface BannerState {
  message: React.ReactNode;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
}

const H1_ATTACKER_METADATA = {
  id: 'h1',
  ip: "192.168.1.100",
  deviceType: "Compromised Host",
  os: "Linux (Kernel 5.15)",
  threatLevel: "Critical",
  // lastActivity: new Date().toLocaleTimeString(), // Can be dynamic if needed
};

export function SimulationStatusBanner() {
  const {
    latestRun, // Consumed from context, includes status
    designatedAttackerId,
    isAttackerActive, 
    currentAttackerEventData, 
    identifiedAttackerInfo,
    selectedRunId,
  } = useSimulation();

  const [bannerState, setBannerState] = useState<BannerState>(() => ({
    message: 'System Ready. Select or run a simulation.',
    bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
    textColor: 'text-white',
    icon: <CheckCircle className="w-6 h-6" />,
  }));

  useEffect(() => {
    // Default: System Ready (Green)
    let newBannerState: BannerState = {
      message: 'System Ready. Select or run a simulation.',
      bgColor: 'bg-gradient-to-r from-green-400 to-green-500 dark:from-green-600 dark:to-green-700',
      textColor: 'text-white font-medium',
      icon: <UserCheck className="w-6 h-6" />,
    };

    if (!selectedRunId && !latestRun) {
        setBannerState(newBannerState);
        return;
    }

    if (latestRun) {
      const runName = latestRun.script_type || 'Selected Simulation';

      // Priority 1: Attacker Identified (Red) - Simplified Message
      if (identifiedAttackerInfo && identifiedAttackerInfo.id === H1_ATTACKER_METADATA.id) {
        newBannerState = {
          message: (
            <div className="flex flex-col items-center md:items-start">
              <strong className="text-lg font-semibold">Threat Identified: Attacker {H1_ATTACKER_METADATA.id.toUpperCase()}</strong>
            </div>
          ),
          bgColor: 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800',
          textColor: 'text-white',
          icon: <ShieldAlert className="w-8 h-8 text-red-100" />,
        };
      } 
      // Priority 2: Real-time Malicious Activity from h1 (Red)
      else if (isAttackerActive && designatedAttackerId === H1_ATTACKER_METADATA.id && currentAttackerEventData) {
        const eventType = currentAttackerEventData.event_type || 'activity';
        newBannerState = {
          message: (
            <div className="flex flex-col items-center md:items-start">
              <strong className="text-lg font-semibold">Malicious Activity Detected!</strong>
              <span className="text-sm">Host <span className="font-bold">{H1_ATTACKER_METADATA.id.toUpperCase()}</span> is performing: <span className="font-mono">{eventType}</span></span>
            </div>
          ),
          bgColor: 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800', // Red gradient
          textColor: 'text-white',
          icon: <AlertTriangle className="w-7 h-7 text-red-100" />,
        };
      } 
      // Priority 3: Simulation Status based (Traffic Light Logic)
      else {
        switch (latestRun.status) {
          case 'initiated':
          case 'pending':
            newBannerState = {
              message: `Initializing: ${runName}...`,
              bgColor: 'bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600',
              textColor: 'text-yellow-900 dark:text-yellow-100',
              icon: <Hourglass className="w-6 h-6 animate-spin-slow" />,
            };
            break;
          case 'running':
            newBannerState = {
              message: `Simulation Running: ${runName}`,
              bgColor: 'bg-gradient-to-r from-red-400 to-red-500 dark:from-red-700 dark:to-red-800', // User's preference
              textColor: 'text-red-100', // Adjusted for better contrast
              icon: <Hourglass className="w-6 h-6 animate-pulse" />,
            };
            break;
          case 'completed':
            newBannerState = {
              message: `Simulation Completed: ${runName} - System Secure.`,
              bgColor: 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
              textColor: 'text-white',
              icon: <CheckCircle className="w-7 h-7" />,
            };
            break;
          case 'error':
            newBannerState = {
              message: `Simulation Error: ${runName}. Check logs for details.`,
              bgColor: 'bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-800',
              textColor: 'text-white',
              icon: <ServerCrash className="w-7 h-7" />,
            };
            break;
          default:
            // Should not happen if status is always one of the above
            newBannerState = {
              message: 'Unknown simulation status.',
              bgColor: 'bg-gray-400 dark:bg-gray-600',
              textColor: 'text-gray-800 dark:text-gray-200',
              icon: <Info className="w-6 h-6" />,
            };
        }
      }
    } else if (selectedRunId && !latestRun) {
        // A run is selected, but details are still loading
        newBannerState = {
            message: 'Loading simulation data...',
            bgColor: 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
            textColor: 'text-white',
            icon: <Hourglass className="w-6 h-6 animate-spin" />,
        };
    }

    setBannerState(newBannerState);

  }, [latestRun, designatedAttackerId, isAttackerActive, currentAttackerEventData, identifiedAttackerInfo, selectedRunId]);

  return (
    <div 
      className={`p-4 rounded-lg shadow-md flex flex-col justify-center space-y-1 ${bannerState.bgColor} ${bannerState.textColor} h-full transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center space-x-3">
        {bannerState.icon}
        <div className="flex-grow">
          {typeof bannerState.message === 'string' ? (
            <span className="text-sm md:text-base font-medium">{bannerState.message}</span>
          ) : (
            bannerState.message
          )}
        </div>
      </div>
    </div>
  );
}
