import { BigNumber } from 'bignumber.js';

export type CSVString = string;

export type FileNames = Readonly<{
    acquisitionsCSVFileName: string;
    disposalsCSVFileName: string;
}>;

export type Acquisition = Readonly<{
    asset: string;
    date: Date;
    description: string;
    numUnits: BigNumber;
    costBasisUSD: BigNumber;
}>;

export type Disposal = Readonly<{
    asset: string;
    date: Date;
    description: string;
    numUnits: BigNumber;
    fairMarketValueUSD: BigNumber;
}>;

export type GainOrLoss = Readonly<{
    asset: string;
    description: string;
    dateAcquired: Date;
    dateDisposed: Date;
    salesPrice: BigNumber;
    costBasis: BigNumber;
    gainOrLoss: BigNumber;
    term: 'SHORT' | 'LONG';
}>;

export type Method = 'FIFO' | 'HIFO';