import type {Component} from "vue";

export type DTFilter<T> = {
    field: keyof T
    title: string
    options: {
        label: string
        value: string
        icon?: Component
    }[]
}