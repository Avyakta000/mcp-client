"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Rss,
  Globe,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { McpServer } from "@/types/mcp";
import { toast } from "react-hot-toast";

const serverSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  description: z.string().optional(),
  transport: z.enum(["sse", "streamable_http", "stdio"]),
  url: z.string().optional(),
  command: z.string().optional(),
  args: z.string().optional(),
  requiresOauth: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  headers: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).optional()
});

type ServerFormData = z.infer<typeof serverSchema>;

interface ServerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServerFormData) => Promise<void>;
  server?: McpServer | null;
  mode: 'add' | 'edit';
}

export default function ServerFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  server, 
  mode 
}: ServerFormModalProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [transportType, setTransportType] = useState<"sse" | "streamable_http" | "stdio">("sse");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      name: "",
      description: "",
      transport: "sse",
      url: "",
      command: "",
      args: "",
      requiresOauth: false,
      isPublic: false,
      headers: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "headers"
  });

  const watchedTransport = watch("transport");

  useEffect(() => {
    setTransportType(watchedTransport);
  }, [watchedTransport]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && server) {
        reset({
          name: server.name,
          description: server.description || "",
          transport: server.transport as "sse" | "streamable_http" | "stdio",
          url: server.url || "",
          command: server.command || "",
          args: server.args ? (typeof server.args === 'string' ? server.args : JSON.stringify(server.args)) : "",
          requiresOauth: server.requiresOauth2 || false,
          isPublic: server.isPublic || false,
          headers: []
        });
        setTransportType(server.transport as "sse" | "streamable_http" | "stdio");
      } else {
        reset({
          name: "",
          description: "",
          transport: "sse",
          url: "",
          command: "",
          args: "",
          requiresOauth: false,
          isPublic: false,
          headers: []
        });
        setTransportType("sse");
      }
      setShowHeaders(false);
    }
  }, [isOpen, mode, server, reset]);

  const handleFormSubmit = async (data: ServerFormData) => {
    try {
      await onSubmit(data);
      onClose();
      toast.success(`Server ${mode === 'add' ? 'added' : 'updated'} successfully`);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${mode === 'add' ? 'add' : 'update'} server`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Server' : 'Edit Server'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs">Server Name</Label>
            <Input
              {...register("name")}
              id="name"
              placeholder="My MCP Server"
              className="h-9"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea
              {...register("description")}
              id="description"
              placeholder="What does this server do? (optional)"
              className="min-h-[60px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help others understand what this server is for
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Transport Type</Label>
            <p className="text-xs -mt-1 text-muted-foreground">
              Choose how to connect to your MCP server:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className={`
                flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-colors
                ${transportType === 'sse' ? "border-primary bg-primary/10" : "border-input hover:bg-accent"}
              `}>
                <input type="radio" {...register("transport")} value="sse" className="sr-only" />
                <Rss className="h-4 w-4 mb-1" />
                <span className="font-semibold text-xs">SSE</span>
                <span className="text-xs text-muted-foreground">Server-Sent Events</span>
              </label>
              <label className={`
                flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-colors
                ${transportType === 'streamable_http' ? "border-primary bg-primary/10" : "border-input hover:bg-accent"}
              `}>
                <input type="radio" {...register("transport")} value="streamable_http" className="sr-only" />
                <Globe className="h-4 w-4 mb-1" />
                <span className="font-semibold text-xs">HTTP</span>
                <span className="text-xs text-muted-foreground">Streamable HTTP</span>
              </label>
              <label className={`
                flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-colors
                ${transportType === 'stdio' ? "border-primary bg-primary/10" : "border-input hover:bg-accent"}
              `}>
                <input type="radio" {...register("transport")} value="stdio" className="sr-only" />
                <Terminal className="h-4 w-4 mb-1" />
                <span className="font-semibold text-xs">STDIO</span>
                <span className="text-xs text-muted-foreground">Standard I/O</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Controller
                name="requiresOauth"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="requiresOauth"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="requiresOauth" className="text-xs">
                Requires OAuth2 Authentication
              </Label>
            </div>
            <p className="text-xs pt-1 text-muted-foreground">
              Enable if this server requires OAuth2 authentication
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isPublic"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isPublic" className="text-xs">
                Share with other users
              </Label>
            </div>
          </div>

          {transportType === 'stdio' ? (
            <div className="space-y-1">
              <Label htmlFor="command" className="text-xs">Command</Label>
              <Input {...register("command")} id="command" placeholder="python" className="h-9"/>
              <p className="text-xs pt-1 text-muted-foreground">
                The command to execute for the server.
              </p>
              <Label htmlFor="args" className="text-xs">Arguments (JSON)</Label>
              <Input {...register("args")} id="args" placeholder='["-m", "my_module"]' className="h-9"/>
              <p className="text-xs pt-1 text-muted-foreground">
                A JSON array of arguments to pass to the command.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="url" className="text-xs">Server URL</Label>
              <Input {...register("url")} id="url" placeholder="https://mcp.example.com/token/mcp" className="h-9"/>
              {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
              <p className="text-xs pt-1 text-muted-foreground">
                Full URL to the endpoint of the MCP server
              </p>
            </div>
          )}
          
          {/* HTTP Headers Section */}
          {transportType !== 'stdio' && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowHeaders(!showHeaders)}
                className="flex items-center justify-between w-full text-left pt-1"
              >
                <Label className="text-xs">HTTP Headers</Label>
                {showHeaders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence>
                {showHeaders && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-1"
                  >
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Input
                          {...register(`headers.${index}.key`)}
                          placeholder="Authorization"
                          className="w-1/3 h-9"
                        />
                        <Input
                          {...register(`headers.${index}.value`)}
                          placeholder="Bearer token123"
                          className="flex-1 h-9"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ key: "", value: "" })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Header
                    </Button>
                    <p className="text-xs pt-1 text-muted-foreground">
                      HTTP headers will be sent with requests to the endpoint.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === 'add' ? 'Add Server' : 'Update Server'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
