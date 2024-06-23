/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect } from 'react'
import { ReactorManagementShieldTakedownConfiguration, ReactorManagementShieldTakedownState, ShieldMonitorStatus } from '../types';
import { FrequencyMap, fillArrayWithRandomChars, getCurrentShieldValue } from './helpers';
const LOW_CHAR = "░"
const PARTIAL_CHAR = "▒"
const FULL_CHAR = "▓"
const EMPTY_CHAR = " "

const NORMAL_FREQUENCY: FrequencyMap = { [FULL_CHAR]: 1 }
const MILD_FREQUENCY: FrequencyMap = { [FULL_CHAR]: .75, [PARTIAL_CHAR]: 0.25 };
const MODERATE_FREQUENCY: FrequencyMap = { [FULL_CHAR]: .5, [PARTIAL_CHAR]: .25, [LOW_CHAR]: .25 };
const DANGEROUS_ISSUES: FrequencyMap = { [FULL_CHAR]: .25, [PARTIAL_CHAR]: .25, [LOW_CHAR]: .25, [EMPTY_CHAR]: .25 };
const CRITICAL_ISSUES: FrequencyMap = { [PARTIAL_CHAR]: .30, [LOW_CHAR]: .30, [EMPTY_CHAR]: .40 };
const BREAKDOWN: FrequencyMap[] = [
    { [PARTIAL_CHAR]: .30, [LOW_CHAR]: .30, [EMPTY_CHAR]: .40 },
    { [PARTIAL_CHAR]: .20, [LOW_CHAR]: .30, [EMPTY_CHAR]: .50 },
    { [PARTIAL_CHAR]: .10, [LOW_CHAR]: .30, [EMPTY_CHAR]: .60 },
    { [LOW_CHAR]: .40, [EMPTY_CHAR]: .60 },
    { [LOW_CHAR]: .20, [EMPTY_CHAR]: .80 },
    { [LOW_CHAR]: .10, [EMPTY_CHAR]: .9 },
    { [EMPTY_CHAR]: 1 },
]

const NUMB_ELEMENTS = 18

export default function ShieldWall(props: { shield_takedown: ReactorManagementShieldTakedownConfiguration, shield_takedown_state: ReactorManagementShieldTakedownState }) {
    const [wall1, setWall1] = React.useState<string[]>(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
    const [wall2, setWall2] = React.useState<string[]>(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
    const [wall3, setWall3] = React.useState<string[]>(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
    const [wall4, setWall4] = React.useState<string[]>(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
    useEffect(() => {
        const interval = setInterval(() => {
            const shieldValue = getCurrentShieldValue(props.shield_takedown_state, props.shield_takedown);
            switch (shieldValue) {
                case ShieldMonitorStatus.NORMAL: {
                    setWall1(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
                    setWall2(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
                    setWall3(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
                    setWall4(fillArrayWithRandomChars(NUMB_ELEMENTS, NORMAL_FREQUENCY));
                    break;

                }
                case ShieldMonitorStatus.MILD_ISSUES: {
                    setWall1(fillArrayWithRandomChars(NUMB_ELEMENTS, MILD_FREQUENCY));
                    setWall2(fillArrayWithRandomChars(NUMB_ELEMENTS, MILD_FREQUENCY));
                    setWall3(fillArrayWithRandomChars(NUMB_ELEMENTS, MILD_FREQUENCY));
                    setWall4(fillArrayWithRandomChars(NUMB_ELEMENTS, MILD_FREQUENCY));
                    break;
                }
                case ShieldMonitorStatus.MODERATE_ISSUES: {
                    setWall1(fillArrayWithRandomChars(NUMB_ELEMENTS, MODERATE_FREQUENCY));
                    setWall2(fillArrayWithRandomChars(NUMB_ELEMENTS, MODERATE_FREQUENCY));
                    setWall3(fillArrayWithRandomChars(NUMB_ELEMENTS, MODERATE_FREQUENCY));
                    setWall4(fillArrayWithRandomChars(NUMB_ELEMENTS, MODERATE_FREQUENCY));
                    break;
                }
                case ShieldMonitorStatus.DANGEROUS_ISSUES: {
                    setWall1(fillArrayWithRandomChars(NUMB_ELEMENTS, DANGEROUS_ISSUES));
                    setWall2(fillArrayWithRandomChars(NUMB_ELEMENTS, DANGEROUS_ISSUES));
                    setWall3(fillArrayWithRandomChars(NUMB_ELEMENTS, DANGEROUS_ISSUES));
                    setWall4(fillArrayWithRandomChars(NUMB_ELEMENTS, DANGEROUS_ISSUES));
                    break;
                }
                case ShieldMonitorStatus.CRITICAL_ISSUES: {
                    setWall1(fillArrayWithRandomChars(NUMB_ELEMENTS, CRITICAL_ISSUES));
                    setWall2(fillArrayWithRandomChars(NUMB_ELEMENTS, CRITICAL_ISSUES));
                    setWall3(fillArrayWithRandomChars(NUMB_ELEMENTS, CRITICAL_ISSUES));
                    setWall4(fillArrayWithRandomChars(NUMB_ELEMENTS, CRITICAL_ISSUES));
                    break;
                }
                case ShieldMonitorStatus.NO_SHIELD: {
                    clearInterval(interval);
                    let value = 0;
                    const secondInterval = setInterval(() => {
                        if (value >= BREAKDOWN.length * 2) {
                            return clearInterval(secondInterval);
                        }
                        setWall1(fillArrayWithRandomChars(NUMB_ELEMENTS, BREAKDOWN[Math.floor(value / 2)]));
                        setWall2(fillArrayWithRandomChars(NUMB_ELEMENTS, BREAKDOWN[Math.floor(value / 2)]));
                        setWall3(fillArrayWithRandomChars(NUMB_ELEMENTS, BREAKDOWN[Math.floor(value / 2)]));
                        setWall4(fillArrayWithRandomChars(NUMB_ELEMENTS, BREAKDOWN[Math.floor(value / 2)]));
                        value++;
                    }, 1000)
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [props.shield_takedown_state, props.shield_takedown])
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: "space-around" }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: "center" }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
                    {wall1.map((char, index) => <div key={index} style={{ fontSize: '20px' }}>{char}</div>)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
                    {wall2.map((char, index) => <div key={index} style={{ fontSize: '20px' }}>{char}</div>)}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: "center" }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
                    {wall3.map((char, index) => <div key={index} style={{ fontSize: '20px' }}>{char}</div>)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center" }}>
                    {wall4.map((char, index) => <div key={index} style={{ fontSize: '20px' }}>{char}</div>)}
                </div>
            </div>
        </div>
    )
}