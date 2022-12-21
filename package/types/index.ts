import {
    NCheckbox,
    NCheckboxGroup,
    NDatePicker,
    NInput,
    NInputNumber,
    NRadio,
    NRadioGroup,
    NSelect,
    NTreeSelect,
} from 'naive-ui';

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

export interface FormListItem<
    T extends Record<string, unknown> = {},
    P extends keyof FormItems = FormType.Input,
> {
    props?: InstanceType<FormItems[P]>['$props'];
    label: string;
    formType: P;
    modelValue: keyof T | [keyof T, keyof T];
    span?: number;
    children?: { [p: string]: any };
}
