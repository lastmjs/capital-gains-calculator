import * as fs from 'fs';
import {
    Acquisition,
    CSVString,
    Disposal,
    FileNames,
    GainOrLoss,
    Method
} from './types.d';
import { BigNumber } from 'bignumber.js';
import { calculateGainsAndLossesFIFO } from './fifo';
import { calculateGainsAndLossesHIFO } from './hifo';

(async () => {
    const fileNames: FileNames = {
        acquisitionsCSVFileName: process.argv[3],
        disposalsCSVFileName: process.argv[4]
    };

    const acquisitions: ReadonlyArray<Acquisition> = prepareAcquisitions(fileNames.acquisitionsCSVFileName);
    const disposals: ReadonlyArray<Disposal> = prepareDisposals(fileNames.disposalsCSVFileName);
    const gainsOrLosses: ReadonlyArray<GainOrLoss> = calculateGainsAndLosses(
        acquisitions,
        disposals,
        process.argv[2] as Method
    );
    const totalGainOrLoss: BigNumber = gainsOrLosses.reduce((result, gainOrLoss) => {
        return result.plus(gainOrLoss.gainOrLoss);
    }, new BigNumber(0));

    // console.log('acquisitions', acquisitions);
    // console.log('disposals', disposals);
    // console.log('gainsOrLosses', gainsOrLosses);
    // console.log('gainsOrLosses.length', gainsOrLosses.length);
    console.log('totalGainOrLoss', totalGainOrLoss.toString());
})();

function prepareAcquisitions(fileName: string): ReadonlyArray<Acquisition> {
    const csvString: CSVString = fs.readFileSync(fileName).toString();
    const csvLines: ReadonlyArray<string> = csvString.split('\n').slice(1);
    const acquisitions: ReadonlyArray<Acquisition> = csvLines.map((csvLine: string) => {
        const csvFields: ReadonlyArray<string> = csvLine.split(',');
        return {
            date: new Date(csvFields[0]),
            description: csvFields[1],
            numUnits: new BigNumber(csvFields[2]),
            costBasisUSD: new BigNumber(csvFields[3])
        };
    });

    return acquisitions;
}

function prepareDisposals(fileName: string): ReadonlyArray<Disposal> {
    const csvString: CSVString = fs.readFileSync(fileName).toString();
    const csvLines: ReadonlyArray<string> = csvString.split('\n').slice(1);
    const disposals: ReadonlyArray<Disposal> = csvLines.map((csvLine: string) => {
        const csvFields: ReadonlyArray<string> = csvLine.split(',');
        return {
            date: new Date(csvFields[0]),
            description: csvFields[1],
            numUnits: new BigNumber(csvFields[2]),
            fairMarketValueUSD: new BigNumber(csvFields[3])
        };
    });

    return disposals;
}

function calculateGainsAndLosses(
    acquisitions: ReadonlyArray<Acquisition>,
    disposals: ReadonlyArray<Disposal>,
    method: Method
): ReadonlyArray<GainOrLoss> {
    if (method === 'FIFO') {
        return calculateGainsAndLossesFIFO(
            acquisitions,
            disposals
        );
    }

    if (method === 'HIFO') {
        return calculateGainsAndLossesHIFO(
            acquisitions,
            disposals
        );
    }

    // TODO I wish TypeScript could figure out that reaching this return statement is not possible
    return [];
}