# Navuelidate

A lib to create form easier with naive-ui and vuelidate and vueuse

Navuelidate 是一个表单生成器库，包含表单生成器组件和对应的 composable 函数、工具类型/函数、表单校验工具函数

## Usage

```html
<template>
    <FormCreator v-model="formData" :form-list="formList" :cols="4" :scope="validateScope" />
</template>
```

```typescript
import { useFormCreator } from 'navuelidate';
import { FormType } from 'navuelidate';
import { h } from "vue"

const validateScope = Symbol('roleQueryForm');
const { formData, resetForm, createFormListItem, renderFormListItem } = useFormCreator({
    defaultData: {
        roleName: '',
        roleKey: '',
    },
    scope: validateScope,
});

const formList = shallowRef([
    createFormListItem(
        {
            key: 'roleName',
            formType: FormType.Input,
        },
        {
            label: 'roleName',
        },
    ),
    createFormListItem(
        {
            key: 'select',
            formType: FormType.Select,
        },
        {
            label: 'roleKey',
            props: {
                options: []
            }
        },
    ),
    renderFormListItem(
        () => {
            return h("div", "custom render");
        },
        {
            formItemGiProps: {
                suffix: true,
            },
        },
    ),
]);
```

## Component

### Component <a id="form-creator">FormCreator</a>

组件用于生成 `naive-ui` 表单, 需配合 `useFormCreator` 使用

| Props     | Type                                      | Default   | Description          |
| --------- | ----------------------------------------- | --------- | -------------------- |
| cols      | ?number                                   | 4         | 表单每行有几个表单项 |
| scope     | Symbol                                    | undefined | 必传，表单域名标记   |
| rules     | ?ValidationArgs<Record<string, unknown>>  | undefined | 表单验证规则         |
| modelalue | Record<strinng,unkown>                    | undefined | 必填，表单数据对象   |
| formList  | Array<FormListItemRender \| FormListItem> | []        | 表单项列表           |

此外，可以接收 `NGrid` 组件的所有 props

#### Type <a id="form-list-item">FormListItem</a>

| Property        | Type                                      | Default        | Description                                                                              |
| --------------- | ----------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| label           | string                                    | ""             | 表单项的 `label`                                                                         |
| modelValue      | keyof Data \| [keyof Data, keyof Data]    | undefined      | 必填，表单项的双向绑定变量，T 泛型为传入的数据 Model 的类型 （默认是 defaultData的类型） |
| span            | number                                    | undefined      | 表单项占这一行的份额，最大 24 最小 1                                                     |
| formType        | FormType                                  | FormType.Input | 必填，表单项类型                                                                         |
| props           | InstanceType\<typeof formType\>['$props'] | undefined      | 对应表单类型的组件的 props                                                               |
| formItemGiProps | NFormItemGi 的 props                      | undefined      | 包裹表单控件的 NFormItemGi 的 props                                                      |

#### Type <a id="form-list-item-render">FormListItemRender</a>

| Property        | Type                 | Default   | Description                          |
| --------------- | -------------------- | --------- | ------------------------------------ |
| span            | number               | undefined | 表单项占这一行的份额，最大 24 最小 1 |
| render          | () => VNode          | undefined | 自定义渲染函数                       |
| formItemGiProps | NFormItemGi 的 props | undefined | 包裹表单控件的 NFormItemGi 的 props  |

目前支持的 `formType` 组件: `[Input,Select,TreeSelect,InputNumber, RadioGroup,CheckBoxGroup,DatePicker]`

对应的组件 `props` 可参考 [naive-ui 文档](https://www.naiveui.com/zh-CN/os-theme)

## Composable

### Function `useFormCreator`

表单生成器组件辅助 `composable` 函数，需配合 `FormCreator` 组件使用

> ### Params

| Property              | Type                                                                 | Default   | Description                                |
| --------------------- | -------------------------------------------------------------------- | --------- | ------------------------------------------ |
| defaultData           | Record<string, unknown>                                              | undefined | 必填，表单默认值                           |
| scope                 | Symbol                                                               | undefined | 必填，表单域名标记，`Vuelidate` 的 `scope` |
| rules                 | Ref\<Vargs extends ValidationArgs\>                                  | Vargs     | 表单验证规则                               |
| globalFormItemGiProps | FormItemGiProps \| (() => FormItemGiProps) \| Ref\<FormItemGiProps\> | undefined | 全局给表单项的 FormItemGi 传递的 props     |

表单验证规则参考 [Vuelidate 文档](https://vuelidate-next.netlify.app)

> ### ReturnType

| Property           | Type                            | Description                                                          |
| ------------------ | ------------------------------- | -------------------------------------------------------------------- |
| v$                 | Ref<Validation<Vargs, unknown>> | `Vuelidate` 的 `v$` 对象                                             |
| formData           | Ref<Record<string, unknown>>    | 表单数据对象 Ref                                                     |
| resetForm          | () => void                      | 重置表单函数，运行后 `formData.value` 会被重置为参数的 `defaultData` |
| createFormListItem | CreateFormListItem              | 表单项注册辅助工具函数                                               |

### Function `createFormListItem`

表单项生成辅助函数

> ### Params

| Property          | Type                              | Description                                                                                                                              |
| ----------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| { key, formType } | { key:string, formType:FormType } | 一个对象，包含 `key` ,`formType`, `key` 为表单数据对象 `formData.value` 的键名之一， 会由 ts 自动推导，formType 为目前支持的表单类型之一 |
| config            | [`FormListItem`](#form-list-item) | `FormListItem` 配置项，会根据第一个参数的 `formType` 自动收窄类型                                                                        |

> ### ReturnType

[`FormListItem`](#form-list-item)

### Function `renderFormListItem`

表单项生成辅助函数（自定义渲染）

> ### Params

| Property | Type                                           | Description                 |
| -------- | ---------------------------------------------- | --------------------------- |
| render   | () => VNode                                    | 自定义表单项渲染函数        |
| config   | [`FormListItemRender`](#form-list-item-render) | `FormListItemRender` 配置项 |

> ### ReturnType

[`FormListItemRender`](#form-list-item-render)
