import { BigNumber } from 'bignumber.js';

export type CSVString = string;

export type FileNames = Readonly<{
    acquisitionsCSVFileName: string;
    disposalsCSVFileName: string;
}>;

export type Acquisition = Readonly<{
    date: Date;
    description: string;
    numUnits: BigNumber;
    costBasisUSD: BigNumber;
}>;

export type Disposal = Readonly<{
    date: Date;
    description: string;
    numUnits: BigNumber;
    fairMarketValueUSD: BigNumber;
}>;

export type GainOrLoss = Readonly<{
    dateAcquired: Date;
    dateDisposed: Date;
    salesPrice: BigNumber;
    gainOrLoss: BigNumber;
    // TODO add short term or long term designation, do a quick check on the dates to determine if it was held for a year or more
}>;

export type Method = 'FIFO' | 'HIFO';