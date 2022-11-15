import {
    NCheckbox,
    NCheckboxGroup,
    NDatePicker,
    NInput,
    NInputNumber,
    NRadio,
    NRadioGroup,
    NSelect,
} from 'naive-ui';

export interface FormItems {
    input: typeof NInput;
    select: typeof NSelect;
    'input-number': typeof NInputNumber;
    'radio-group': typeof NRadioGroup;
    'checkbox-group': typeof NCheckboxGroup;
    'date-picker': typeof NDatePicker;
}

export interface FormListItem<
    T extends Record<string, unknown> = {},
    P extends keyof FormItems = 'input',
    > {
    props?: InstanceType<FormItems[P]>['$props'];
    label: string;
    formType: P;
    modelValue: keyof T | [keyof T, keyof T];
    span?: number;
    children?: { [p: string]: any };
}
