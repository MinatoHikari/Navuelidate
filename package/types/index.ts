import {
    NCheckboxGroup,
    NDatePicker,
    NInput,
    NInputNumber,
    NRadioGroup,
    NSelect,
    NTreeSelect,
    NFormItemGi,
    NCascader,
} from 'naive-ui';
import { VNode, Slots, VNodeArrayChildren, Slot, VNodeChild } from 'vue';

export enum FormType {
    Input = 'input',
    Select = 'select',
    TreeSelect = 'tree-select',
    InputNumber = 'input-number',
    RadioGroup = 'radio-group',
    CheckBoxGroup = 'checkbox-group',
    DatePicker = 'date-picker',
    Cascader = 'cascader',
}

export interface FormItems {
    [FormType.Input]: typeof NInput;
    [FormType.Select]: typeof NSelect;
    [FormType.TreeSelect]: typeof NTreeSelect;
    [FormType.InputNumber]: typeof NInputNumber;
    [FormType.RadioGroup]: typeof NRadioGroup;
    [FormType.CheckBoxGroup]: typeof NCheckboxGroup;
    [FormType.DatePicker]: typeof NDatePicker;
    [FormType.Cascader]: typeof NCascader;
}

export type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);
export interface FormListItemCommonConfig {
    formItemGiProps?: InstanceType<typeof NFormItemGi>['$props'];
    formItemGiSlots?: {
        feedback?: () => VNodeChild;
        label?: () => VNodeChild;
        suffix: () => VNodeChild;
        prefix: () => VNodeChild;
    };
    span?: number;
}

export type RawSlots = {
    [name: string]: unknown;
    $stable?: boolean;
};

export interface FormListItem<
    T extends Record<string, unknown> = {},
    P extends keyof FormItems = FormType.Input,
> extends FormListItemCommonConfig {
    props?: InstanceType<FormItems[P]>['$props'];
    label: string;
    formType: P;
    modelValue: keyof T | [keyof T, keyof T];
    slots?: RawSlots;
}

export interface FormListItemRender extends FormListItemCommonConfig {
    render: () => VNode;
}
