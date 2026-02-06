import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateClient, useUpdateClient, useDeleteClientLogo } from '../../hooks/useClients';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfileImageUrl } from "@/utils/imageUtils";
import { Trash2 } from 'lucide-react';
import type { Client } from '@/types/client.types';

interface ClientFormModalProps {
    open: boolean;
    onClose: () => void;
    client?: Client | null; // If provided, mode is 'EDIT'
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ open, onClose, client }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState<File | null>(null);

    // Hooks
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();
    const deleteClientLogo = useDeleteClientLogo();

    const isEditMode = !!client;
    const isLoading = createClient.isPending || updateClient.isPending || deleteClientLogo.isPending;

    useEffect(() => {
        if (client && open) {
            setName(client.name);
            setDescription(client.description || '');
            setLogo(null);
        } else if (!open) {
            // Reset when closed
            setName('');
            setDescription('');
            setLogo(null);
        }
    }, [client, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            if (isEditMode && client) {
                await updateClient.mutateAsync({
                    id: client.id,
                    data: {
                        name: name.trim(),
                        description: description.trim() || undefined,
                        logo: logo || undefined,
                    }
                });
                onClose();
            } else {
                const newClient = await createClient.mutateAsync({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    logo: logo || undefined,
                });
                onClose();
                navigate(`/clients/${newClient.id}`);
            }
        } catch (error) {
            console.error('Failed to save client:', error);
        }
    };

    const handleDeleteLogo = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (client && client.id && client.logo) {
            try {
                await deleteClientLogo.mutateAsync(client.id);
            } catch (error) {
                // Toasts handled in hook
            }
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size cannot exceed 5MB");
                e.target.value = '';
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error("Only image files are allowed");
                e.target.value = '';
                return;
            }
            setLogo(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update client details and manage their logo.'
                            : 'Create a new client account to manage their integrations and data.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Client Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Acme Corp"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the client (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Client Logo</Label>

                            {isEditMode && client?.logo && !logo && (
                                <div className="flex items-center gap-4 mb-2 p-2 border rounded-md bg-muted/30">
                                    <Avatar className="h-10 w-10 border border-zinc-200">
                                        <AvatarImage src={getProfileImageUrl(client.logo) + `?v=${new Date(client.updatedAt).getTime()}`} className="object-contain" />
                                        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-sm text-muted-foreground">
                                        Current Logo
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={handleDeleteLogo}
                                        title="Remove Logo"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isLoading}
                                className="cursor-pointer"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Optional. Max 5MB. Supports JPEG, PNG, GIF, WebP.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading} disabled={isLoading || !name.trim()}>
                            {isEditMode ? 'Update Client' : 'Create Client'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ClientFormModal;
