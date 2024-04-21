export type UpdateLeaveCommand = {
  id: string;
  type: 'REQUEST_LEAVE' | 'CANCEL_LEAVE';
  amount: number;
};
