"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Power, 
  RotateCcw, 
  Play, 
  Pause, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { McpServer } from "@/types/mcp";

interface ServerManagementProps {
  server: McpServer;
  onAction: (serverName: string, action: 'restart' | 'activate' | 'deactivate') => Promise<unknown>;
  onEdit?: (server: McpServer) => void;
  onDelete?: (serverName: string) => void;
}

export default function ServerManagement({ server, onAction, onEdit, onDelete }: ServerManagementProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: 'restart' | 'activate' | 'deactivate') => {
    setLoading(action);

    try {
      const result = await onAction(server.name, action);

      // Use the actual message from the response data if available
      const message = (result && typeof result === 'object' && 'message' in result && typeof result.message === 'string')
        ? result.message
        : `Server ${action}d successfully`;
      toast.success(message);
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} server`;
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "outline";
    switch (status.toUpperCase()) {
      case "CONNECTED":
        return "default";
      case "DISCONNECTED":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <Power className="h-3 w-3" />;
    switch (status.toUpperCase()) {
      case "CONNECTED":
        return <CheckCircle className="h-3 w-3" />;
      case "DISCONNECTED":
        return <XCircle className="h-3 w-3" />;
      case "FAILED":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Power className="h-3 w-3" />;
    }
  };

  const isActionDisabled = (action: string) => {
    if (loading) return true;
    
    switch (action) {
      case 'activate':
        return server.connectionStatus?.toUpperCase() === "CONNECTED";
      case 'deactivate':
        return server.connectionStatus?.toUpperCase() !== "CONNECTED";
      case 'restart':
        return false; // Restart is always available
      default:
        return false;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <div 
          className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 ${
            server.connectionStatus?.toUpperCase() === "CONNECTED"
              ? "bg-green-500 hover:bg-green-600 animate-pulse"
              : server.connectionStatus?.toUpperCase() === "DISCONNECTED"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : server.connectionStatus?.toUpperCase() === "FAILED"
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-gray-400 hover:bg-gray-500"
          }`}
          title={`Status: ${server.connectionStatus || "Unknown"}`}
        />
        <Badge
          variant={getStatusColor(server.connectionStatus)}
          className="flex items-center gap-1"
        >
          {getStatusIcon(server.connectionStatus)}
          <span>
            {server.connectionStatus || "Unknown"}
          </span>
        </Badge>
      </div>


      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Primary Action Button */}
        {server.connectionStatus?.toUpperCase() === "CONNECTED" ? (
          <Button
            onClick={() => handleAction('deactivate')}
            disabled={isActionDisabled('deactivate')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 cursor-pointer"
          >
            {loading === 'deactivate' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            Deactivate
          </Button>
        ) : (
          <Button
            onClick={() => handleAction('activate')}
            disabled={isActionDisabled('activate')}
            size="sm"
            className="flex items-center gap-2 cursor-pointer"
          >
            {loading === 'activate' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Activate
          </Button>
        )}

        {/* Dropdown Menu for Additional Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={loading !== null}
              className="cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {server.connectionStatus?.toUpperCase() === "CONNECTED" ? (
              <DropdownMenuItem
                onClick={() => handleAction('activate')}
                disabled={isActionDisabled('activate')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Play className="h-4 w-4" />
                Activate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleAction('deactivate')}
                disabled={isActionDisabled('deactivate')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Pause className="h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleAction('restart')}
              disabled={isActionDisabled('restart')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(server)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                Edit Server
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(server.name)}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete Server
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
