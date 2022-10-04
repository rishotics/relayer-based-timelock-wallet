import { ethers } from "ethers";
import React from "react";

export interface IProviderContext {
  websocketProvider: ethers.providers.WebSocketProvider;
  setWebsocketProvider: React.Dispatch<
    React.SetStateAction<ethers.providers.WebSocketProvider>
  >;
  biconomyInitialized: boolean;
}

export enum TransferMode {
  TokenMode,
  EthMode,
}
export interface ITransferDetails {
  id: ethers.BigNumber;
  lockingTime: ethers.BigNumber;
  currentTime: ethers.BigNumber
  amountEther: ethers.BigNumber;
  amountToken: ethers.BigNumber;
  sender: string;
  recepient: string;
  tokenAddress: string | null;
  mode: TransferMode;
  isActive: boolean;
}

export interface IInboundDepositProps {
  deposit: ITransferDetails;
}

export interface IOutboundDepositProps {
  deposit: ITransferDetails;
}
