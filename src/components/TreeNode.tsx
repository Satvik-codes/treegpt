import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, XCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';

interface TreeNodeData {
  label: string;
  status: 'active' | 'failed' | 'success';
  role: 'user' | 'assistant' | 'system';
  isSelected: boolean;
  isExpanded: boolean;
  summary: string | null;
  messageCount: number;
  mode: string;
  [key: string]: unknown;
}

function TreeNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as TreeNodeData;
  const { label, status, role, isSelected, isExpanded, summary, messageCount, mode } = nodeData;

  const statusColors: Record<string, string> = {
    // No borders by default (DESIGN.md "No-Line" + "Node Cards")
    active: 'bg-[var(--surface_container_highest)]',
    failed: 'bg-[var(--surface_container_highest)]',
    success: 'bg-[var(--surface_container_highest)]',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    active: <Circle className="h-3 w-3 text-node-active" />,
    failed: <XCircle className="h-3 w-3 text-node-failed" />,
    success: <CheckCircle2 className="h-3 w-3 text-node-success" />,
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative rounded-lg px-4 py-3 min-w-[200px] max-w-[320px] cursor-pointer
        transition-shadow duration-200
        ${statusColors[status] || statusColors.active}
        ${isSelected ? 'shadow-[0_32px_64px_rgba(14,14,14,0.40)] ring-0' : 'shadow-[0_16px_40px_rgba(14,14,14,0.28)]'}
      `}
    >
      {/* Status indicator: 4px left pill */}
      <div
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${
          status === 'failed'
            ? 'bg-[var(--error)]'
            : status === 'success'
              ? 'bg-[var(--node-success)]'
              : 'bg-[var(--primary)]'
        }`}
      />
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2 !border-0" />

      <div className="flex items-center gap-2 mb-1 pl-1">
        {mode === 'branch' ? (
          <GitBranch className="h-3 w-3 text-[var(--primary)] shrink-0" />
        ) : (
          <div className="h-3 w-3 rounded-full bg-[rgba(184,195,255,0.6)] shrink-0" />
        )}
        <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[var(--on_surface_muted)]">
          {role}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-[var(--on_surface_muted)] ml-auto" />
        ) : (
          <ChevronDown className="h-3 w-3 text-[var(--on_surface_muted)] ml-auto" />
        )}
        <div>{statusIcons[status]}</div>
      </div>

      {isExpanded ? (
        <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap line-clamp-4">
          {label || 'Empty node — click to start chatting'}
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-foreground font-medium">
          {summary || label || 'Collapsed'}
        </p>
      )}

      <div className="mt-1 text-[9px] text-muted-foreground">
        {messageCount} msg{messageCount !== 1 ? 's' : ''}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2 !border-0" />
    </motion.div>
  );
}

export default memo(TreeNodeComponent);
