import {
    NCheckboxGroup,
    NDatePicker,
    NInput,
    NInputNumber,
    NRadioGroup,
    NSelect,
    NTreeSelect,
    NFormItemGi,
} from 'naive-ui';
import { VNode } from 'vue';

export enum FormType {
    Input = 'input',
    Select = 'select',
    TreeSelect = 'tree-select',
    InputNumber = 'input-number',
    RadioGroup = 'radio-group',
    CheckBoxGroup = 'checkbox-group',
    DatePicker = 'date-picker',
}

export interface FormItems {
    [FormType.Input]: typeof NInput;
    [FormType.Select]: typeof NSelect;
    [FormType.TreeSelect]: typeof NTreeSelect;
    [FormType.InputNumber]: typeof NInputNumber;
    [FormType.RadioGroup]: typeof NRadioGroup;
    [FormType.CheckBoxGroup]: typeof NCheckboxGroup;
    [FormType.DatePicker]: typeof NDatePicker;
}

export interface FormListItemCommonConfig {
    formItemGiProps?: InstanceType<typeof NFormItemGi>['$props'];
    span?: number;
}

export interface FormListItem<
    T extends Record<string, unknown> = {},
    P extends keyof FormItems = FormType.Input,
> extends FormListItemCommonConfig {
    props?: InstanceType<FormItems[P]>['$props'];
    label: string;
    formType: P;
    modelValue: keyof T | [keyof T, keyof T];
    children?: { [p: string]: any };
}

export interface FormListItemRender extends FormListItemCommonConfig {
    render: () => VNode;
}
