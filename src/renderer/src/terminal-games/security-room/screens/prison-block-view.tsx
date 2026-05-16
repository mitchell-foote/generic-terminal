import * as React from 'react';
import { GameMode, SystemStatus } from '../types';

interface PrisonBlockViewProps {
    doors: Record<string, SystemStatus>
    shutdownPhase?: number
    mode?: GameMode
}

const LAYOUT: Record<GameMode, { cellPositions: number[]; fugitiveXs: number[] }> = {
    single: { cellPositions: [270], fugitiveXs: [270] },
    multi: { cellPositions: [54, 162, 270, 378, 486], fugitiveXs: [210, 240, 270, 300, 330] }
}

const OPEN = SystemStatus.Offline

const barFade = (isOpen: boolean): React.CSSProperties => ({
    transition: 'opacity 0.7s ease',
    opacity: isOpen ? 0 : 1,
})

// When a cell opens, prisoner slides down and fades — conveying they've moved toward the exit
const prisonerExit = (isOpen: boolean): React.CSSProperties => ({
    transition: 'opacity 0.5s ease 0.3s, transform 1.0s ease 0.2s',
    opacity: isOpen ? 0 : 1,
    transform: isOpen ? 'translateY(60px)' : 'translateY(0)',
})

const pathColor = (isOpen: boolean) => isOpen ? 'limegreen' : '#ff1d3e'

interface CellProps {
    cx: number
    cy: number
    isOpen: boolean
    label: string
}

const Cell: React.FC<CellProps> = ({ cx, cy, isOpen, label }) => {
    const cellX = cx - 40
    const cellY = cy - 70
    const cellW = 80
    const cellH = 145
    const barXs = [cx - 28, cx - 14, cx, cx + 14, cx + 28]
    const headCY = cy - 8
    const bodyY = cy + 8
    const color = isOpen ? 'limegreen' : '#ff1d3e'

    return (
        <g>
            {/* Label above the cell */}
            <text
                x={cx} y={cellY - 6}
                textAnchor="middle"
                fill={color}
                fontSize={9}
                letterSpacing={1}
                style={{ transition: 'fill 0.5s ease' }}
            >
                {label}
            </text>

            {/* Cell outline */}
            <rect
                x={cellX} y={cellY}
                width={cellW} height={cellH}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                style={{ transition: 'stroke 0.5s ease' }}
            />

            {/* Bars — full cell height */}
            <g style={barFade(isOpen)}>
                {barXs.map((bx, i) => (
                    <line
                        key={i}
                        x1={bx} y1={cellY + 2}
                        x2={bx} y2={cellY + cellH - 2}
                        stroke="#ff1d3e"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                ))}
            </g>

            {/* Prisoner — slides down and fades when cell opens */}
            <g style={prisonerExit(isOpen)}>
                <circle cx={cx} cy={headCY} r={9} fill="limegreen" />
                <rect x={cx - 6} y={bodyY} width={12} height={18} fill="limegreen" rx={2} />
            </g>

            {isOpen && (
                <text
                    x={cx} y={cellY + cellH - 8}
                    textAnchor="middle"
                    fill="limegreen"
                    fontSize={8}
                    letterSpacing={1}
                >
                    OPEN
                </text>
            )}
        </g>
    )
}

const PrisonBlockView: React.FC<PrisonBlockViewProps> = ({ doors, shutdownPhase = 0, mode = 'multi' }) => {
    const layout = LAYOUT[mode]
    const cellsOpen = layout.cellPositions.map((_, i) => doors[`cell_${i + 1}`] === OPEN)
    const allCellsOpen = cellsOpen.every(Boolean)
    const checkpointOpen = doors['checkpoint'] === OPEN
    const fullyOpen = allCellsOpen && checkpointOpen

    const statusText = fullyOpen
        ? '[ CONTAINMENT BREACH — ESCAPED ]'
        : allCellsOpen
            ? '[ CELLS OPEN — ROUTE TO EXIT ]'
            : '[ SECURED ]'
    const statusColor = fullyOpen ? '#ff1d3e' : 'limegreen'

    // Fugitives at checkpoint: fade in when all cells open, slide off bottom on shutdown
    const fugitiveStyle: React.CSSProperties = {
        transition: 'opacity 0.8s ease, transform 2.0s ease-in',
        opacity: allCellsOpen ? 1 : 0,
        transform: shutdownPhase >= 3 ? 'translateY(300px)' : 'translateY(0)',
    }

    const corridorY = 230

    return (
        <svg
            viewBox="0 0 540 385"
            width="100%"
            height="100%"
            style={{ display: 'block' }}
        >
            <rect width="540" height="385" fill="#000" />

            {/* Title */}
            <text x="270" y="26" textAnchor="middle" fill="limegreen" fontSize={14} letterSpacing={2}>
                BLOCK ALPHA
            </text>
            <line x1="20" y1="35" x2="520" y2="35" stroke="limegreen" strokeWidth={1} opacity={0.35} />

            {/* Cells */}
            {layout.cellPositions.map((cx, i) => (
                <Cell key={`cell-${i}`} cx={cx} cy={140} isOpen={cellsOpen[i]} label={`CELL ${i + 1}`} />
            ))}

            {/* Corridor floor */}
            <line x1="20" y1={corridorY} x2="520" y2={corridorY} stroke="limegreen" strokeWidth={1.5} opacity={0.3} />

            {/* Line from corridor down to fugitives */}
            <line
                x1="270" y1={corridorY}
                x2="270" y2={corridorY + 18}
                stroke={pathColor(checkpointOpen)}
                strokeWidth={2}
                style={{ transition: 'stroke 0.5s ease' }}
            />

            {/* Fugitives gathered at checkpoint — slide off bottom on shutdown */}
            <g style={fugitiveStyle}>
                {layout.fugitiveXs.map((fx, i) => (
                    <g key={`fugitive-${i}`}>
                        <circle cx={fx} cy={corridorY + 30} r={7} fill="limegreen" opacity={0.9} />
                        <rect x={fx - 5} y={corridorY + 38} width={10} height={15} fill="limegreen" rx={2} opacity={0.9} />
                    </g>
                ))}
            </g>

            {/* Line from fugitives down to checkpoint node */}
            <line
                x1="270" y1={corridorY + 55}
                x2="270" y2={corridorY + 72}
                stroke={pathColor(checkpointOpen)}
                strokeWidth={2}
                style={{ transition: 'stroke 0.5s ease' }}
            />

            {/* Checkpoint node */}
            <circle
                cx={270} cy={corridorY + 78}
                r={6}
                fill={checkpointOpen ? 'limegreen' : 'none'}
                stroke={pathColor(checkpointOpen)}
                strokeWidth={1.5}
                style={{ transition: 'fill 0.5s ease, stroke 0.5s ease' }}
            />
            <text
                x="270" y={corridorY + 94}
                textAnchor="middle"
                fill={pathColor(checkpointOpen)}
                fontSize={10}
                letterSpacing={1}
                style={{ transition: 'fill 0.5s ease' }}
            >
                {checkpointOpen ? 'CHECKPOINT  OPEN' : 'CHECKPOINT  LOCKED'}
            </text>

            {/* Status bar */}
            <line x1="20" y1="358" x2="520" y2="358" stroke="limegreen" strokeWidth={1} opacity={0.35} />
            <text
                x="270" y="374"
                textAnchor="middle"
                fill={statusColor}
                fontSize={12}
                letterSpacing={1}
                style={{ transition: 'fill 0.5s ease' }}
            >
                {statusText}
            </text>
        </svg>
    )
}

export default PrisonBlockView
