import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Laptop, Server, ShieldAlert, X } from 'lucide-react';

interface AttackerData {
  id: string;
  ip: string;
  deviceType: string;
  os: string;
  threatLevel: string;
  description: string;
  potentialActions: string[];
}

interface AttackerDetailsDialogProps {
  attackerData: AttackerData;
  children: React.ReactNode; // For the trigger button
}

const AttackerDetailsDialog: React.FC<AttackerDetailsDialogProps> = ({ attackerData, children }) => {
  if (!attackerData) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Attacker Profile: {attackerData.id.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Detailed information about the identified threat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <strong className="text-neutral-600 dark:text-neutral-400">IP Address:</strong>
            <span className="font-mono text-neutral-800 dark:text-neutral-200">{attackerData.ip}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <strong className="text-neutral-600 dark:text-neutral-400">Device Type:</strong>
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center">
              <Laptop size={16} className="mr-1.5 text-neutral-500 dark:text-neutral-400" /> {attackerData.deviceType}
            </span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <strong className="text-neutral-600 dark:text-neutral-400">Operating System:</strong>
            <span className="text-neutral-800 dark:text-neutral-200 flex items-center">
              <Server size={16} className="mr-1.5 text-neutral-500 dark:text-neutral-400" /> {attackerData.os}
            </span>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <strong className="text-neutral-600 dark:text-neutral-400">Threat Level:</strong>
            <span className={`font-semibold flex items-center ${attackerData.threatLevel === 'Critical' ? 'text-red-600 dark:text-red-400' : 'text-orange-500 dark:text-orange-400'}`}>
              <ShieldAlert size={16} className="mr-1.5" /> {attackerData.threatLevel}
            </span>
          </div>
          <div>
            <strong className="text-neutral-600 dark:text-neutral-400 block mb-1">Description:</strong>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800 p-2 rounded-md">{attackerData.description}</p>
          </div>
          <div>
            <strong className="text-neutral-600 dark:text-neutral-400 block mb-1">Potential Actions:</strong>
            <ul className="list-disc list-inside pl-1 space-y-1 text-neutral-700 dark:text-neutral-300">
              {attackerData.potentialActions.map(action => <li key={action}>{action}</li>)}
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AttackerDetailsDialog;
