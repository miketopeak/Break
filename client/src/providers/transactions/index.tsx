import * as React from "react";
import { TransactionSignature } from "@solana/web3.js";
import { useConfig } from "../api";
import { useBlockhash } from "../blockhash";
import { useAccountIds } from "../solana";
import { TpsProvider, TpsContext } from "./tps";
import { createTransaction } from "./create";
import { SelectedTxProvider } from "./selected";
import { useSocket } from "../socket";

const CONFIRMATION_TIME_LOOK_BACK = 75;

export type PendingTransaction = {
  sentAt: number;
  retryId?: number;
  timeoutId?: number;
};

type SuccessState = {
  status: "success";
  confirmationTime: number;
  signature: TransactionSignature;
};

type TimeoutState = {
  status: "timeout";
  signature: TransactionSignature;
};

type PendingState = {
  status: "pending";
  pending: PendingTransaction;
  signature: TransactionSignature;
};

export type TransactionStatus = "success" | "timeout" | "pending";

export type TransactionState = SuccessState | TimeoutState | PendingState;

export enum ActionType {
  NewTransaction,
  UpdateIds,
  TimeoutTransaction,
  ResetState
}

type UpdateIds = {
  type: ActionType.UpdateIds;
  activeIds: Set<number>;
};

type NewTransaction = {
  type: ActionType.NewTransaction;
  trackingId: number;
  signature: TransactionSignature;
  pendingTransaction: PendingTransaction;
};

type TimeoutTransaction = {
  type: ActionType.TimeoutTransaction;
  trackingId: number;
};

type ResetState = {
  type: ActionType.ResetState;
};

type Action = NewTransaction | UpdateIds | TimeoutTransaction | ResetState;

type State = TransactionState[];
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.NewTransaction: {
      const { signature, pendingTransaction } = action;
      return [
        ...state,
        {
          signature,
          status: "pending",
          pending: pendingTransaction
        }
      ];
    }

    case ActionType.TimeoutTransaction: {
      const trackingId = action.trackingId;
      if (trackingId >= state.length) return state;
      const timeout = state[trackingId];
      if (timeout.status !== "pending") return state;
      clearInterval(timeout.pending.retryId);

      return state.map(tx => {
        if (tx.signature === timeout.signature) {
          return {
            status: "timeout",
            signature: tx.signature
          };
        } else {
          return tx;
        }
      });
    }

    case ActionType.UpdateIds: {
      const ids = action.activeIds;
      return state.map((tx, id) => {
        if (tx.status === "pending" && ids.has(id)) {
          clearTimeout(tx.pending.timeoutId);
          clearInterval(tx.pending.retryId);
          const confirmationTime = timeElapsed(tx.pending.sentAt);
          return {
            status: "success",
            signature: tx.signature,
            confirmationTime
          };
        }
        return tx;
      });
    }

    case ActionType.ResetState: {
      state.forEach(tx => {
        if (tx.status === "pending") {
          clearTimeout(tx.pending.timeoutId);
          clearInterval(tx.pending.retryId);
        }
      });
      return [];
    }
  }
}

export type Dispatch = (action: Action) => void;
const StateContext = React.createContext<State | undefined>(undefined);
const DispatchContext = React.createContext<Dispatch | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };
export function TransactionsProvider({ children }: ProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, []);
  const config = useConfig();
  const activeIds = useAccountIds();

  React.useEffect(() => {
    if (!config) return;
    dispatch({
      type: ActionType.ResetState
    });
  }, [config]);

  React.useEffect(() => {
    dispatch({ type: ActionType.UpdateIds, activeIds });
  }, [activeIds]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <SelectedTxProvider>
          <TpsProvider>{children}</TpsProvider>
        </SelectedTxProvider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function timeElapsed(sentAt: number): number {
  const now = performance.now();
  return parseFloat(((now - sentAt) / 1000).toFixed(3));
}

export function useDispatch() {
  const dispatch = React.useContext(DispatchContext);
  if (!dispatch) {
    throw new Error(`useDispatch must be used within a TransactionsProvider`);
  }

  return dispatch;
}

export function useTransactions() {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error(
      `useTransactions must be used within a TransactionsProvider`
    );
  }

  return state;
}

export function useConfirmedCount() {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error(
      `useConfirmedCount must be used within a TransactionsProvider`
    );
  }
  return state.filter(({ status }) => status === "success").length;
}

export function useDroppedCount() {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error(
      `useDroppedCount must be used within a TransactionsProvider`
    );
  }
  return state.filter(({ status }) => status === "timeout").length;
}

export function useAvgConfirmationTime() {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error(
      `useAvgConfirmationTime must be used within a TransactionsProvider`
    );
  }

  const confirmed = state.reduce((confirmed: number[], tx) => {
    if (tx.status === "success") {
      confirmed.push(tx.confirmationTime);
    }
    return confirmed;
  }, []);

  const start = Math.max(confirmed.length - CONFIRMATION_TIME_LOOK_BACK, 0);
  const transactions = confirmed.slice(start);
  const count = transactions.length;
  if (count === 0) return 0;
  const sum = transactions.reduce((sum, time) => sum + time, 0);
  return sum / count;
}

export function useCreatedCount() {
  const state = React.useContext(StateContext);
  if (!state) {
    throw new Error(
      `useCreatedCount must be used within a TransactionsProvider`
    );
  }
  return state.length;
}

export function useTps() {
  const tps = React.useContext(TpsContext);
  if (tps === undefined)
    throw new Error(`useTps must be used within a TransactionsProvider`);
  return tps;
}

export function useCreateTx() {
  const config = useConfig();
  const idCounter = React.useRef<number>(0);
  const programAccount = config?.programAccount;

  // Reset counter when program account is set
  React.useEffect(() => {
    idCounter.current = 0;
  }, [programAccount]);

  const blockhash = useBlockhash();
  const dispatch = useDispatch();
  const socket = useSocket();

  if (!blockhash || !socket || !config) return undefined;

  return () => {
    const id = idCounter.current;
    if (id < config.accountCapacity) {
      idCounter.current++;
      createTransaction(blockhash, config, id, dispatch, socket);
    } else {
      console.error("Exceeded account capacity");
    }
  };
}
