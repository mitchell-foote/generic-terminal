/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ReactorManagementShieldTakedownConfiguration, ReactorManagementShieldTakedownState, ShieldMonitorStatus } from "../types";

export type FrequencyMap = { [char: string]: number };

export function fillArrayWithRandomChars(n: number, frequencies: FrequencyMap): string[] {
    // Normalize frequencies to sum up to 1
    const totalFrequency = Object.values(frequencies).reduce((sum, freq) => sum + freq, 0);
    const normalizedFrequencies: FrequencyMap = {};
    for (const char in frequencies) {
        normalizedFrequencies[char] = frequencies[char] / totalFrequency;
    }

    // Create cumulative distribution array
    const chars = Object.keys(normalizedFrequencies);
    const cumulativeFrequencies: number[] = [];
    let cumulativeSum = 0;
    for (const char of chars) {
        cumulativeSum += normalizedFrequencies[char];
        cumulativeFrequencies.push(cumulativeSum);
    }

    // Function to get random character based on cumulative distribution
    const getRandomChar = () => {
        const randomValue = Math.random();
        for (let i = 0; i < cumulativeFrequencies.length; i++) {
            if (randomValue < cumulativeFrequencies[i]) {
                return chars[i];
            }
        }
        return chars[chars.length - 1]; // fallback in case of precision errors
    };

    // Fill the array
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
        result.push(getRandomChar());
    }

    return result;
}

export const getCurrentShieldValue = (gameState: ReactorManagementShieldTakedownState, overallState: ReactorManagementShieldTakedownConfiguration) => {
    let shieldValue = ShieldMonitorStatus.NORMAL;
    let level = 0;
    if (gameState.success) {
        return ShieldMonitorStatus.NO_SHIELD;
    }
    if (gameState.lever_1 === overallState.correctPositions.lever_1) {
        level++;
    }
    if (gameState.lever_2 === overallState.correctPositions.lever_2) {
        level++;
    }
    if (gameState.lever_3 === overallState.correctPositions.lever_3) {
        level++;
    }
    if (gameState.lever_4 === overallState.correctPositions.lever_4) {
        level++
    }
    if (gameState.lever_5 === overallState.correctPositions.lever_5) {
        level++
    }
    if (level === 5) {
        shieldValue = ShieldMonitorStatus.CRITICAL_ISSUES
    }
    if (level === 4) {
        shieldValue = ShieldMonitorStatus.DANGEROUS_ISSUES
    }
    else if (level === 3) {
        shieldValue = ShieldMonitorStatus.MODERATE_ISSUES
    }
    else if (level === 2) {
        shieldValue = ShieldMonitorStatus.MILD_ISSUES
    }
    else if (level === 1) {
        shieldValue = ShieldMonitorStatus.MILD_ISSUES
    }
    return shieldValue;
}