import { AuthByPasswordForm } from '@/features/auth-by-password'
import { CloudFabricBrand } from '@/shared/ui/cloud-fabric-brand'
import '@/widgets/login-panel/ui/login-panel.css'

/**
 * Карточка авторизации с бренд-блоком и формой входа.
 *
 * @returns JSX-элемент панели логина.
 */
export const LoginPanel = () => (
  <section className="login-panel">
    <div className="login-panel__beam" />
    <div className="login-panel__halo" />

    <div className="login-panel__card">
      <CloudFabricBrand className="login-panel__brand" />
      <h1 className="login-panel__title" aria-label="Добро пожаловать!">
        Добро
        <br />
        пожаловать!
      </h1>

      <AuthByPasswordForm />
    </div>
  </section>
)
