import { NCheckbox, NRadio } from 'naive-ui';
import type { Validation, ValidationArgs } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import type { Ref } from 'vue';
import { FormItems, FormListItem } from '~/types';
import { ref, h } from 'vue';
import { syncData } from '~/utils';

const createFormListConfig = <T extends Record<string, unknown>, P extends keyof FormItems>(
    key: keyof T | [keyof T, keyof T],
    config: Partial<FormListItem<T, P> & { options: { label: string; value: string }[] }>,
) => {
    config.modelValue = key;
    if (config.formType === 'radio-group') {
        config.children = {
            default: () =>
                (config.options || []).map((i) =>
                    h(NRadio, {
                        ...i,
                    }),
                ),
        };
    }
    if (config.formType === 'checkbox-group') {
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
        { key, formType }: { key: keyof T; formType: 'radio-group' },
        config: Omit<
            FormListItem<T, 'radio-group'> & { options: { label: string; value: string }[] },
            'modelValue' | 'formType'
        >,
    ): FormListItem<T, 'radio-group'>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: 'checkbox-group' },
        config: Omit<
            FormListItem<T, 'checkbox-group'> & { options: { label: string; value: string }[] },
            'modelValue' | 'formType'
        >,
    ): FormListItem<T, 'checkbox-group'>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: 'select' },
        config: Omit<FormListItem<T, 'select'>, ExcludeKeys>,
    ): FormListItem<T, 'select'>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: 'date-picker' },
        config: Omit<FormListItem<T, 'date-picker'>, ExcludeKeys> & {
            props?: { type?: 'date' | 'datetime' | 'month' | 'monthrange' | 'year' | 'quarter' };
        },
    ): FormListItem<T, 'date-picker'>;
    function createFormListItem(
        { key, formType }: { key: [keyof T, keyof T]; formType: 'date-picker' },
        config: Omit<FormListItem<T, 'date-picker'>, ExcludeKeys> & {
            props: { type: 'daterange' | 'datetimerange' };
        },
    ): FormListItem<T, 'date-picker'>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: 'input' },
        config: Omit<FormListItem<T>, ExcludeKeys>,
    ): FormListItem<T>;
    function createFormListItem(
        { key, formType }: { key: [keyof T, keyof T]; formType: 'input' },
        config: Omit<FormListItem<T>, ExcludeKeys> & {
            props: { pair: true };
        },
    ): FormListItem<T>;
    function createFormListItem(
        { key, formType }: { key: keyof T; formType: 'input-number' },
        config: Omit<FormListItem<T, 'input-number'>, ExcludeKeys>,
    ): FormListItem<T, 'input-number'>;
    function createFormListItem<P extends keyof FormItems>(
        { key, formType }: { key: keyof T | [keyof T, keyof T]; formType: P },
        config: Omit<FormListItem<T, P>, ExcludeKeys>,
    ): FormListItem<T, P> {
        return createFormListConfig<T, P>(key, {
            ...config,
            formType,
        });
    }
    return {
        createFormListItem,
        v$,
        formData,
        resetForm,
    };
};
