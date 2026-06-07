import { FormInput } from '../../components/forms/FormInput.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function ProfilePage() {
  usePageTitle('Profil')
  return (
    <section className="glass-card max-w-3xl p-6">
      <h2 className="text-3xl font-black">Profil</h2>
      <p className="mt-2 text-slate-500">Profil ma’lumotlarini tahrirlash formasi.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormInput label="Ism" />
        <FormInput label="Familiya" />
        <FormInput label="Telefon" />
        <FormInput label="Email" />
      </div>
      <button className="primary-button mt-6">Saqlash</button>
    </section>
  )
}
