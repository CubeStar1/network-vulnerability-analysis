import React from 'react';
import { useSimulation } from '@/lib/contexts/simulation-context';
import { ShieldAlert, Server, Laptop, AlertTriangle, Info, Eye, Network, WifiOff } from 'lucide-react'; 
import AttackerDetailsDialog from './attacker-details-dialog';
import { Button } from '@/components/ui/button';

// Hardcoded metadata for H1
const H1_ATTACKER_METADATA = {
  id: 'h1',
  ip: "192.168.1.100",
  deviceType: "Compromised Host",
  os: "Linux (Kernel 5.15)", 
  threatLevel: "Critical",
  description: "This host has been identified as a potential source of malicious activity. Its behavior is being monitored.",
  potentialActions: ["Isolate from network", "Monitor traffic", "Initiate forensic analysis"],
};

const abbreviateOs = (os: string) => {
  if (os.toLowerCase().includes('linux')) return 'Linux';
  if (os.toLowerCase().includes('windows')) return 'Win';
  if (os.toLowerCase().includes('macos')) return 'macOS';
  return os.split(' ')[0]; 
};

const abbreviateDeviceType = (deviceType: string) => {
  if (deviceType.toLowerCase().includes('compromised host')) return 'Comp. Host';
  if (deviceType.toLowerCase().includes('server')) return 'Server';
  return deviceType;
}

interface AttackerInfoCardProps {}

const AttackerInfoCard: React.FC<AttackerInfoCardProps> = () => {
  const { latestRun } = useSimulation();
  const isAttackerActive = latestRun && latestRun.status === 'running';

  return (
    <div className={`p-3 rounded-lg shadow-md h-full flex flex-col justify-center 
      ${isAttackerActive 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700 border-2'
        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 border'}
    `}>
      <div className="flex items-center justify-between w-full space-x-2">
        {isAttackerActive ? (
          <>
            <div className="flex items-center space-x-1.5 text-sm text-neutral-700 dark:text-neutral-200 flex-grow min-w-0 overflow-hidden">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="font-semibold text-red-700 dark:text-red-400 truncate">Attacker: {H1_ATTACKER_METADATA.id}</span>
              <span className="text-red-400 dark:text-red-600">|</span>
              
              <Network size={15} className="flex-shrink-0 text-blue-600 dark:text-blue-400" /> 
              <span className="truncate" title={H1_ATTACKER_METADATA.ip}>{H1_ATTACKER_METADATA.ip}</span>
              <span className="text-red-400 dark:text-red-600">|</span>

              <Laptop size={15} className="flex-shrink-0 text-green-600 dark:text-green-400" /> 
              <span className="truncate" title={H1_ATTACKER_METADATA.deviceType}>{abbreviateDeviceType(H1_ATTACKER_METADATA.deviceType)}</span>
              <span className="text-red-400 dark:text-red-600">|</span>
              
              <Server size={15} className="flex-shrink-0 text-purple-600 dark:text-purple-400" /> 
              <span className="truncate" title={H1_ATTACKER_METADATA.os}>{abbreviateOs(H1_ATTACKER_METADATA.os)}</span>
              <span className="text-red-400 dark:text-red-600">|</span>
              
              <ShieldAlert size={15} className={`flex-shrink-0 ${H1_ATTACKER_METADATA.threatLevel === 'Critical' ? 'text-red-700 dark:text-red-500' : 'text-orange-600 dark:text-orange-400'}`} />
              <span 
                className={`font-semibold truncate ${H1_ATTACKER_METADATA.threatLevel === 'Critical' ? 'text-red-700 dark:text-red-500' : 'text-orange-600 dark:text-orange-400'}`}
                title={H1_ATTACKER_METADATA.threatLevel}
              >
                {H1_ATTACKER_METADATA.threatLevel}
              </span>
            </div>
            <AttackerDetailsDialog attackerData={H1_ATTACKER_METADATA}>
              <Button variant="outline" size="sm" className="flex-shrink-0 text-xs px-2 py-1 h-auto ml-2 bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 border-neutral-300 dark:border-neutral-600">
                <Eye size={14} className="mr-1" /> View Details
              </Button>
            </AttackerDetailsDialog>
          </>
        ) : (
          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300 w-full">
            <WifiOff className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-semibold">No Active Threat</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">System monitoring. Attacker info shown when simulation is running.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackerInfoCard;
