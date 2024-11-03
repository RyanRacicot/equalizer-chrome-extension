import { Filters } from "../types/Filter"

export default class Equalizer {
    private filters: Filters
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
        }

        console.log(`Created filters: `, this.filters)

        // Wire everything up
        this.inputStream
            .connect(this.filters["s0"].filter!)
            .connect(this.audioContext.destination)
    }

    private getDefaultFilterValues(): Filters {
        return {
            s0: {
                type: "lowshelf",
                frequency: 500,
                gain: -10.0,
            },
        }
    }
}
