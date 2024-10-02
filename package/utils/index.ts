import type { FormItems } from '~/types';
import { FormType } from '~/types';
import {
    NCheckboxGroup,
    NDatePicker,
    NInput,
    NInputNumber,
    NRadioGroup,
    NSelect,
    NTreeSelect,
    NCascader,
    NDynamicTags,
    NSwitch,
} from 'naive-ui';
import { ref, Ref, unref } from 'vue';
import { reactivePick, syncRef } from '@vueuse/core';
import { Validation } from '@vuelidate/core';

export const formItemMap = new Map<keyof FormItems, FormItems[keyof FormItems]>([
    [FormType.Input, NInput],
    [FormType.Select, NSelect],
    [FormType.TreeSelect, NTreeSelect],
    [FormType.InputNumber, NInputNumber],
    [FormType.RadioGroup, NRadioGroup],
    [FormType.CheckBoxGroup, NCheckboxGroup],
    [FormType.DatePicker, NDatePicker],
    [FormType.Cascader, NCascader],
    [FormType.Tags, NDynamicTags],
    [FormType.Switch, NSwitch],
]);

export const maybeNull = <T>(val?: T) => {
    return val ?? null;
};

export const syncData = <L extends Record<string, unknown>, R = L>(
    left: Ref<L>,
    right: Ref<R>,
    config: { mergePropsNotInLeft?: boolean } = { mergePropsNotInLeft: false },
) => {
    const keys = Object.keys(left.value);
    if (!right.value) return;
    if (config && !config.mergePropsNotInLeft) {
        const toMerged = reactivePick(right.value, ...(keys as (keyof R)[]));
        syncRef(
            left as Ref<Record<string, unknown>>,
            ref(toMerged) as Ref<Record<string, unknown>>,
            {
                direction: 'rtl',
                immediate: true,
            },
        );
        return;
    }
    syncRef(left as Ref<Record<string, unknown>>, right as Ref<Record<string, unknown>>, {
        direction: 'rtl',
        immediate: true,
    });
};

export const getValidationState = (validations: (Validation | undefined)[]) => {
    let error: boolean | undefined;
    let triggered = false;

    for (let validation of validations) {
        if (validation) {
            if (validation.$error) error = true;
            if (validation.$anyDirty) triggered = true;
        }
    }

    if (triggered) {
        if (!error) return 'success';
        if (error) return 'error';
    }

    return undefined;
};

export const getFeedback = (validations?: (Validation | undefined)[]) => {
    if (!validations) return '';
    if (validations.length === 0) return '';
    let errors: string[] = [];
    for (let validation of validations) {
        if (validation) {
            const errorStrs = validation.$errors.map((i) => unref(i.$message)) ?? [];
            errors.push(...errorStrs);
        }
    }
    if (errors.length === 0) return '';
    return errors[0];
};
