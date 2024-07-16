import { CheckboxProps, NCheckbox, NRadio, RadioProps, FormItemGiProps } from 'naive-ui';
import type { Validation, ValidationArgs } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import type { Ref, VNode, VNodeProps } from 'vue';
import { ChildFormType, FormItems, FormListItem, FormListItemRender, FormType } from '~/types';
import { ref, h } from 'vue';
import { syncData } from '~/utils';
import { toValue } from '@vueuse/core';

export type DefaultSettings = {
    formItemGiProps?: FormItemGiProps | (() => FormItemGiProps) | Ref<FormItemGiProps>;
    formItemProps?: (formType: FormType) => VNodeProps & Record<string, any>;
};

let defaultSettings: DefaultSettings = {};

export const createDefaultSettings = (config: DefaultSettings) => {
    defaultSettings = config;
};

const createFormListConfig = <T extends Record<string, unknown>, P extends keyof FormItems>(
    key: keyof T | [keyof T, keyof T],
    config: Partial<FormListItem<T, P> & { options: { label: string; value: string }[] }>,
) => {
    config.modelValue = key;
    if (config.formType === FormType.RadioGroup) {
        config.slots = {
            ...config.slots,
            default: () =>
                (config.options || []).map((i) =>
                    h(NRadio, {
                        ...i,
                    }),
                ),
        };
    }
    if (config.formType === FormType.CheckBoxGroup) {
        config.slots = {
            ...config.slots,
            default: () =>
                (config.options || []).map((i) =>
                    h(NCheckbox, {
                        ...i,
                    }),
                ),
        };
    }
    return config as FormListItem<T, P>;
};

type ExcludeKeys = 'modelValue' | 'formType';

export const useFormCreator = <
    T extends { [key in keyof Vargs]: any },
    Vargs extends ValidationArgs = ValidationArgs,
