import { Children, cloneElement, isValidElement, useEffect, useMemo } from 'react'
import { type Path, useController } from 'react-hook-form'

import { clsx } from 'clsx'
import { validateValue } from '@/shared/lib/form/validation'
import type {
  FormItemProps,
  FormItemRenderProps,
  FormValidateTrigger,
  FormValues,
  ValidationRule,
} from '@/shared/lib/form/types'
import { useFormInstance } from '@/shared/ui/form/hooks/useFormInstance'

type RHFFormValues<TValues extends FormValues> = TValues & Record<string, unknown>

// Универсально извлекает значение из событий разных UI-компонентов.
const resolveValueFromEvent = (valuePropName: string, args: unknown[]): unknown => {
  if (args.length === 0) {
    return undefined
  }

  const firstArg = args[0]
  if (
    firstArg &&
    typeof firstArg === 'object' &&
    'target' in firstArg &&
    firstArg.target &&
    typeof firstArg.target === 'object'
  ) {
    const target = firstArg.target as Record<string, unknown>
    if (valuePropName in target) {
      return target[valuePropName]
    }

    if ('value' in target) {
      return target.value
    }

    if ('checked' in target) {
      return target.checked
    }
  }

  return args.length === 1 ? args[0] : args
}

// Преобразует набор наших rules в validate-функцию для react-hook-form.
const buildValidate = <TValues extends FormValues>(
  rules?: ValidationRule<TValues>[],
  getValues?: () => TValues,
) => {
  if (!rules || rules.length === 0 || !getValues) {
    return undefined
  }

  return async (value: unknown): Promise<true | string> => {
    const message = await validateValue(value, getValues(), rules)
    return message ?? true
  }
}

// Form.Item с именованным полем: связь с RHF + валидация + адаптация сторонних контролов.
const FormItemField = <TValues extends FormValues = FormValues>({
  name,
  label,
  className,
  help,
  noStyle,
  valuePropName = 'value',
  trigger = 'onChange',
  validateTrigger,
  getValueFromEvent,
  normalize,
  rules,
  children,
}: FormItemProps<TValues> & { name: string }) => {
  const form = useFormInstance<TValues>()

  useEffect(() => {
    // Регистрируем поле в нашем form instance, чтобы API оставался Antd-подобным.
    form.registerField(name, { rules, validateTrigger })
    return () => {
      // Удаляем поле из реестра при размонтировании.
      form.unregisterField(name)
    }
  }, [form, name, rules, validateTrigger])

  // Собираем validate-функцию один раз на набор правил.
  const validate = useMemo(() => buildValidate(rules, form.getFieldsValue), [form, rules])

  const { field, fieldState } = useController<RHFFormValues<TValues>>({
    name: name as Path<RHFFormValues<TValues>>,
    rules: validate ? { validate } : undefined,
  })

  const value = field.value
  const errors =
    typeof fieldState.error?.message === 'string' ? [fieldState.error.message] : []
  const touched = fieldState.isTouched
  const isRequired = Boolean(rules?.some((rule) => rule.required))
  const helpMessage = help ?? errors[0]

  // Пропсы, которые Form.Item передаёт в render-prop вариант children.
  const formItemProps: FormItemRenderProps<TValues> = {
    name,
    value,
    errors,
    touched,
    form,
    onChange: (...args: unknown[]): void => {
      const resolvedValue = getValueFromEvent
        ? getValueFromEvent(...args)
        : resolveValueFromEvent(valuePropName, args)
      const previousValue = form.getFieldValue(name)
      const normalizedValue = normalize
        ? normalize(resolvedValue, previousValue, form.getFieldsValue())
        : resolvedValue
      const resolvedTrigger: FormValidateTrigger = trigger === 'onBlur' ? 'onBlur' : 'onChange'

      // Обновляем значение через общий form instance, чтобы сработали onValuesChange/onFieldsChange.
      void form.setFieldValue(name, normalizedValue, {
        touch: true,
        trigger: resolvedTrigger,
      })
    },
    onBlur: (): void => {
      // Сообщаем RHF о blur и синхронизируем touched/валидацию в нашем API.
      field.onBlur()
      void form.markFieldTouched(name, 'onBlur')
    },
  }

  // Строим контролируемый элемент:
  // - render-prop режим или
  // - cloneElement с подстановкой value/trigger/onBlur.
  const control = (() => {
    if (typeof children === 'function') {
      return children(formItemProps)
    }

    const child = Children.only(children)
    if (!isValidElement(child)) {
      return child
    }

    const childProps = child.props as Record<string, unknown>
    const originalTrigger = childProps[trigger] as ((...args: unknown[]) => void) | undefined
    const originalBlur = childProps.onBlur as ((...args: unknown[]) => void) | undefined
    const controlledProps: Record<string, unknown> = {
      [valuePropName]: valuePropName === 'checked' ? Boolean(value) : (value ?? ''),
      [trigger]: (...args: unknown[]): void => {
        formItemProps.onChange(...args)
        originalTrigger?.(...args)
      },
      onBlur: (...args: unknown[]): void => {
        formItemProps.onBlur(...args)
        originalBlur?.(...args)
      },
      name: field.name,
      ref: field.ref,
    }

    return cloneElement(child, controlledProps)
  })()

  if (noStyle) {
    // Режим noStyle: возвращаем только сам контрол без обёртки.
    return <>{control}</>
  }

  return (
    <div className={clsx('form-item', errors.length > 0 && 'form-item--invalid', className)}>
      {label ? (
        <label className="form-item__label">
          {label}
          {isRequired ? <span className="form-item__required">*</span> : null}
        </label>
      ) : null}
      <div className="form-item__control">{control}</div>
      {helpMessage ? <div className="form-item__help">{helpMessage}</div> : null}
    </div>
  )
}

// Form.Item без name: используется как контейнер для layout/кнопок/статичного контента.
const FormItemStatic = <TValues extends FormValues = FormValues>({
  label,
  className,
  help,
  noStyle,
  children,
}: FormItemProps<TValues>) => {
  const form = useFormInstance<TValues>()
  const control =
    typeof children === 'function'
      ? children({
          value: undefined,
          errors: [],
          touched: false,
          onChange: () => undefined,
          onBlur: () => undefined,
          form,
        })
      : children

  if (noStyle) {
    // В noStyle-режиме не рендерим label/help-обвязку.
    return <>{control}</>
  }

  return (
    <div className={clsx('form-item', className)}>
      {label ? <label className="form-item__label">{label}</label> : null}
      <div className="form-item__control">{control}</div>
      {help ? <div className="form-item__help">{help}</div> : null}
    </div>
  )
}

// Публичный компонент Form.Item: выбирает режим named/static по наличию name.
export const FormItem = <TValues extends FormValues = FormValues>(
  props: FormItemProps<TValues>,
) => {
  if (!props.name) {
    return <FormItemStatic {...props} />
  }

  return <FormItemField {...props} name={props.name} />
}
