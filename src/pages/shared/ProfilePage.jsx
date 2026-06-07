import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/index.js'

export function ProfilePage() {
  usePageTitle('Profil')
  const pushToast = useToastStore((state) => state.pushToast)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset } = useForm()

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => httpClient.get('/settings/profile'),
  })

  useEffect(() => {
    if (profile) reset(profile)
  }, [profile, reset])

  const mutation = useMutation({
    mutationFn: (data) => httpClient.put('/settings/profile', data),
    onSuccess: () => {
      pushToast({ title: 'Profil yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['profile'])
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <section className="glass-card max-w-3xl p-6">
      <h2 className="text-3xl font-black">Profil</h2>
      <p className="mt-2 text-slate-500">Shaxsiy ma'lumotlaringizni tahrirlang.</p>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <FormInput label="Ism" {...register('firstName')} />
        <FormInput label="Familiya" {...register('lastName')} />
        <FormInput label="Telefon" {...register('phone')} />
        <FormInput label="Email" {...register('email')} />
        <div className="sm:col-span-2">
          <button className="primary-button" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </section>
  )
}
