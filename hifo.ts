import {
    Acquisition,
    Disposal,
    GainOrLoss
} from './types.d';
import { calculateGainsAndLossesFIFO } from './fifo';

export function calculateGainsAndLossesHIFO(
    acquisitions: ReadonlyArray<Acquisition>,
    disposals: ReadonlyArray<Disposal>,
    gainsOrLosses: ReadonlyArray<GainOrLoss> = []
): ReadonlyArray<GainOrLoss> {
    const orderedAcquisitions: ReadonlyArray<Acquisition> = [...acquisitions].sort((a, b) => {
        if (a.costBasisUSD.gt(b.costBasisUSD)) {
            return -1;
        }

        if (a.costBasisUSD.lt(b.costBasisUSD)) {
            return 1;
        }

        return 0;
    });

    return calculateGainsAndLossesFIFO(
        orderedAcquisitions,
        disposals
    );
}