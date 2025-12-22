// Valid order status transitions
export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['packed', 'cancelled'],
  packed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export function getValidNextStatuses(currentStatus: string): string[] {
  return ORDER_STATUS_FLOW[currentStatus] || [];
}

export function canTransitionTo(currentStatus: string, newStatus: string): boolean {
  const validStatuses = getValidNextStatuses(currentStatus);
  return validStatuses.includes(newStatus);
}

export function isTerminalStatus(status: string): boolean {
  return status === 'delivered' || status === 'cancelled';
}

export function getStatusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label || status;
}

export function getStatusColor(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.color || 'bg-muted text-muted-foreground';
}
