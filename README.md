# Navuelidate

A lib to create form easier with naive-ui and vuelidate and vueuse

Navuelidate 是一个表单生成器库，包含表单生成器组件和对应的 composable 函数、工具类型/函数、表单校验工具函数

## Component

### Component `FormCreator`

组件用于生成 `naveui` 表单, 需配合 `useFormCreator` 使用

| Props     | Type                                                                | Default   | Description          |
| --------- | ------------------------------------------------------------------- | --------- | -------------------- |
| cols      | ?number                                                             | 4         | 表单每行有几个表单项 |
| scope     | Symbol                                                              | undefined | 必传，表单域名标记   |
| rules     | ?ValidationArgs<Record<string, unknown>>                            | undefined | 表单验证规则         |
| modelalue | Record<strinng,unkown>                                              | undefined | 必填，表单数据对象   |
| formList  | Array<{render:() => VNode} \| FormListItem<never, keyof FormItems>> | []        | 表单项列表           |

#### Type `FormListItem`

| Property   | Type                                      | Default        | Description                          |
| ---------- | ----------------------------------------- | -------------- | ------------------------------------ |
| label      | string                                    | ""             | 表单项的 `label`                     |
| modelValue | keyof T \| [keyof T, keyof T]             | undefined      | 必填，表单项的双向绑定变量           |
| span       | number                                    | undefined      | 表单项占这一行的份额，最大 24 最小 1 |
| formType   | FormType                                  | FormType.Input | 必填，表单项类型                     |
| props      | InstanceType\<typeof formType\>['$props'] | undefined      | 对应表单类型的组件的 props           |

目前支持的 `formType` 组件: `[Input,Select,TreeSelect,InputNumber, RadioGroup,CheckBoxGroup,DatePicker]`

对应的组件 `props` 可参考 [naive-ui 文档](https://www.naiveui.com/zh-CN/os-theme)

## Composable

### Function `useFormCreator`

表单生成器组件辅助 `composable` 函数，需配合 `FormCreator` 组件使用

> ### Params

| Property    | Type                              | Default   | Description                                |
| ----------- | --------------------------------- | --------- | ------------------------------------------ |
| defaultData | Record<string, unknown>           | undefined | 必填，表单默认值                           |
| scope       | Symbol                            | undefined | 必填，表单域名标记，`Vuelidate` 的 `scope` |
| rules       | Ref<Vargs extends ValidationArgs> | Vargs     | 表单验证规则                               |

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
| config            | [`FormListItem`]()                | `FormListItem` 配置项，会根据第一个参数的 `formType` 自动收窄类型                                                                        |

> ### ReturnType

[`FormListItem` | {render: () => VNode}]()
