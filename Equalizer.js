import { loadExternalJSON } from "./loadJSON.js";

export default class Equalizer {

    constructor(tabID) {
        this.tabID = tabID;
        this.enabled = true;
        loadExternalJSON('filters.json', 
        (filtersObject) => {
            this.filters = filtersObject
            this.init()
        }, 
        (e) => {
            console.error('Error loading filters.json. Setting to hard-coded default')
            this.filters = {
                "s0": {
                    "type": "lowshelf",
                    "frequency": 100,
                    "gain": 0,
                    "filter": undefined
                },
                "s1": {
                    "type": "peaking",
                    "frequency": 250,
                    "gain": 0,
                    "Q": 1.0,
                    "filter": undefined
                },
                "s2": {
                    "type": "peaking",
                    "frequency": 500,
                    "gain": 0,
                    "Q": 1.0,
                    "filter": undefined
                },
                "s3": {
                    "type": "peaking",
                    "frequency": 1000,
                    "gain": 0,
                    "Q": 1.0,
                    "filter": undefined
                },
                "s4": {
                    "type": "peaking",
                    "frequency": 2000,
                    "gain": 0,
                    "Q": 1.0,
                    "filter": undefined
                },
                "s5": {
                    "type": "peaking",
                    "frequency": 5000,
                    "gain": 0,
                    "Q": 1.0,
                    "filter": undefined
                },
                "s6": {
                    "type": "peaking",
                    "frequency": 10000,
                    "gain": 0,
                    "Q": 1.0,
                    "filter": undefined
                },
                "s7": {
                    "type": "highshelf",
                    "frequency": 12000,
                    "gain": 0,
                    "filter": undefined
                },
            }
            this.init()
        })
    }

    async init() {
        chrome.tabCapture.capture({audio: true, video: false}, (stream) => {
            this.audioContext = new AudioContext();
            this.inputStream = this.audioContext.createMediaStreamSource(stream);
            
            for (var filterID in this.filters) {
                this.filters[filterID].filter = this.audioContext.createBiquadFilter();
                this.filters[filterID].filter.type = this.filters[filterID].type;
                this.filters[filterID].filter.frequency.setValueAtTime(this.filters[filterID].frequency, this.audioContext.currentTime);
                this.filters[filterID].filter.gain.setValueAtTime(this.filters[filterID].gain, this.audioContext.currentTime);
            }

            this.inputStream.connect(this.filters['s0'].filter)
            .connect(this.filters['s1'].filter)
            .connect(this.filters['s2'].filter)
            .connect(this.filters['s3'].filter)
            .connect(this.filters['s4'].filter)
            .connect(this.filters['s5'].filter)
            .connect(this.filters['s6'].filter)
            .connect(this.filters['s7'].filter)
            .connect(this.audioContext.destination)
        })
    }

    async power() {
        (this.enabled) ? this.disable() : this.enable()
    }

    async enable() {
        if (!this.inputStream.mediaStream.active) {
            this.init()
        } else {
            for (var filterID in this.filters) {
                this.filters[filterID].filter.gain.setValueAtTime(parseFloat(this.filters[filterID].gain), this.audioContext.currentTime);
            }
        }
        this.enabled = true;
    }
    
    async disable() {
        this.inputStream.mediaStream.getAudioTracks().forEach((track) => {
            track.stop();
        })

        for (var filterID in this.filters) {
            this.filters[filterID].filter.gain.setValueAtTime(0, this.audioContext.currentTime);
        }

        this.enabled = false;
    }

    async changeGain(sliderName, value) {
        if (this.filters[sliderName].filter) {
            // Only change gain immediately, if enabled
            if (this.enabled) {
                // console.log('Setting gain of ', this.tabID, '\'s ', sliderName, ' to ', value)
                this.filters[sliderName].filter.gain.setValueAtTime(value, this.audioContext.currentTime)
            }
            this.filters[sliderName].gain = value;
        }
    }

    async selectPreset(preset) {
        loadExternalJSON('presets.json', 
        (presets) => {
            if (presets[preset]) {
                for (let [sliderName, value] of Object.entries(presets[preset])) {
                    this.changeGain(sliderName, value)
                }
            } else {
                console.error('No entry found for preset: ', preset)
            }
        }, 
        (error) => {
            console.error('Error loading preset, ', preset, e)
        })
    }
}