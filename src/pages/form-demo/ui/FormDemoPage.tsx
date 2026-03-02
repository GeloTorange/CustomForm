import { ProfileFormWidget } from '@/widgets/profile-form'

// Страница-демо, где собран пример использования формы.
export const FormDemoPage = () => (
  <main className="form-demo-page">
    <section className="form-demo-page__header">
      <p className="form-demo-page__badge">FSD demo</p>
      <h1 className="form-demo-page__title">Universal Form API в стиле Antd Form</h1>
      <p className="form-demo-page__subtitle">
        Реализован контекст, трекинг изменений полей и адаптация сторонних UI компонентов поверх
        react-hook-form.
      </p>
    </section>

    <ProfileFormWidget />
  </main>
)
