import { useI18nStore } from '../../store/i18nStore.js'

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useI18nStore()

  return (
    <button
      onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black border transition-all
        ${lang === 'uz'
          ? 'bg-ocean-50 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300 border-ocean-200 dark:border-ocean-700/50 hover:bg-ocean-100'
          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/50 hover:bg-rose-100'}
        ${className}`}
      title={lang === 'uz' ? "Переключить на русский" : "O'zbekchaga o'tish"}
    >
      <span className="text-base leading-none">{lang === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
      <span className="uppercase tracking-wider">{lang === 'uz' ? 'UZ' : 'RU'}</span>
    </button>
  )
}
