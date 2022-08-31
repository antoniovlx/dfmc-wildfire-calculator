//@ts-check

import entradas from '../data/data.json';
import entradasCorrector from '../data/corrector_data.json';
import { toMonthName } from './util';

const aspectValues = new Set(['N', 'S', 'W', 'O'] as const);
const solarTimeValues = new Set(['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'] as const);
const soilValues = new Set(['Exposed', 'Shaded'] as const);
const monthPredictionValues = new Set(['February-March-April-August-September-October', 'May-June-July', 'November-December-January'] as const);

type AspectType = typeof aspectValues extends Set<infer T> ? T : never;
type SolarTimeType = typeof solarTimeValues extends Set<infer T> ? T : never;
type SoilType = typeof soilValues extends Set<infer T> ? T : never;

const isOfType = (keyInput: string, allowedValues: Set<String>): boolean => (allowedValues as Set<string>).has(keyInput)

/**
 * @description This function estimate the DFMC (Dead Fuel Moisture Content DFMC estimation)
 * @param  {string} predictionTime - The time of prediction [hh:mm]
 * @param  {number} predictionMonth - The month of prediction in number [1-12]
 * @param  {SolarTime} solarTime - Time (sun hour) is equal to local time - 2 (summer) and local time - 1 (winter). Values: "08:00", "10:00", "12:00", "16:00", "18:00" 
 * @param  {number} airTemperature - The temperature of air (Centigrade scale)
 * @param  {number} relativeHumidity - The relative humidity in percentage (%)
 * @param  {Soil} soil - Soil type. Values: "Exposed" (Less than 50% shading of surface fuels), "Shaded" (50% or more shading of surface fuels)
 * @param  {number} slope - Terrain slope is reported in degrees from zero (horizontal) to 90 (vertical)
 * @param  {AspectValues} aspect - Values: "N" (North), "S" (South), "W" (West), "E" (East)
 * @returns {number} Dead Fuel Moisture Content estimation (< 6mm) in percentage (%)
 */
export function estimateDFMC(predictionTime: string, predictionMonth: number, solarTime: SolarTimeType, airTemperature: number, relativeHumidity: number, soil: SoilType, slope: number, aspect: AspectType): number {
    var dfmc = 0;

    if (checkFields(predictionTime, predictionMonth, solarTime, airTemperature, relativeHumidity, soil, slope, aspect)) {
        let predictionTimeString = getPredictionTimeString(predictionTime);
        let airTemperatureString = getAirTemperatureString(airTemperature);
        let relativeHumidityString = getRelativeHumidityString(relativeHumidity);

        dfmc = findDFMCRegistry(predictionTimeString, airTemperatureString, relativeHumidityString);

        if (predictionTime >= "08:00" && predictionTime <= "19:59") {
            let predictionMonthString = getPredictionMonthString(predictionMonth);
            let slopeString = getSlopeString(slope);

            // sumamos corrector
            const correctorValue = findDFMCCorrectorRegistry(predictionMonthString, soil,
                aspect, slopeString, solarTime);

            dfmc += correctorValue;
        }
    }
    return dfmc;
}

