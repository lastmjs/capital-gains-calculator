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
        asset: disposal.asset,
        date: disposal.date,
        description: disposal.description,
        numUnits: remainingDisposalNumUnits,
        fairMarketValueUSD: remainingDisposalNumUnits.multipliedBy(salesPricePerUnit)
    };

    const salesPrice: BigNumber = acquisition.numUnits.multipliedBy(salesPricePerUnit);

    const gainOrLoss: GainOrLoss = {
        asset: disposal.asset,
        description: `${acquisition.numUnits} ${disposal.asset}`,
        dateAcquired: acquisition.date,
        dateDisposed: disposal.date,
        salesPrice,
        costBasis: acquisition.costBasisUSD,
        gainOrLoss: salesPrice.minus(acquisition.costBasisUSD),
        term: calculateTerm(
            acquisition.date,
            disposal.date
        )
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
        asset: acquisition.asset,
        date: acquisition.date,
        description: acquisition.description,
        numUnits: remainingAcquisitionNumUnits,
        costBasisUSD: remainingAcquisitionNumUnits.multipliedBy(costBasisPerUnit)
    };

    const gainOrLossCostBasis = disposal.numUnits.multipliedBy(costBasisPerUnit);

    const gainOrLoss: GainOrLoss = {
        asset: disposal.asset,
        description: `${disposal.numUnits} ${disposal.asset}`,
        dateAcquired: acquisition.date,
        dateDisposed: disposal.date,
        salesPrice: disposal.fairMarketValueUSD,
        costBasis: gainOrLossCostBasis,
        gainOrLoss: disposal.fairMarketValueUSD.minus(gainOrLossCostBasis),
        term: calculateTerm(
            acquisition.date,
            disposal.date
        )
    };

    return {
        remainingAcquisition,
        gainOrLoss
    };
}

function calculateTerm(
    dateAcquired: Date,
    dateDisposed: Date
): 'SHORT' | 'LONG' {
    const dateAcquiredPlusOneYear: Date = new Date(dateAcquired);
    dateAcquiredPlusOneYear.setFullYear(dateAcquired.getFullYear() + 1);

    if (dateDisposed.getTime() <= dateAcquiredPlusOneYear.getTime()) {
        return 'SHORT';
    }
    else {
        return 'LONG';
    }
}