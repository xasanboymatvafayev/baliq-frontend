/**
 * <T uz="Saqlash" ru="Сохранить" />
 * Til almashganda avtomatik o'zgaradi
 */
import { useI18nStore } from '../../store/i18nStore.js'

export function T({ uz, ru }) {
  const lang = useI18nStore(s => s.lang)
  return <>{lang === 'ru' ? (ru || uz) : uz}</>
}
