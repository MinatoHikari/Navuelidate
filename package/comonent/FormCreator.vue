<script lang="tsx">
import { DefineComponent, PropType, unref, VNode } from 'vue';
import type { Validation, ValidationArgs } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import { DatePickerProps, NEllipsis } from 'naive-ui';
import { NGrid, NFormItemGi, gridProps } from 'naive-ui';
import { computed, defineComponent, h } from 'vue';
import { FormItems, FormListItem, FormListItemRender, FormType } from '~/types';
import { formItemMap, maybeNull } from '~/utils';
import { reactivePick } from '@vueuse/core';
import { getValidationState } from '~/utils';

const gridPropKeys = Object.keys(gridProps);

const conditionFormLIstItemFn = ({
    i,
    isRender,
    isFormListItem,
}: {
    i: FormListItem<never, keyof FormItems> | FormListItemRender;
    isRender?: (i: FormListItemRender) => void | VNode;
    isFormListItem: (i: FormListItem<Record<string, unknown>, keyof FormItems>) => void | VNode;
}) => {
    if ((i as FormListItemRender).render) {
        if (isRender) return isRender(i as FormListItemRender);
    } else {
        return isFormListItem(i as FormListItem<Record<string, unknown>, keyof FormItems>);
    }
};

export default defineComponent({
    name: 'FormCreator',
    inheritAttrs: false,
    props: {
        ...gridProps,
        xGap: {
            type: gridProps.xGap.type,
            default: 18,
        },
        cols: {
            type: gridProps.cols.type,
            default: 4,
        },
        ellipsisPadding: {
            type: Number,
            default: 12,
        },
        formList: Array as PropType<
            Array<FormListItem<never, keyof FormItems> | FormListItemRender>
        >,
        scope: {
            type: [String, Number, Symbol],
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        clearable: {
            type: Boolean,
            default: true,
        },
        modelValue: {
            type: Object as PropType<Record<string, unknown>>,
            required: true,
        },
        rules: Object as PropType<ValidationArgs<Record<string, unknown>>>,
    },
    emits: ['update:modelValue'],
    setup(p, c) {
        const defaultVal = {} as Record<string, unknown>;
        const list = computed(
            () =>
                p.formList as Array<
                    FormListItem<Record<string, unknown>, keyof FormItems> | FormListItemRender
                >,
        );
        // const setKeyVal = (
        //     obj: Record<string, unknown>,
        //     i: FormListItem<Record<string, unknown>, keyof FormItems>,
        // ) => {
        //     if (typeof i.modelValue === 'string')
        //         obj[i.modelValue] = p.modelValue ? p.modelValue[i.modelValue] : undefined;
        //     else {
        //         obj[i.modelValue[0]] = p.modelValue ? p.modelValue[i.modelValue[0]] : undefined;
        //         obj[i.modelValue[1]] = p.modelValue ? p.modelValue[i.modelValue[1]] : undefined;
        //     }
        // };
        const formData = computed<Record<string, unknown>>(() => p.modelValue);
        // const formData = ref<Record<string, unknown>>(defaultVal);
        // const walkThrough = (target: Record<string, unknown>) => {
        //     const keys = Reflect.ownKeys(p.modelValue);
        //     for (let key of keys) {
        //         if (typeof key === 'string') target[key] = p.modelValue[key];
        //     }
        // };

        // walkThrough(defaultVal);

        // watch(
        //     formData,
        //     (val) => {
        //         c.emit('update:modelValue', val);
        //     },
        //     {
        //         deep: true,
        //     },
        // );
        // watch(
        //     () => p.modelValue,
        //     (val) => {
        //         if (val) walkThrough(formData.value);
        //     },
        //     {
        //         deep: true,
        //     },
        // );

        const v$ = useVuelidate(p.rules ?? {}, formData, {
            $scope: p.scope,
        });

        const getValidateStatus = (validation: Validation | [Validation, Validation]) => {
            // let error: boolean | undefined;
            // if (validation && validation.length) {
            //     const arr = validation as [Validation, Validation];
            //     error = arr[0]?.$error || arr[1]?.$error;
            // } else {
            //     error = validation ? (validation as Validation).$error : undefined;
            // }
            // if (!error) return 'success';
            // if (error) return 'error';
            // return undefined;
            return getValidationState(Array.isArray(validation) ? validation : [validation]);
        };

        const getArrVal = (i: FormListItem<Record<string, unknown>, keyof FormItems>) => {
            const val0 = maybeNull(formData.value[i.modelValue[0]]);
            const val1 = maybeNull(formData.value[i.modelValue[1]]);
            const isNull = maybeNull(val0 && val1) === null;
            return isNull ? null : [val0, val1];
        };

        const getUpdateEvent = (i: FormListItem<Record<string, unknown>, keyof FormItems>) => {
            if (i.formType === FormType.Input && typeof i.modelValue !== 'string') {
                const arrVal = getArrVal(i);
                return {
                    value: arrVal,
                    'onUpdate:value': (v: [string, string] | null) => {
                        if (v === null) {
                            formData.value[i.modelValue[0]] = null;
                            formData.value[i.modelValue[1]] = null;
                        } else {
                            formData.value[i.modelValue[0]] = v[0] ?? null;
                            formData.value[i.modelValue[1]] = v[1] ?? null;
                        }
                    },
                };
            }
            if (i.formType === FormType.DatePicker) {
                const arrVal = getArrVal(i);
                return {
                    formattedValue:
                        typeof i.modelValue === 'string'
                            ? maybeNull(formData.value[i.modelValue])
                            : arrVal,
                    'onUpdate:formatted-value': (v: string | [string, string] | null) => {
                        if (typeof i.modelValue === 'string') {
                            formData.value[i.modelValue] = v;
                        } else if (v === null) {
                            formData.value[i.modelValue[0]] = null;
                            formData.value[i.modelValue[1]] = null;
                        } else {
                            formData.value[i.modelValue[0]] = v[0] ?? null;
                            formData.value[i.modelValue[1]] = v[1] ?? null;
                        }
                    },
                };
            }
            if (i.formType === FormType.CheckBoxGroup) {
                return {
                    value: formData.value[i.modelValue as string],
                    'onUpdate:value': (
                        v: (string | number)[],
                        meta: { actionType: 'check' | 'uncheck'; value: string | number },
                    ) => {
                        formData.value[i.modelValue as string] = v;
                    },
                };
            }
            return {
                value: maybeNull(formData.value[i.modelValue as string]),
                'onUpdate:value': (v: string) => {
                    formData.value[i.modelValue as string] = v;
                },
            };
        };

        const getCommonProps = (i: FormListItem<Record<string, unknown>, keyof FormItems>) => {
            const commonProps: { disabled: boolean; clearable?: boolean } = {
                disabled: p.disabled,
            };
            if (i.formType !== FormType.CheckBoxGroup && i.formType !== FormType.RadioGroup)
                commonProps.clearable = p.clearable;
            if (i.formType === FormType.Input && typeof i.modelValue !== 'string') {
                return {
                    separator: '-',
                    ...commonProps,
                };
            }
            if (i.formType === FormType.DatePicker) {
                const res: DatePickerProps = {
                    valueFormat: 'yyyy-MM-dd',
                    ...commonProps,
                };
                if (typeof i.modelValue !== 'string') {
                    res.closeOnSelect = true;
                }
                return res;
            }
            return commonProps;
        };

        const getFeedBack = (i: FormListItem<Record<string, unknown>, keyof FormItems>) => {
            if (!v$.value) return '';
            if (!v$.value.$anyDirty) return '';
            if (typeof i.modelValue === 'string') {
                const validationItem = v$.value[i.modelValue] as Validation;
                if (!validationItem) return '';
                const errors = validationItem?.$errors ?? [];
                return errors[0] ? unref(errors[0].$message) : '';
            } else {
                const validationItem0 = v$.value[i.modelValue[0]] as Validation;
                const validationItem1 = v$.value[i.modelValue[1]] as Validation;
                const errors0 = validationItem0?.$errors ?? [];
                const errors1 = validationItem1?.$errors ?? [];
                if (errors0[0]) return unref(errors0[0].$message);
                else if (errors1[0]) return unref(errors1[0].$message);
                else return '';
            }
        };

        const gridPropReactive = reactivePick(p, ...(gridPropKeys as (keyof typeof gridProps)[]));

        const defaultRenderLabel = (label?: string, labelWidth?: number | string) => {
            if (labelWidth)
                return () =>
                    h(
                        NEllipsis,
                        {
                            style: labelWidth
                                ? `max-width:${
                                      typeof labelWidth === 'number'
                                          ? labelWidth - p.ellipsisPadding + 'px'
                                          : `calc(${labelWidth} - ${p.ellipsisPadding}px)`
                                  }`
                                : undefined,
                        },
                        { default: () => label },
                    );
            return () => label;
        };

        return () => (
            <NGrid {...gridPropReactive} {...c.attrs}>
                {list.value?.map((listItem) => {
                    return conditionFormLIstItemFn({
                        i: listItem,
                        isRender: (i) => {
                            const { prefix, suffix, label, feedback } = i.formItemGiSlots ?? {};
                            return (
                                <NFormItemGi
                                    span={i.span ?? 1}
                                    label-placement="left"
                                    label-align="left"
                                    {...i.formItemGiProps}
                                >
                                    {{
                                        default: () => {
                                            return i.render();
                                        },
                                        label:
                                            label ??
                                            defaultRenderLabel(
                                                i.formItemGiProps?.label,
                                                i.formItemGiProps?.labelWidth,
                                            ),
                                        feedback,
                                    }}
                                </NFormItemGi>
                            );
                        },
                        isFormListItem: (i) => {
                            const { prefix, suffix, label, feedback } = i.formItemGiSlots ?? {};
                            return (
                                <NFormItemGi
                                    validation-status={getValidateStatus(
                                        typeof i.modelValue === 'string'
                                            ? v$.value[i.modelValue]
                                            : [
                                                  v$.value[i.modelValue[0]],
                                                  v$.value[i.modelValue[1]],
                                              ],
                                    )}
                                    feedback={getFeedBack(i)}
                                    label-align="left"
                                    span={i.span ?? 1}
                                    label={i.label}
                                    label-placement="left"
                                    {...i.formItemGiProps}
                                >
                                    {{
                                        default: () => {
                                            return (
                                                <>
                                                    {prefix && prefix()}
                                                    {h(
                                                        formItemMap.get(
                                                            i.formType,
                                                        ) as unknown as DefineComponent,
                                                        {
                                                            ...getCommonProps(i),
                                                            ...getUpdateEvent(i),
                                                            ...i.props,
                                                        },
                                                        i.slots,
                                                    )}
                                                    {suffix && suffix()}
                                                </>
                                            );
                                        },
                                        label:
                                            label ??
                                            defaultRenderLabel(
                                                i.label ?? i.formItemGiProps?.label,
                                                i.formItemGiProps?.labelWidth,
                                            ),
                                        feedback,
                                    }}
                                </NFormItemGi>
                            );
                        },
                    });
                })}
            </NGrid>
        );
    },
});
</script>

<style scoped></style>
