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

    // console.log('acquisitions', acquisitions);
    // console.log('disposals', disposals);
    // console.log('gainsOrLosses.length', gainsOrLosses.length);
    // console.log('gainsOrLosses', JSON.stringify(gainsOrLosses, null, 4));
    // console.log('totalGainOrLoss', totalGainOrLoss.toString());

    printGainsOrLosses(gainsOrLosses);
})();

function prepareAcquisitions(fileName: string): ReadonlyArray<Acquisition> {
    const csvString: CSVString = fs.readFileSync(fileName).toString();
    const csvLines: ReadonlyArray<string> = csvString.split('\n').slice(1);
    const acquisitions: ReadonlyArray<Acquisition> = csvLines.map((csvLine: string) => {
        const csvFields: ReadonlyArray<string> = csvLine.split(',');
        return {
            asset: csvFields[0],
            date: new Date(csvFields[1]),
            description: csvFields[2],
            numUnits: new BigNumber(csvFields[3]),
            costBasisUSD: new BigNumber(csvFields[4])
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
            asset: csvFields[0],
            date: new Date(csvFields[1]),
            description: csvFields[2],
            numUnits: new BigNumber(csvFields[3]),
            fairMarketValueUSD: new BigNumber(csvFields[4])
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

function printGainsOrLosses(gainsOrLosses: ReadonlyArray<GainOrLoss>) {
    const shortTermGainsOrLosses: ReadonlyArray<GainOrLoss> = gainsOrLosses.filter((gainOrLoss) => {
        return gainOrLoss.term === 'SHORT';
    });

    const totalShortTermGainOrLoss: BigNumber = shortTermGainsOrLosses.reduce((result, gainOrLoss) => {
        return result.plus(gainOrLoss.gainOrLoss);
    }, new BigNumber(0));

    console.log('Short Term Gains or Losses');
    console.log(JSON.stringify(shortTermGainsOrLosses, null, 4));
    console.log('totalShortTermGainOrLoss', totalShortTermGainOrLoss.toString());

    const longTermGainsOrLosses: ReadonlyArray<GainOrLoss> = gainsOrLosses.filter((gainOrLoss) => {
        return gainOrLoss.term === 'LONG';
    });

    const totalLongTermGainOrLoss: BigNumber = longTermGainsOrLosses.reduce((result, gainOrLoss) => {
        return result.plus(gainOrLoss.gainOrLoss);
    }, new BigNumber(0));

    console.log('Long Term Gains or Losses');
    console.log(JSON.stringify(longTermGainsOrLosses, null, 4));
    console.log('totalLongTermGainOrLoss', totalLongTermGainOrLoss.toString());
}