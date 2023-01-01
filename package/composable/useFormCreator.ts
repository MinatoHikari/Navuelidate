import { CheckboxProps, NCheckbox, NRadio, RadioProps } from 'naive-ui';
import type { Validation, ValidationArgs } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import type { Ref, VNode } from 'vue';
import { FormItems, FormListItem, FormListItemRender, FormType } from '~/types';
import { ref, h } from 'vue';
import { syncData } from '~/utils';

const createFormListConfig = <T extends Record<string, unknown>, P extends keyof FormItems>(
    key: keyof T | [keyof T, keyof T],
    config: Partial<FormListItem<T, P> & { options: { label: string; value: string }[] }>,
) => {
    config.modelValue = key;
    if (config.formType === FormType.RadioGroup) {
        config.children = {
            default: () =>
                (config.options || []).map((i) =>
                    h(NRadio, {
                        ...i,
                    }),
                ),
        };
    }
    if (config.formType === FormType.CheckBoxGroup) {
        config.children = {
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
}) => {
    const formData = ref({ ...config.defaultData });

    const v$ = useVuelidate(config.rules ?? {}, formData, {
        $scope: config.scope,
    }) as Ref<Validation<Vargs, T>>;

    const resetForm = () => {
        const r = ref({ ...config.defaultData });
        syncData(formData, r);
        v$.value.$reset();
    };

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
        { key, formType }: { key: keyof T; formType: FormType.Select },
        config: Omit<FormListItem<T, FormType.Select>, ExcludeKeys>,
    ): FormListItem<T, FormType.Select>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.TreeSelect },
        config: Omit<FormListItem<T, FormType.TreeSelect>, ExcludeKeys>,
    ): FormListItem<T, FormType.TreeSelect>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: FormType.DatePicker },
        config: Omit<FormListItem<T, FormType.DatePicker>, ExcludeKeys> & {
            props?: { type?: 'date' | 'datetime' | 'month' | 'monthrange' | 'year' | 'quarter' };
        },
    ): FormListItem<T, FormType.DatePicker>;
    function createFormListItem(
        { key, formType }: { key: [keyof T, keyof T]; formType: FormType.DatePicker },
        config: Omit<FormListItem<T, FormType.DatePicker>, ExcludeKeys> & {
            props: { type: 'daterange' | 'datetimerange' };
        },
    ): FormListItem<T, FormType.DatePicker>;
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
        return createFormListConfig<T, P>(key, {
            ...config,
            formType,
        });
    }

    const renderFormListItem = (
        render: () => VNode,
        config?: Omit<FormListItemRender, 'render'>,
    ): FormListItemRender => {
        return {
            ...config,
            render,
        };
    };

    return {
        createFormListItem,
        renderFormListItem,
        v$,
        formData,
        resetForm,
    };
};