function checkFields(predictionTime: string, predictionMonth: number, solarTime: SolarTimeType, airTemperature: number, relativeHumidity: number, soil: SoilType, slope: number, aspect: AspectType) {
    // predictionTime: check time format
    if (typeof predictionTime[0] === 'number' && typeof predictionTime[1] === 'number'
        && predictionTime[2] === ':' && typeof predictionTime[3] === 'number' && typeof predictionTime[4] === 'number') {
        throw new RangeError("predictionTime must be a correct time [hh:mm]");
    }

    // predictionMonth
    if (predictionMonth > 12 || predictionMonth < 1) {
        throw new RangeError("predictionMonth must be between [1, 12]");
    }

    // solarTime: check if the value is allowed
    if (!isOfType(solarTime, solarTimeValues)) {
        throw new RangeError("solarTime must be a valid value: " + Array.from(solarTimeValues.values()));
    }

    // airTemperature
    if (airTemperature > 200 || relativeHumidity < 0) {
        throw new RangeError("airTemperature must be between [0, 200]");
    }

    // relativeHumidity
    if (relativeHumidity > 100 || relativeHumidity < 0) {
        throw new RangeError("relativeHumidiy must be between [0, 100]");
    }

    // soil: check if the value is allowed
    if (!isOfType(soil, soilValues)) {
        throw new RangeError("soil must be a valid value: " + Array.from(soilValues.values()));
    }

    // slope
    if (slope > 90 || slope < 0) {
        throw new RangeError("slope must be between [0, 90]");
    }

    // aspect: check if the value is allowed
    if (!isOfType(aspect, aspectValues)) {
        throw new RangeError("aspect must be a valid value: " + Array.from(aspectValues.values()));
    }

    return true;
}

function getPredictionMonthString(monthValue: number): string {
    let predictionMonthString = '';
    const monthName = toMonthName(monthValue);

    [...monthPredictionValues].forEach(month => {
        if (month.includes(monthName)) {
            predictionMonthString = month;
        }
    });

    return predictionMonthString;
}


function getPredictionTimeString(timeValue) {
    if (timeValue >= "08:00" && timeValue <= "19:59") {
        return "08:00-19:59";
    }
    else {
        return "20:00-07:59";
    }
}
function getAirTemperatureString(temperature) {
    if (temperature >= 0 && temperature <= 9) {
        return "0-9";
    }
    else if (temperature >= 10 && temperature <= 20) {
        return "10-20";
    }
    else if (temperature >= 21 && temperature <= 31) {
        return "21-31";
    }
    else if (temperature >= 32 && temperature <= 42) {
        return "32-42";
    }
    else if (temperature >= 43) {
        return "43";
    }
}
function getRelativeHumidityString(hrValue) {
    let minInterval = 0;
    let maxInterval = 4;

    if(hrValue === 100){
        return "100";
    }
    
    while (maxInterval != 99) {
        if (hrValue >= minInterval && hrValue <= maxInterval) {
            return minInterval + "-" + maxInterval;
        }
        minInterval += 5;
        maxInterval += 5;
    } 
}
function getSlopeString(slope) {
    if (slope > 0 && slope <= 30) {
        return "0-30";
    }
    else if (slope > 30) {
        return ">30";
    }
    else {
        return "0";
    }
}

function findDFMCRegistry(predictionTime, airTemperature, relativeHumidity) {
    const rows = entradas.entradas.entrada;

    // Start to fetch the data by using TagName 
    for (let i = 0; i < rows.length; i++) {
        let predictionTimeValue = rows[i]["horaPrevision"];
        let humedadRelativaValue = rows[i]["humedadRelativa"];
        let airTemperatureValue = rows[i]["temperaturaAire"];

        if (predictionTimeValue === predictionTime && airTemperatureValue === airTemperature
            && humedadRelativaValue === relativeHumidity) {
            return rows[i]["humedadResultado"];
        }
    }
}

function findDFMCCorrectorRegistry(predictionMonth: string, soil: string, aspect: AspectType, slope: string, solarTime: string) {
    const rows = entradasCorrector.entradas.entrada;

    // Start to fetch the data by using TagName 
    for (let i = 0; i < rows.length; i++) {
        let predictionMonthValue = rows[i]["mesPrevision"];
        let soilValue = rows[i]["suelo"];
        let aspectValue = rows[i]["exposicion"];
        let slopeValue = rows[i]["pendienteHumedad"];
        let solarTimeValue = rows[i]["horaSolar"];
        if (predictionMonthValue === predictionMonth && soilValue.includes(soil)
            && aspectValue === aspect && slopeValue === slope && solarTimeValue === solarTime) {
            return rows[i]["humedadResultado"];
        }
    }
}




