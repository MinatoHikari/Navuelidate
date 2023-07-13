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
    NDynamicTags,
} from 'naive-ui';
import { VNode, VNodeArrayChildren, VNodeChild, VNodeProps } from 'vue';

export enum FormType {
    Input = 'input',
    Select = 'select',
    TreeSelect = 'tree-select',
    InputNumber = 'input-number',
    RadioGroup = 'radio-group',
    CheckBoxGroup = 'checkbox-group',
    DatePicker = 'date-picker',
    Cascader = 'cascader',
    Tags = 'tags',
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
    [FormType.Tags]: typeof NDynamicTags;
}

export type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);
export interface FormListItemCommonConfig {
    formItemGiProps?: InstanceType<typeof NFormItemGi>['$props'] & VNodeProps & Record<string, any>;
    formItemGiSlots?: {
        feedback?: () => VNodeChild;
        label?: () => VNodeChild;
        suffix?: () => VNodeChild;
        prefix?: () => VNodeChild;
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
    props?: InstanceType<FormItems[P]>['$props'] & VNodeProps & Record<string, any>;
    label: string;
    formType: P;
    modelValue: keyof T | [keyof T, keyof T];
    slots?: RawSlots;
}

export interface FormListItemRender extends FormListItemCommonConfig {
    render: () => VNode;
}
