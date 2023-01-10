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
} from 'naive-ui';
import { ref, Ref } from 'vue';
import { reactivePick, syncRef } from '@vueuse/core';

export const formItemMap = new Map<keyof FormItems, FormItems[keyof FormItems]>([
    [FormType.Input, NInput],
    [FormType.Select, NSelect],
    [FormType.TreeSelect, NTreeSelect],
    [FormType.InputNumber, NInputNumber],
    [FormType.RadioGroup, NRadioGroup],
    [FormType.CheckBoxGroup, NCheckboxGroup],
    [FormType.DatePicker, NDatePicker],
    [FormType.Cascader, NCascader],
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
        syncRef(left, ref(toMerged), { direction: 'rtl', immediate: true })();
        return;
    }
    syncRef(left, right, { direction: 'rtl', immediate: true })();
};
