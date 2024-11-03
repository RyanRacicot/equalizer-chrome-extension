import { Filters } from "./Filter"

export interface TabCardProps {
    id: number
    url: string
    title: string
    isRecording: boolean
    filters?: Filters
}
