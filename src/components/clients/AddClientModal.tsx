import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateClient } from '../../hooks/useClients';
import { Loader2 } from 'lucide-react';
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

interface AddClientModalProps {
    open: boolean;
    onClose: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const createClient = useCreateClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {
            const newClient = await createClient.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
            });

            // Reset form
            setName('');
            setDescription('');
            onClose();

            // Navigate to new client
            navigate(`/clients/${newClient.id}`);
        } catch (error) {
            // Error is handled by the hook
            console.error('Failed to create client:', error);
        }
    };

    const handleClose = () => {
        if (!createClient.isPending) {
            setName('');
            setDescription('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        Create a new client account to manage their integrations and data
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
                                placeholder="e.g., Altamash's Business"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={createClient.isPending}
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
                                disabled={createClient.isPending}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createClient.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createClient.isPending || !name.trim()}>
                            {createClient.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Client'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddClientModal;
