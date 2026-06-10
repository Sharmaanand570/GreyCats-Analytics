import { useState } from 'react';
import { 
  useCollaborators, 
  usePendingInvitations, 
  useInviteCollaborator, 
  useUpdateCollaborator, 
  useRevokeCollaborator, 
  useCancelInvitation, 
  useResendInvitation 
} from '@/hooks/useCollaborators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileImageUrl } from '@/utils/imageUtils';
import { UserPlus, Mail, Edit, Trash2, RotateCw, XCircle, Link as LinkIcon, Copy } from 'lucide-react';
import type { Collaborator } from '@/types/client.types';
import { toast } from 'sonner';

export function TeamAccessTab({ clientId }: { clientId: number }) {
  const { data: collaborators, isLoading: isLoadingCollabs } = useCollaborators(clientId);
  const { data: invitations, isLoading: isLoadingInvites } = usePendingInvitations(clientId);
  
  const inviteCollab = useInviteCollaborator(clientId);
  const updateCollab = useUpdateCollaborator(clientId);
  const revokeCollab = useRevokeCollaborator(clientId);
  const cancelInvite = useCancelInvitation(clientId);
  const resendInvite = useResendInvitation(clientId);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);
  
  const [inviteLinkData, setInviteLinkData] = useState<{ isOpen: boolean, link: string, email: string, isDirectLink?: boolean }>({ isOpen: false, link: '', email: '' });

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'READ_ONLY' | 'READ_WRITE' | 'ADMIN'>('READ_ONLY');
  const [inviteAccess, setInviteAccess] = useState({
    accessAnalytics: true,
    accessAlerts: false,
    accessReports: true,
    accessScheduler: false,
    accessAds: false,
  });

  // Edit Form State
  const [editRole, setEditRole] = useState<'READ_ONLY' | 'READ_WRITE' | 'ADMIN'>('READ_ONLY');
  const [editAccess, setEditAccess] = useState({
    accessAnalytics: true,
    accessAlerts: false,
    accessReports: true,
    accessScheduler: false,
    accessAds: false,
  });

  const handleInvite = () => {
    inviteCollab.mutate(
      { email: inviteEmail, role: inviteRole, ...inviteAccess },
      { 
        onSuccess: (res: any) => {
          setIsInviteModalOpen(false);
          let linkToShare = '';
          if (res?.inviteLink) {
            const tokenMatch = res.inviteLink.match(/inviteToken=([^&]+)/);
            linkToShare = tokenMatch ? constructInviteLink(tokenMatch[1]) : res.inviteLink;
          } else {
            // User was directly added. Give them the direct link to the client dashboard.
            linkToShare = `${window.location.origin}/#/clients/${clientId}`;
          }
          setInviteLinkData({ isOpen: true, link: linkToShare, email: inviteEmail, isDirectLink: !res?.inviteLink });
        } 
      }
    );
  };

  const openEditModal = (collab: Collaborator) => {
    setEditingCollab(collab);
    setEditRole(collab.role);
    setEditAccess({
      accessAnalytics: collab.accessAnalytics,
      accessAlerts: collab.accessAlerts,
      accessReports: collab.accessReports,
      accessScheduler: collab.accessScheduler,
      accessAds: collab.accessAds,
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = () => {
    if (!editingCollab) return;
    updateCollab.mutate(
      { userId: editingCollab.userId, data: { role: editRole, ...editAccess } },
      { onSuccess: () => setIsEditModalOpen(false) }
    );
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const constructInviteLink = (token: string) => {
    // Uses HashRouter, so we need /#/ before the route path
    return `${window.location.origin}/#/auth/signup?inviteToken=${token}`;
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Team Access</h2>
          <p className="text-sm text-gray-500">Manage who has access to this client's data and features.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Collaborator
        </Button>
      </div>

      {/* Current Collaborators */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">Active Collaborators</h3>
        </div>
        <div className="divide-y">
          {isLoadingCollabs ? (
            <div className="p-6 text-center text-gray-500">Loading collaborators...</div>
          ) : collaborators?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No active collaborators</div>
          ) : (
            collaborators?.map((collab) => (
              <div key={collab.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={getProfileImageUrl(collab.user.profilePicture)} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium">
                      {collab.user.fullName?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {collab.user.fullName}
                      <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {collab.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{collab.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(collab)} className="text-gray-600 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => revokeCollab.mutate(collab.userId)} className="text-gray-600 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">Pending Invitations</h3>
        </div>
        <div className="divide-y">
          {isLoadingInvites ? (
            <div className="p-6 text-center text-gray-500">Loading invitations...</div>
          ) : invitations?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No pending invitations</div>
          ) : (
            invitations?.map((inv) => (
              <div key={inv.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {inv.email}
                      <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {inv.role}
                      </span>
                      {isExpired(inv.expiresAt) && (
                        <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                          EXPIRED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Sent {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {inv.token && (
                    <Button variant="ghost" size="sm" onClick={() => handleCopyLink(constructInviteLink(inv.token!))} className="text-gray-600 hover:text-blue-600" title="Copy Link">
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => resendInvite.mutate(inv.id, {
                    onSuccess: (res: any) => {
                      if (res?.inviteLink) {
                        const tokenMatch = res.inviteLink.match(/inviteToken=([^&]+)/);
                        const link = tokenMatch ? constructInviteLink(tokenMatch[1]) : res.inviteLink;
                        setInviteLinkData({ isOpen: true, link, email: inv.email, isDirectLink: false });
                      }
                    }
                  })} className="text-gray-600 hover:text-green-600" title="Resend">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => cancelInvite.mutate(inv.id)} className="text-gray-600 hover:text-red-600" title="Cancel">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Send an email invitation to give someone access to this client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                placeholder="colleague@example.com" 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
              >
                <option value="READ_ONLY">Read Only</option>
                <option value="READ_WRITE">Read & Write</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Module Access</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'accessAnalytics', label: 'Analytics' },
                  { id: 'accessAlerts', label: 'Alerts' },
                  { id: 'accessReports', label: 'Reports' },
                  { id: 'accessScheduler', label: 'Scheduler' },
                  { id: 'accessAds', label: 'Ads Manager' },
                ].map((mod) => (
                  <div key={mod.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`invite-${mod.id}`} 
                      checked={(inviteAccess as any)[mod.id]} 
                      onCheckedChange={(checked) => setInviteAccess({ ...inviteAccess, [mod.id]: !!checked })}
                    />
                    <Label htmlFor={`invite-${mod.id}`} className="font-normal cursor-pointer text-sm">
                      {mod.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviteCollab.isPending || !inviteEmail}>
              {inviteCollab.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Collaborator Access</DialogTitle>
            <DialogDescription>
              Update role and module permissions for {editingCollab?.user.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
              >
                <option value="READ_ONLY">Read Only</option>
                <option value="READ_WRITE">Read & Write</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label>Module Access</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'accessAnalytics', label: 'Analytics' },
                  { id: 'accessAlerts', label: 'Alerts' },
                  { id: 'accessReports', label: 'Reports' },
                  { id: 'accessScheduler', label: 'Scheduler' },
                  { id: 'accessAds', label: 'Ads Manager' },
                ].map((mod) => (
                  <div key={mod.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit-${mod.id}`} 
                      checked={(editAccess as any)[mod.id]} 
                      onCheckedChange={(checked) => setEditAccess({ ...editAccess, [mod.id]: !!checked })}
                    />
                    <Label htmlFor={`edit-${mod.id}`} className="font-normal cursor-pointer text-sm">
                      {mod.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={updateCollab.isPending}>
              {updateCollab.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Link Success Modal */}
      <Dialog open={inviteLinkData.isOpen} onOpenChange={(open) => setInviteLinkData(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{inviteLinkData.isDirectLink ? 'Access Granted' : 'Invitation Sent'}</DialogTitle>
            <DialogDescription>
              {inviteLinkData.isDirectLink ? (
                <>
                  <strong>{inviteLinkData.email}</strong> has been granted access. Since they already have an account, you can share this direct link to the client dashboard with them.
                </>
              ) : (
                <>
                  An invitation email has been sent to <strong>{inviteLinkData.email}</strong>. 
                  You can also share this link with them directly to sign up.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 bg-zinc-50 border p-2 rounded-md">
              <Input 
                value={inviteLinkData.link} 
                readOnly 
                className="bg-transparent border-none focus-visible:ring-0 shadow-none"
              />
              <Button size="icon" variant="outline" onClick={() => handleCopyLink(inviteLinkData.link)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setInviteLinkData(prev => ({ ...prev, isOpen: false }))}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
