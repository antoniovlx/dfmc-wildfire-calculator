
# DFMC Calculator

## Install

```js
npm install dfmc-wildfire-calculator
```

## Table of Contents

- [What is it](#what-is-it)
- [Usage](#usage)
- [Paremeters](#parameters)

## What is it

Dead fuel moisture responds solely to ambient environmental conditions and is critical in determining fire potential. 
This library estimate the percentage of [Dead Fuel Moisture Content (DFMC)](https://www.mdpi.com/2072-4292/13/21/4224) (< 6mm) for a prediction input values.

It can be used both in the **browser** and in **Node.js**.

## Usage

```ts
import { estimateDFMC } from 'dfmc-wildfire-calculator';
console.log(estimateDFMC("15:00", 2, "12:00", 21, 12, "Exposed", 13, "W")); // print 4 => 4% (DFMC with <6mm)
```

```js
const wildfire = require('dfmc-wildfire-calculator');
console.log(wildfire.estimateDFMC("15:00", 2, "12:00", 21, 12, "Exposed", 13, "W")); // print 4 => 4% (DFMC with <6mm)

```

## Parameters

```
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
 ```