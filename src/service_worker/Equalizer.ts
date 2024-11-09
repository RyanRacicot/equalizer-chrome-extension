import { Filters } from "../types/Filter"

export default class Equalizer {
    filters: Filters
    private audioContext: AudioContext
    private inputStream!: MediaStreamAudioSourceNode
    private outputStream: MediaStream
    private enabled: boolean = true

    constructor(audioContext: AudioContext, outputStream: MediaStream) {
        this.audioContext = audioContext
        this.outputStream = outputStream
        this.filters = this.getDefaultFilterValues()
    }

    async init(): Promise<void> {
        this.inputStream = this.audioContext.createMediaStreamSource(
            this.outputStream
        )

        // Init filters
        for (var [_, filter] of Object.entries(this.filters)) {
            filter.filter = this.audioContext.createBiquadFilter()
            filter.filter.type = filter.type
            filter.filter.frequency.setValueAtTime(
                filter.frequency,
                this.audioContext.currentTime
            )
            filter.filter.gain.setValueAtTime(
                filter.gain,
                this.audioContext.currentTime
            )
            if (filter.Q) {
                filter.filter.Q.setValueAtTime(
                    filter.Q,
                    this.audioContext.currentTime
                )
            }
        }

        console.log(`Created filters: `, this.filters)

        // Wire everything up, order matters
        this.inputStream
            .connect(this.filters["s0"].filter!)
            .connect(this.filters["s1"].filter!)
            .connect(this.filters["s2"].filter!)
            .connect(this.filters["s3"].filter!)
            .connect(this.filters["s4"].filter!)
            .connect(this.filters["s5"].filter!)
            .connect(this.audioContext.destination)
    }

    async update(filters: Filters): Promise<void> {
        for (var [filterId, filter] of Object.entries(filters)) {
            this.filters[filterId].filter?.gain.setValueAtTime(
                filter.gain,
                this.audioContext.currentTime
            )
            this.filters[filterId].gain = filter.gain
        }
    }

    private getDefaultFilterValues(): Filters {
        return {
            s0: {
                type: "lowshelf",
                frequency: 60,
                gain: 16.0,
            },
            s1: {
                type: "peaking",
                frequency: 150,
                gain: 5.0,
                Q: 1.0,
            },
            s2: {
                type: "peaking",
                frequency: 400,
                gain: -10.0,
                Q: 1.0,
            },
            s3: {
                type: "peaking",
                frequency: 1_000,
                gain: -10.0,
                Q: 1.0,
            },
            s4: {
                type: "peaking",
                frequency: 2_400,
                gain: -10.0,
                Q: 1.0,
            },
            s5: {
                type: "highshelf",
                frequency: 11_000,
                gain: -10.0,
            },
        }
    }
}