>(config: {
    defaultData: T;
    scope: symbol | string | number;
    rules?: Ref<Vargs> | Vargs;
    globalFormItemGiProps?: FormItemGiProps | (() => FormItemGiProps) | Ref<FormItemGiProps>;
    globalProps?: (formType: FormType) => VNodeProps & Record<string, any>;
}) => {
    const formData = ref({ ...config.defaultData });

    const v$ = useVuelidate(config.rules ?? {}, formData, {
        $scope: config.scope,
    }) as Ref<Validation<Vargs, T>>;

    const resetForm = () => {
        const r = ref({ ...config.defaultData });
        syncData(formData as Ref<Record<string, unknown>>, r);
        v$.value.$reset();
    };

    const { formItemGiProps: defaultFormItemGiProps, formItemProps: defaultFormItemProps } =
        defaultSettings;
    const { globalFormItemGiProps, globalProps } = config;

    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.RadioGroup },
        config: Omit<FormListItem<T, FormType.RadioGroup> & { options: RadioProps[] }, ExcludeKeys>,
    ): FormListItem<T, FormType.RadioGroup>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.CheckBoxGroup },
        config: Omit<
            FormListItem<T, FormType.CheckBoxGroup> & {
                options: CheckboxProps[];
            },
            ExcludeKeys
        >,
    ): FormListItem<T, FormType.CheckBoxGroup>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.Tags },
        config: Omit<FormListItem<T, FormType.Tags>, ExcludeKeys>,
    ): FormListItem<T, FormType.Tags>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.Select },
        config: Omit<FormListItem<T, FormType.Select>, ExcludeKeys>,
    ): FormListItem<T, FormType.Select>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.Cascader },
        config: Omit<FormListItem<T, FormType.Cascader>, ExcludeKeys>,
    ): FormListItem<T, FormType.Cascader>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.TreeSelect },
        config: Omit<FormListItem<T, FormType.TreeSelect>, ExcludeKeys>,
    ): FormListItem<T, FormType.TreeSelect>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.DatePicker },
        config: Omit<FormListItem<T, FormType.DatePicker>, ExcludeKeys> & {
            props?: { type?: 'date' | 'datetime' | 'month' | 'year' | 'quarter' | 'week' };
        },
    ): FormListItem<T, FormType.DatePicker, ChildFormType.DatePicker>;
    function createFormListItem(
        { key, formType }: { key: [keyof T, keyof T]; formType: FormType.DatePicker },
        config: Omit<FormListItem<T, FormType.DatePicker>, ExcludeKeys> & {
            props: {
                type: 'daterange' | 'datetimerange' | 'monthrange' | 'quarterrange' | 'yearrange';
            };
        },
    ): FormListItem<T, FormType.DatePicker, ChildFormType.RangePicker>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.Input },
        config: Omit<FormListItem<T>, ExcludeKeys>,
    ): FormListItem<T>;
    function createFormListItem(
        { key, formType }: { key: [keyof T, keyof T]; formType: FormType.Input },
        config: Omit<FormListItem<T>, ExcludeKeys> & {
            props: { pair: true };
        },
    ): FormListItem<T>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.InputNumber },
        config: Omit<FormListItem<T, FormType.InputNumber>, ExcludeKeys>,
    ): FormListItem<T, FormType.InputNumber>;
    function createFormListItem<P extends keyof FormItems>(
        { key, formType }: { key: keyof T | [keyof T, keyof T]; formType: P },
        config: Omit<FormListItem<T, P>, ExcludeKeys>,
    ): FormListItem<T, P> {
        if (globalFormItemGiProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...toValue(globalFormItemGiProps),
                ...config.formItemGiProps,
            };
        } else if (defaultFormItemProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...config.formItemGiProps,
            };
        }
        if (globalProps) {
            config.props = {
                ...(defaultFormItemProps ? defaultFormItemProps(formType) : {}),
                ...globalProps(formType),
                ...(config.props as Record<string, any>),
            };
        } else if (defaultFormItemProps) {
            config.props = {
                ...defaultFormItemProps(formType),
                ...(config.props as Record<string, any>),
            };
        }
        return createFormListConfig<T, P>(key, {
            ...config,
            formType,
        });
    }

    const createFormListDatePickerItem = (
        { key }: { key: keyof T },
        config: Omit<FormListItem<T, FormType.DatePicker>, ExcludeKeys> & {
            props?: { type?: 'date' | 'datetime' | 'month' | 'year' | 'quarter' | 'week' };
        },
    ): FormListItem<T, FormType.DatePicker> => {
        const formType = FormType.DatePicker;
        if (globalFormItemGiProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...toValue(globalFormItemGiProps),
                ...config.formItemGiProps,
            };
        } else if (defaultFormItemProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...config.formItemGiProps,
            };
        }
        if (globalProps) {
            config.props = {
                ...(defaultFormItemProps ? defaultFormItemProps(formType) : {}),
                ...globalProps(formType),
                ...(config.props as Record<string, any>),
            };
        } else if (defaultFormItemProps) {
            config.props = {
                ...defaultFormItemProps(formType),
                ...(config.props as Record<string, any>),
            };
        }
        return createFormListConfig<T, FormType.DatePicker>(key, {
            ...config,
            formType,
        });
    };

    const createFormListDateRangePickerItem = (
        { key }: { key: keyof T },
        config: Omit<FormListItem<T, FormType.DatePicker>, ExcludeKeys> & {
            props?: {
                type?: 'daterange' | 'datetimerange' | 'monthrange' | 'quarterrange' | 'yearrange';
            };
        },
    ): FormListItem<T, FormType.DatePicker> => {
        const formType = FormType.DatePicker;
        if (globalFormItemGiProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...toValue(globalFormItemGiProps),
                ...config.formItemGiProps,
            };
        } else if (defaultFormItemProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...config.formItemGiProps,
            };
        }
        if (globalProps) {
            config.props = {
                ...(defaultFormItemProps ? defaultFormItemProps(formType) : {}),
                ...globalProps(formType),
                ...(config.props as Record<string, any>),
            };
        } else if (defaultFormItemProps) {
            config.props = {
                ...defaultFormItemProps(formType),
                ...(config.props as Record<string, any>),
            };
        }
        return createFormListConfig<T, FormType.DatePicker>(key, {
            ...config,
            formType,
        });
    };

    const renderFormListItem = (
        render: () => VNode,
        config?: Omit<FormListItemRender, 'render'>,
    ): FormListItemRender => {
        if (config && globalFormItemGiProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...toValue(globalFormItemGiProps),
                ...config.formItemGiProps,
            };
        } else if (config && defaultFormItemProps) {
            config.formItemGiProps = {
                ...toValue(defaultFormItemGiProps),
                ...config.formItemGiProps,
            };
        }
        return {
            ...config,
            render,
        };
    };

    return {
        createFormListItem,
        createFormListDatePickerItem,
        createFormListDateRangePickerItem,
        renderFormListItem,
        v$,
        formData,
        resetForm,
    };
};
