import { CredentialInfo, CredentialReminder } from '../../../../types/cloudStorage';

export type CredentialType = CredentialInfo['credentialType'];
export type CredentialStatus = CredentialInfo['verificationStatus'];
export type ReminderPriority = CredentialReminder['priority'];

export interface CredentialManagerProps {
  credentials: CredentialInfo[];
  reminders: CredentialReminder[];
  onAddCredential: (credential: Partial<CredentialInfo>) => void;
  onUpdateCredential: (id: string, updates: Partial<CredentialInfo>) => void;
  onDeleteCredential: (id: string) => void;
  onGenerateQRCode: (id: string) => string;
}

