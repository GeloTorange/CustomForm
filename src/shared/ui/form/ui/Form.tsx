import { type FormEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  type DefaultValues,
  FormProvider,
  type Path,
  type PathValue,
  useForm,
} from 'react-hook-form'

import { clsx } from 'clsx'
import {
  buildValuesFromPaths,
  collectLeafPaths,
  getValueByPath,
  isEqual,
  setValueByPath,
} from '@/shared/lib/form/path'
import type {
  FormFieldData,
  FormFinishFailed,
  FormInstance,
  FormProps,
  FormValidateTrigger,
  FormValues,
  RegisterFieldOptions,
  SetFieldValueOptions,
} from '@/shared/lib/form/types'
import { FormContext } from '@/shared/ui/form/model/FormContext'
import '@/shared/ui/form/styles/form.css'

type RHFFormValues<TValues extends FormValues> = TValues & Record<string, unknown>

// Нормализует validateTrigger в массив событий для единой проверки.
const normalizeValidateTrigger = (
  validateTrigger?: FormValidateTrigger | FormValidateTrigger[],
): FormValidateTrigger[] => {
  if (!validateTrigger) {
    return ['onChange']
  }

  return Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger]
}

// Корневой компонент формы: связывает внешний API Antd-подобной формы с react-hook-form.
export const FormRoot = <TValues extends FormValues = FormValues>({
  children,
  className,
  layout = 'vertical',
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
  onFieldsChange,
}: FormProps<TValues>) => {
  const resolvedInitialValues = (initialValues ?? {}) as RHFFormValues<TValues>
  const initialValuesRef = useRef<RHFFormValues<TValues>>(resolvedInitialValues)
  const fieldRegistryRef = useRef<Record<string, RegisterFieldOptions<TValues>>>({})

  const onFinishRef = useRef(onFinish)
  const onFinishFailedRef = useRef(onFinishFailed)
  const onValuesChangeRef = useRef(onValuesChange)
  const onFieldsChangeRef = useRef(onFieldsChange)

  const methods = useForm<RHFFormValues<TValues>>({
    defaultValues: resolvedInitialValues as DefaultValues<RHFFormValues<TValues>>,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  useEffect(() => {
    // Сохраняем актуальный обработчик onFinish без пересоздания form instance.
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    // Сохраняем актуальный обработчик onFinishFailed без пересоздания form instance.
    onFinishFailedRef.current = onFinishFailed
  }, [onFinishFailed])

  useEffect(() => {
    // Сохраняем актуальный обработчик onValuesChange без пересоздания form instance.
    onValuesChangeRef.current = onValuesChange
  }, [onValuesChange])

  useEffect(() => {
    // Сохраняем актуальный обработчик onFieldsChange без пересоздания form instance.
    onFieldsChangeRef.current = onFieldsChange
  }, [onFieldsChange])

  // Проверяет, нужно ли валидировать поле на конкретном событии (change/blur/submit).
  const shouldValidateField = useCallback(
    (name: string, trigger: FormValidateTrigger): boolean => {
      const fieldConfig = fieldRegistryRef.current[name]
      const triggers = normalizeValidateTrigger(fieldConfig?.validateTrigger)
      return triggers.includes(trigger)
    },
    [],
  )

  // Возвращает список известных полей: зарегистрированные + поля из текущих values.
  const getKnownFieldNames = useCallback((): string[] => {
    const knownNames = new Set<string>([
      ...Object.keys(fieldRegistryRef.current),
      ...collectLeafPaths(methods.getValues()),
    ])

    return Array.from(knownNames)
  }, [methods])

  // Формирует объект FormFieldData в формате onFieldsChange/getFieldsError.
  const buildFieldData = useCallback(
    (name: string, values: TValues): FormFieldData<TValues> => {
      const fieldState = methods.getFieldState(name as Path<RHFFormValues<TValues>>)
      const message = fieldState.error?.message

      return {
        name,
        value: getValueByPath(values, name),
        touched: fieldState.isTouched,
        errors: typeof message === 'string' ? [message] : [],
        values,
      }
    },
    [methods],
  )

  // Эмитит onFieldsChange: отдельно changedFields и полный allFields.
  const emitFieldsChange = useCallback(
    (changedNames: string[], valuesArg?: TValues): void => {
      const uniqueChangedNames = Array.from(new Set(changedNames.filter(Boolean)))
      if (uniqueChangedNames.length === 0) {
        return
      }

      const nextValues = valuesArg ?? (methods.getValues() as TValues)
      const changedFields = uniqueChangedNames.map((name) => buildFieldData(name, nextValues))

      const allNames = Array.from(new Set([...getKnownFieldNames(), ...uniqueChangedNames]))
      const allFields = allNames.map((name) => buildFieldData(name, nextValues))

      onFieldsChangeRef.current?.(changedFields, allFields)
    },
    [buildFieldData, getKnownFieldNames, methods],
  )

  // Устанавливает значение одного поля и синхронно эмитит нужные события формы.
  const setFieldValue = useCallback(
    async (
      name: string,
      value: unknown,
      options: SetFieldValueOptions = {},
    ): Promise<void> => {
      const beforeValues = methods.getValues() as TValues
      const previousValue = getValueByPath(beforeValues, name)
      const hasValueChanged = !isEqual(previousValue, value)
      const shouldTouch = Boolean(options.touch)
      const shouldValidate =
        options.validate ?? shouldValidateField(name, options.trigger ?? 'onChange')

      methods.setValue(name as Path<RHFFormValues<TValues>>, value as PathValue<
        RHFFormValues<TValues>,
        Path<RHFFormValues<TValues>>
      >, {
        shouldDirty: hasValueChanged,
        shouldTouch,
        shouldValidate: false,
      })

      if (shouldValidate) {
        await methods.trigger(name as Path<RHFFormValues<TValues>>)
      }

      const nextValues = methods.getValues() as TValues
      if (hasValueChanged) {
        onValuesChangeRef.current?.(
          setValueByPath({} as Partial<TValues>, name, getValueByPath(nextValues, name)),
          nextValues,
        )
      }

      if (hasValueChanged || shouldTouch || shouldValidate) {
        emitFieldsChange([name], nextValues)
      }
    },
    [emitFieldsChange, methods, shouldValidateField],
  )

  // Патчит сразу несколько полей из partial-объекта (аналог setFieldsValue).
  const setFieldsValue = useCallback(
    async (patch: Partial<TValues>): Promise<void> => {
      const beforeValues = methods.getValues() as TValues
      const changedPaths = collectLeafPaths(patch).filter((path) => {
        const previousValue = getValueByPath(beforeValues, path)
        const nextValue = getValueByPath(patch, path)
        return !isEqual(previousValue, nextValue)
      })

      if (changedPaths.length === 0) {
        return
      }

      for (const path of changedPaths) {
        const patchValue = getValueByPath(patch, path)
        methods.setValue(path as Path<RHFFormValues<TValues>>, patchValue as PathValue<
          RHFFormValues<TValues>,
          Path<RHFFormValues<TValues>>
        >, {
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false,
        })
      }

      const nextValues = methods.getValues() as TValues
      onValuesChangeRef.current?.(buildValuesFromPaths(changedPaths, nextValues), nextValues)
      emitFieldsChange(changedPaths, nextValues)
    },
    [emitFieldsChange, methods],
  )

  // Отмечает поле как touched и при необходимости запускает валидацию.
  const markFieldTouched = useCallback(
    async (name: string, trigger: FormValidateTrigger = 'onBlur'): Promise<void> => {
      const currentValue = getValueByPath(methods.getValues(), name)
      methods.setValue(name as Path<RHFFormValues<TValues>>, currentValue as PathValue<
        RHFFormValues<TValues>,
        Path<RHFFormValues<TValues>>
      >, {
        shouldDirty: false,
        shouldTouch: true,
        shouldValidate: false,
      })

      if (shouldValidateField(name, trigger)) {
        await methods.trigger(name as Path<RHFFormValues<TValues>>)
      }

      emitFieldsChange([name], methods.getValues() as TValues)
    },
    [emitFieldsChange, methods, shouldValidateField],
  )

  // Валидирует выбранные поля (или все зарегистрированные) и возвращает значения формы.
  const validateFields = useCallback(
    async (names?: string[]): Promise<TValues> => {
      const targetNames =
        names && names.length > 0
          ? Array.from(new Set(names))
          : Array.from(new Set(Object.keys(fieldRegistryRef.current)))

      const isValid =
        targetNames.length > 0
          ? await methods.trigger(targetNames as Path<RHFFormValues<TValues>>[])
          : await methods.trigger()

      const values = methods.getValues() as TValues
      if (targetNames.length > 0) {
        emitFieldsChange(targetNames, values)
      }

      if (!isValid) {
        const errorNames =
          targetNames.length > 0 ? targetNames : getKnownFieldNames()
        const errorFields = errorNames
          .map((name) => buildFieldData(name, values))
          .filter((field) => field.errors.length > 0)

        throw {
          values,
          errorFields,
        } as FormFinishFailed<TValues>
      }

      return values
    },
    [buildFieldData, emitFieldsChange, getKnownFieldNames, methods],
  )

  // Сбрасывает форму целиком или только указанные поля к initialValues.
  const resetFields = useCallback(
    (names?: string[]): void => {
      const targetNames =
        names && names.length > 0 ? Array.from(new Set(names)) : getKnownFieldNames()

      if (targetNames.length === 0) {
        methods.reset(initialValuesRef.current)
        return
      }

      for (const name of targetNames) {
        methods.resetField(name as Path<RHFFormValues<TValues>>, {
          defaultValue: getValueByPath(initialValuesRef.current, name) as PathValue<
            RHFFormValues<TValues>,
            Path<RHFFormValues<TValues>>
          >,
        })
      }

      emitFieldsChange(targetNames, methods.getValues() as TValues)
    },
    [emitFieldsChange, getKnownFieldNames, methods],
  )

  // Возвращает текущее значение одного поля по пути.
  const getFieldValue = useCallback(
    (name: string): unknown => getValueByPath(methods.getValues(), name),
    [methods],
  )

  // Возвращает полный снимок текущих значений формы.
  const getFieldsValue = useCallback((): TValues => methods.getValues() as TValues, [methods])

  // Возвращает массив ошибок одного поля.
  const getFieldError = useCallback(
    (name: string): string[] => {
      const message = methods.getFieldState(name as Path<RHFFormValues<TValues>>).error?.message
      return typeof message === 'string' ? [message] : []
    },
    [methods],
  )

  // Возвращает структуру ошибок/состояния для выбранных полей или для всех.
  const getFieldsError = useCallback(
    (names?: string[]): FormFieldData<TValues>[] => {
      const values = methods.getValues() as TValues
      const targetNames = names && names.length > 0 ? names : getKnownFieldNames()
      return targetNames.map((name) => buildFieldData(name, values))
    },
    [buildFieldData, getKnownFieldNames, methods],
  )

  // Проверяет, было ли поле затронуто пользователем.
  const isFieldTouched = useCallback(
    (name: string): boolean =>
      methods.getFieldState(name as Path<RHFFormValues<TValues>>).isTouched,
    [methods],
  )

  // Проверяет, были ли затронуты указанные поля (или любые известные поля).
  const isFieldsTouched = useCallback(
    (names?: string[]): boolean => {
      const targetNames = names && names.length > 0 ? names : getKnownFieldNames()
      return targetNames.some(
        (name) => methods.getFieldState(name as Path<RHFFormValues<TValues>>).isTouched,
      )
    },
    [getKnownFieldNames, methods],
  )

  // Регистрирует мета-данные поля (rules/validateTrigger) для Antd-подобного API.
  const registerField = useCallback(
    (name: string, options: RegisterFieldOptions<TValues> = {}): void => {
      fieldRegistryRef.current[name] = options
    },
    [],
  )

  // Удаляет поле из реестра при размонтировании Form.Item.
  const unregisterField = useCallback((name: string): void => {
    delete fieldRegistryRef.current[name]
  }, [])

  // Выполняет submit-цикл: success -> onFinish, error -> onFinishFailed.
  const submit = useCallback(async (): Promise<void> => {
    await methods.handleSubmit(
      // Ветка успешной валидации формы.
      async (values) => {
        await onFinishRef.current?.(values as unknown as TValues)
      },
      // Ветка ошибок валидации формы.
      async () => {
        const values = methods.getValues() as TValues
        const errorFields = getKnownFieldNames()
          .map((name) => buildFieldData(name, values))
          .filter((field) => field.errors.length > 0)

        await onFinishFailedRef.current?.({
          values,
          errorFields,
        })
      },
    )()
  }, [buildFieldData, getKnownFieldNames, methods])

  // Собирает стабильный form instance, который отдаётся через FormContext.
  const form = useMemo<FormInstance<TValues>>(
    () => ({
      getFieldValue,
      getFieldsValue,
      getFieldError,
      getFieldsError,
      isFieldTouched,
      isFieldsTouched,
      setFieldValue,
      setFieldsValue,
      resetFields,
      validateFields,
      submit,
      registerField,
      unregisterField,
      markFieldTouched,
    }),
    [
      getFieldError,
      getFieldValue,
      getFieldsError,
      getFieldsValue,
      isFieldTouched,
      isFieldsTouched,
      markFieldTouched,
      registerField,
      resetFields,
      setFieldValue,
      setFieldsValue,
      submit,
      unregisterField,
      validateFields,
    ],
  )

  // Перехватывает submit браузера и перенаправляет в form.submit().
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault()
      void submit()
    },
    [submit],
  )

  return (
    // Вкладываем сразу два контекста:
    // 1) RHF FormProvider для useController/useWatch,
    // 2) наш FormContext для Antd-подобного API.
    <form className={clsx('form', `form--${layout}`, className)} onSubmit={handleSubmit} noValidate>
      <FormProvider {...methods}>
        <FormContext.Provider value={form}>{children}</FormContext.Provider>
      </FormProvider>
    </form>
  )
}
