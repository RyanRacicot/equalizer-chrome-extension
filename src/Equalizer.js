import { loadExternalJSON } from "./loadJSON.js";

export default class Equalizer {
    constructor(tabID) {
        return (async () => {
            this.tabID = tabID;
            this.enabled = true;
    
            await this.init()
            return this
        })() // Janky async constructor
    }

    async init() {
        await this.getDefaultFilterValues().then((filters) => {
            this.filters = filters
            console.log('filters: ', this.filters)
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
            // Only change gain immediately if enabled, else just store the value to set when enabled
            if (this.enabled) {
                this.filters[sliderName].filter.gain.setValueAtTime(value, this.audioContext.currentTime)
            }
            this.filters[sliderName].gain = value;
        }
    }

    async selectPreset(preset) {
        loadExternalJSON('assets/presets.json', 
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

    getCurrentFilterValues() {
        return this.filters
    }

    async getDefaultFilterValues() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['default-filters'], (res) => {
                if (!res || JSON.stringify(res) === '{}' || !res['default-filters'] || JSON.stringify(res['default-filters']) === '{}') {
                    loadExternalJSON('assets/filters.json', 
                    (filtersObject) => {
                        // No defaults found in local storage, so we should save them now.
                        this.setFilterValuesAsDefault(filtersObject)
                        resolve(filtersObject)
                    }, 
                    (e) => {
                        console.error('Error loading default EQ filter values.', e)
                        reject()
                    })
                } else {
                    console.log('Found stored non-empty filters values: ', res['default-filters'])
                    resolve(res['default-filters'])
                }
            })
        })
    }
    
    setFilterValuesAsDefault = async (filtersJson) => {
        chrome.storage.local.set({'default-filters': filtersJson}, () => {
            console.log('Saved default filter values to local storage')
        })
    }

    setCurrentFilterValuesAsDefault = async () => {
        this.setFilterValuesAsDefault(this.getCurrentFilterValues())
    }
}