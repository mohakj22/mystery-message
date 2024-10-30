"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Message } from "@/models/User.model";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: any) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
//   const [isExpanded, setIsExpanded] = useState(false);
//   const truncatedContent =
//     message.content.slice(0, 200) + (message.content.length > 200 ? "..." : "");

  const handleDeleteConfirm = async () => {
    try {
      console.log("HandleDelete");
      
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message?messageId=${message._id}`
      );

        console.log("HandleDeleteFailled");
      toast({
        title: response.data.message,
      });
      onMessageDelete(message._id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      toast({ title: "Reply content cannot be empty." });
      return;
    }

    try {
      const response = await axios.post<ApiResponse>("/api/send-reply", {
        replyContent,
        originalMessageId: message._id,
      });
      toast({ title: response.data.message });
      setIsReplying(false);
      setReplyContent("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="card-bordered">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-sm">
          {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
        </div>
        {!message.isAnonymous && message.sender && (
          <div className="text-gray-500">From: {message.sender}</div>
        )}
      </CardHeader>
      <CardContent>
        {message.canReply && (
          <Button variant="secondary" onClick={() => setIsReplying(true)}>
            Reply
          </Button>
        )}
        <Dialog open={isReplying} onOpenChange={setIsReplying}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Message</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Type your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button onClick={handleReplySubmit}>Send Reply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
