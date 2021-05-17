import {
    Acquisition,
    Disposal,
    GainOrLoss
} from './types.d';
import { BigNumber } from 'bignumber.js';

export function calculateGainsAndLossesFIFO(
    acquisitions: ReadonlyArray<Acquisition>,
    disposals: ReadonlyArray<Disposal>,
    gainsOrLosses: ReadonlyArray<GainOrLoss> = []
): ReadonlyArray<GainOrLoss> {
    if (
        disposals.length === 0 ||
        acquisitions.length === 0
    ) {
        return gainsOrLosses;
    }

    const currentDisposal: Disposal = disposals[0];
    const currentAcquisition: Acquisition = acquisitions[0];
    
    const currentDisposalGreaterThanOrEqualToCurrentAcquisition: boolean = currentDisposal.numUnits.gte(currentAcquisition.numUnits)

    if (currentDisposalGreaterThanOrEqualToCurrentAcquisition === true) {
        const {
            remainingDisposal,
            gainOrLoss
        } = handleDisposalGreaterThanOrEqualToAcquisition(
            currentDisposal,
            currentAcquisition
        );

        // TODO move this into the handle function?
        const newAcquisitions: ReadonlyArray<Acquisition> = acquisitions.slice(1);
        const newDisposals: ReadonlyArray<Disposal> = [
            remainingDisposal,
            ...disposals.slice(1)
        ];
        const newGainsOrLosses: ReadonlyArray<GainOrLoss> = [
            ...gainsOrLosses,
            gainOrLoss
        ];

        return calculateGainsAndLossesFIFO(
            newAcquisitions,
            newDisposals,
            newGainsOrLosses
        );
    }
    else {
        const {
            remainingAcquisition,
            gainOrLoss
        } = handleDisposalLessThanAcquisition(
            currentDisposal,
            currentAcquisition
        );

        // TODO move this into the handle function?
        const newAcquisitions: ReadonlyArray<Acquisition> = [
            remainingAcquisition,
            ...acquisitions.slice(1)
        ];
        const newDisposals: ReadonlyArray<Disposal> = disposals.slice(1);
        const newGainsOrLosses: ReadonlyArray<GainOrLoss> = [
            ...gainsOrLosses,
            gainOrLoss
        ];

        return calculateGainsAndLossesFIFO(
            newAcquisitions,
            newDisposals,
            newGainsOrLosses
        );
    }
}

function handleDisposalGreaterThanOrEqualToAcquisition(
    disposal: Disposal,
    acquisition: Acquisition
): {
    remainingDisposal: Disposal;
    gainOrLoss: GainOrLoss;
} {
    const salesPricePerUnit: BigNumber = disposal.fairMarketValueUSD.dividedBy(disposal.numUnits);

    const remainingDisposalNumUnits: BigNumber = disposal.numUnits.minus(acquisition.numUnits);
    const remainingDisposal: Disposal = {
        date: disposal.date,
        description: disposal.description,
        numUnits: remainingDisposalNumUnits,
        fairMarketValueUSD: remainingDisposalNumUnits.multipliedBy(salesPricePerUnit)
    };

    const salesPrice: BigNumber = acquisition.numUnits.multipliedBy(salesPricePerUnit);

    const gainOrLoss: GainOrLoss = {
        dateAcquired: acquisition.date,
        dateDisposed: disposal.date,
        salesPrice,
        gainOrLoss: salesPrice.minus(acquisition.costBasisUSD)
    };

    return {
        remainingDisposal,
        gainOrLoss
    };
}

function handleDisposalLessThanAcquisition(
    disposal: Disposal,
    acquisition: Acquisition
): {
    remainingAcquisition: Acquisition;
    gainOrLoss: GainOrLoss;
} {
    const costBasisPerUnit: BigNumber = acquisition.costBasisUSD.dividedBy(acquisition.numUnits);
    const remainingAcquisitionNumUnits: BigNumber = acquisition.numUnits.minus(disposal.numUnits);
    const remainingAcquisition: Acquisition = {
        date: acquisition.date,
        description: acquisition.description,
        numUnits: remainingAcquisitionNumUnits,
        costBasisUSD: remainingAcquisitionNumUnits.multipliedBy(costBasisPerUnit)
    };

    const gainOrLoss: GainOrLoss = {
        dateAcquired: acquisition.date,
        dateDisposed: disposal.date,
        salesPrice: disposal.fairMarketValueUSD,
        gainOrLoss: disposal.fairMarketValueUSD.minus(disposal.numUnits.multipliedBy(costBasisPerUnit))
    };

    return {
        remainingAcquisition,
        gainOrLoss
    };
}