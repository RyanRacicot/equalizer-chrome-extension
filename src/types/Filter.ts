export interface Filter {
    [x: string]: any
    type: BiquadFilterType
    frequency: number
    gain: number
    Q?: number
    filter?: BiquadFilterNode
}

export interface Filters {
    [key: string]: Filter
}
