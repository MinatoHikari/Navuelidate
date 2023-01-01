<script lang="tsx">
import { DefineComponent, PropType, toRefs, VNode } from 'vue';
import type { Validation, ValidationArgs } from '@vuelidate/core';
import { useVuelidate } from '@vuelidate/core';
import type { DatePickerProps } from 'naive-ui';
import { NGrid, NFormItemGi, gridProps } from 'naive-ui';
import { computed, defineComponent, ref, watch, h } from 'vue';
import { FormItems, FormListItem, FormListItemRender, FormType } from '~/types';
import { formItemMap, maybeNull } from '~/utils';
import { reactivePick, toReactive } from '@vueuse/core';

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
            default: 12,
        },
        cols: {
            type: gridProps.cols.type,
            default: 4,
        },
        formList: Array as PropType<
            Array<FormListItem<never, keyof FormItems> | FormListItemRender>
        >,
        scope: {
            type: [String, Number, Symbol],
        },
        modelValue: Object as PropType<Record<string, unknown>>,
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
        const setKeyVal = (
            obj: Record<string, unknown>,
            i: FormListItem<Record<string, unknown>, keyof FormItems>,
        ) => {
            if (typeof i.modelValue === 'string')
                obj[i.modelValue] = p.modelValue ? p.modelValue[i.modelValue] : undefined;
            else {
                obj[i.modelValue[1]] = p.modelValue ? p.modelValue[i.modelValue[1]] : undefined;
                obj[i.modelValue[1]] = p.modelValue ? p.modelValue[i.modelValue[1]] : undefined;
            }
        };
        (list.value || []).forEach((item) => {
            conditionFormLIstItemFn({
                i: item,
                isFormListItem: (i) => {
                    setKeyVal(defaultVal, i);
                },
            });
        });
        const formData = ref<Record<string, unknown>>(defaultVal);
        // <-- 监听表单值变化，向父组件传递变化
        watch(
            formData,
            (val) => {
                c.emit('update:modelValue', val);
            },
            {
                deep: true,
            },
        );
        watch(
            () => p.modelValue,
            (val) => {
                if (val)
                    (list.value || []).forEach((item) => {
                        conditionFormLIstItemFn({
                            i: item,
                            isFormListItem: (i) => {
                                setKeyVal(formData.value, i);
                            },
                        });
                    });
            },
        );
        // -->
        const v$ = useVuelidate(p.rules ?? {}, formData, {
            $scope: p.scope,
        });

        const getValidateStatus = (validation: Validation | [Validation, Validation]) => {
            let error: boolean | undefined;
            if (validation && validation.length) {
                const arr = validation as [Validation, Validation];
                error = arr[0]?.$error && arr[1]?.$error;
            } else {
                error = validation ? (validation as Validation).$error : undefined;
            }
            if (!error) return 'success';
            if (error) return 'error';
            return undefined;
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
                    'onUpdate:value': (v: string | [string, string]) => {
                        formData.value[i.modelValue[0]] = v[0] ?? null;
                        formData.value[i.modelValue[1]] = v[1] ?? null;
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
                    'onUpdate:formatted-value': (v: string | [string, string]) => {
                        if (typeof i.modelValue === 'string') {
                            formData.value[i.modelValue] = v;
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
            if (i.formType === FormType.Input && typeof i.modelValue !== 'string') {
                return {
                    separator: '-',
                };
            }
            if (i.formType === FormType.DatePicker) {
                const res: DatePickerProps = {
                    valueFormat: 'yyyy-MM-dd',
                };
                if (typeof i.modelValue !== 'string') {
                    res.closeOnSelect = true;
                }
                return res;
            }
        };

        const gridPropReactive = reactivePick(p, ...(gridPropKeys as (keyof typeof gridProps)[]));

        return () => (
            <NGrid {...gridPropReactive} {...c.attrs}>
                {list.value?.map((listItem) => {
                    return conditionFormLIstItemFn({
                        i: listItem,
                        isRender: (i) => {
                            return (
                                <NFormItemGi
                                    span={i.span ?? 1}
                                    label-placement="left"
                                    {...i.formItemGiProps}
                                >
                                    {i.render()}
                                </NFormItemGi>
                            );
                        },
                        isFormListItem: (i) => {
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
                                    span={i.span ?? 1}
                                    label={i.label}
                                    label-placement="left"
                                    {...i.formItemGiProps}
                                >
                                    {h(
                                        formItemMap.get(i.formType) as unknown as DefineComponent,
                                        {
                                            ...getCommonProps(i),
                                            ...getUpdateEvent(i),
                                            ...i.props,
                                        },
                                        i.children,
                                    )}
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
