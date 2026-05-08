import { useState } from "react";
import { format } from "date-fns";
import {
    useInstagramComments,
    useAddInstagramComment,
    useEditInstagramComment,
    useDeleteInstagramComment,
} from "../hooks/useInstagramComments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentsManagerProps {
    mediaId: string;
}

export function CommentsManager({ mediaId }: CommentsManagerProps) {
    const { data: commentsData, isLoading, error } = useInstagramComments(mediaId);
    const { mutate: addComment, isPending: isAdding } = useAddInstagramComment();
    const { mutate: editComment, isPending: isEditing } = useEditInstagramComment();
    const { mutate: deleteComment, isPending: isDeleting } = useDeleteInstagramComment();

    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    const comments = commentsData?.comments || [];

    const handleAddComment = () => {
        if (!newCommentText.trim()) return;
        addComment(
            { mediaId, text: newCommentText },
            {
                onSuccess: () => {
                    toast.success("Comment added successfully");
                    setNewCommentText("");
                    setIsAddingNew(false);
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Failed to add comment");
                },
            }
        );
    };

    const handleEditComment = (commentId: string) => {
        if (!editCommentText.trim()) return;
        editComment(
            { commentId, text: editCommentText },
            {
                onSuccess: () => {
                    toast.success("Comment updated successfully");
                    setEditingId(null);
                    setEditCommentText("");
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Failed to update comment");
                },
            }
        );
    };

    const handleDeleteComment = (commentId: string) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        deleteComment(commentId, {
            onSuccess: () => {
                toast.success("Comment deleted successfully");
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Failed to delete comment");
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    Comments ({commentsData?.total || comments.length})
                </h4>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold rounded-lg"
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    disabled={isAddingNew}
                >
                    + First Comment
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">
                        {error instanceof Error ? error.message : "Failed to load comments"}
                    </p>
                </div>
            )}

            {isAddingNew && (
                <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Type your hashtags or comment..."
                        className="text-sm bg-white"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-muted-foreground"
                            onClick={() => {
                                setIsAddingNew(false);
                                setNewCommentText("");
                            }}
                            disabled={isAdding}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={handleAddComment}
                            disabled={!newCommentText.trim() || isAdding}
                        >
                            {isAdding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            Post Comment
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {isLoading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed border-border/40 rounded-xl">
                        No comments yet.
                    </div>
                ) : (
                    comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3 group bg-white p-3 rounded-xl border border-border/40 shadow-sm hover:border-border/60 transition-colors">
                            <Avatar className="w-8 h-8 rounded-full border border-border/50 shrink-0">
                                <AvatarFallback className="text-[10px] bg-blue-50 text-blue-700">
                                    {comment.username?.substring(0, 2).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-bold text-foreground truncate">
                                            {comment.username}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                            {comment.timestamp ? format(new Date(comment.timestamp), "MMM d, h:mm a") : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditCommentText(comment.text);
                                            }}
                                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                            title="Edit"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="p-1 hover:bg-red-50 rounded text-muted-foreground hover:text-red-500"
                                            title="Delete"
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                {editingId === comment.id ? (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <Input
                                            value={editCommentText}
                                            onChange={(e) => setEditCommentText(e.target.value)}
                                            className="h-7 text-xs px-2"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleEditComment(comment.id)}
                                            disabled={isEditing || !editCommentText.trim()}
                                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md disabled:opacity-50"
                                        >
                                            {isEditing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditCommentText("");
                                            }}
                                            disabled={isEditing}
                                            className="p-1.5 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 rounded-md disabled:opacity-50"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed whitespace-pre-wrap break-words">
                                        {comment.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
