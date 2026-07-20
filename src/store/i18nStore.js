import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const translations = {
  uz: {
    // Nav
    dashboard: 'Dashboard', fishCatalog: 'Baliqlar katalogi', farmList: "Ferma ro'yxati", driverList: "Haydovchi ro'yxati",
    productDetail: 'Mahsulot tafsiloti', cart: 'Savatcha', myOrders: 'Buyurtmalarim',
    chat: 'Chat', profile: 'Profil', paymentBonus: "To'lov kutilmoqda", security: 'Xavfsizlik',
    settings: 'Sozlamalar', fish: 'Baliqlar', addFish: "Baliq qo'shish", inventory: 'Ombor',
    orders: 'Buyurtmalar', customers: 'Mijozlar', balance: 'Balans', reports: 'Hisobotlar',
    myOrdersDriver: 'Mening buyurtmalarim', liveTracking: 'Haydovchiga biriktirildi',
    farmRequests: "Ferma so'rovlari", driverRequests: "Haydovchi so'rovlari", users: 'Foydalanuvchilar',
    promoCodes: 'Promo kodlar', gpsMonitoring: 'GPS Monitoring', chatMonitoring: 'Chat monitoring',
    auditLog: 'Audit log', statistics: 'Statistika', netProfit: 'Sof foyda',
    withdrawals: 'Pul chiqarish', dbAdmin: 'DB Boshqaruv', kpi: 'KPI',
    systemStatistics: 'Tizim statistikasi', adminManagement: 'Admin boshqaruvi',
    roles: 'Rollar', permissions: 'Ruxsatlar', systemSettings: 'Tizim sozlamalari',

    // Auth
    logout: 'Chiqish', login: 'Kirish', registerNow: "Ro'yxatdan o'tish",
    noAccount: "Akkount yo'qmi?", haveAccount: 'Akkountingiz bormi?',
    rememberMe: 'Meni eslab qol', forgotPassword: 'Parolni unutdingizmi?',
    welcomeBack: 'Xush kelibsiz', enterCredentials: "Platformaga kirish uchun ma'lumotlaringizni kiriting.",
    phone: 'Telefon raqam', password: 'Parol', enterPhone: '+998 90 000 00 00',
    phonePlaceholder: '+998901234567', phoneHint: 'Masalan: 901234567',
    passwordPlaceholder: '••••••••',
    loggingIn: 'Kirilmoqda...', firstName: 'Ism', lastName: 'Familiya',
    creating: 'Yaratilmoqda...', createAccount: 'Akkount yaratish',
    registerTitle: "Ro'yxatdan o'tish", registerDesc: "Hisob yarating va platformadan foydalanishni boshlang.",
    smsCodeBtn: 'Kod olish',
    telegramOtpSent: 'Tasdiqlash kodi Telegram ga yuborildi 📱',
    forgotTitle: 'Parolni tiklash', forgotDesc: "Telefon raqamingizni kiriting — Telegram orqali kod yuboramiz.",
    sendCode: 'Kod olish', backToLogin: 'Kirishga qaytish',
    resetTitle: 'Yangi parol', resetDesc: "Yangi parol o'rnating.",
    newPassword: 'Yangi parol', confirmPassword: 'Parolni tasdiqlang',
    savePassword: 'Saqlash', savingPassword: 'Saqlanmoqda...',
    otpTitle: 'Tasdiqlash kodi', otpDesc: 'ga yuborilgan 6 xonali kodni kiriting',
    otpSentTelegram: 'Kod Telegram botga yuborildi', verify: 'Tasdiqlash',
    verifying: 'Tekshirilmoqda...', resend: 'Qayta yuborish',
    otpVerifyBtn: 'Tasdiqlash', otpVerifying: 'Tekshirilmoqda...',
    otpResend: 'Qayta yuborish', otpResending: 'Yuborilmoqda...',
    otpTimer: 'Qayta yuborish mumkin:', otpTimerSec: 'soniya',
    otpSentToBot: 'Kod Telegram botga yuborildi',
    otpExpired: 'Kod muddati tugadi. Qayta yuboring.',
    otpConnectTitle: 'Telegram bilan ulang', otpConnectDesc: 'Tasdiqlash kodini olish uchun Telegram botni ulang',
    otpCheckBtn: 'Ulanishni tekshirish', otpChecking: 'Tekshirilmoqda...', otpCheckingDesc: 'Telegram bilan ulanish tekshirilmoqda...',
    otpOpenBot: 'Botni ochish', otpOpenBotLink: "Botga o'tish",
    otpHowStep1: 'Telegram botni oching', otpHowStep2: '/start bosing', otpHowStep3: 'Kodni kiriting',
    otpSecurity: 'Xavfsizlik', otpSecurityDesc: "Agar siz bo'lmasangiz, parolingizni o'zgartiring",
    otpSecurityWarning: 'Shubhali kirish aniqlandi',
    telegramTitle: 'Telegram bilan ulang', telegramDesc: 'Tasdiqlash kodini olish uchun Telegram botni ulashingiz kerak.',
    openBot: 'Telegram botni ochish', checkLink: 'Ulanishni tekshirish', checking: 'Tekshirilmoqda...',

    // Dashboard
    goodMorning: 'Xayrli tong', goodDay: 'Xayrli kun', goodEvening: 'Xayrli kech',
    liveDashboard: 'Jonli panel', totalOrders: 'Buyurtmalar', totalFish: 'Baliqlar',
    totalFarms: 'Fermalar', totalDrivers: 'Haydovchilar',

    // Catalog
    search: 'Qidirish...', all: 'Barchasi', addToCart: 'Savatga', detail: 'Batafsil',
    inStock: 'Mavjud', outOfStock: 'Tugagan', catalogTitle: 'Baliqlar katalogi',
    catalogFound: 'ta baliq topildi', loading: 'Yuklanmoqda...', noResults: 'Baliq topilmadi',
    noResultsDesc: 'Boshqa kalit so\'z bilan qidiring', clear: 'Tozalash',

    // Cart
    cartTitle: 'Savatcha', cartEmpty: 'Savatcha bo\'sh',
    cartEmptyDesc: 'Katalogdan baliq tanlang va savatchaga qo\'shing',
    cartGoToCatalog: "Katalogga o'tish", goToCatalog: 'Katalogga o\'tish', clearCart: 'Tozalash',
    cartDeliveryAddress: 'Yetkazish manzili',
    cartGetLocation: 'GPS orqali aniqlash', cartDetecting: 'Aniqlanmoqda...', cartLocationDetected: 'Lokatsiya aniqlandi',
    cartPromoCode: 'Promo-kod', cartPromoApply: "Qo'llash",
    cartPayMethod: "To'lov usuli", cartCash: 'Naqd', cartComingSoon: 'Tez kunda',
    cartTelegramInvoice: 'Telegram invoice',
    cartProducts: 'Mahsulotlar', cartItems: 'ta mahsulot',
    cartSubtotal: 'Oraliq summa', cartDiscount: 'Chegirma', cartTotal: 'Jami',
    cartPlaceOrder: 'Buyurtma berish', cartPlacing: 'Yuborilmoqda...',
    cartConfirm: 'Tasdiqlash', cartCancel: 'Bekor qilish',
    cartRemoveTitle: 'Savatchadan olib tashlash?', cartRemoveDesc: 'Mahsulot savatchadan olib tashlanadi.',
    waitingPaymentTitle: "To'lov kutilmoqda", waitingPaymentDesc: "Invoice Telegram ga yuborildi. To'lovni amalga oshiring.",
    waitingPaymentCheck: "To'lovni tekshirish", waitingPaymentChecking: 'Tekshirilmoqda...',
    waitingPaymentCancel: 'Bekor qilish', waitingPaymentSuccess: "✅ To'lov tasdiqlandi! Buyurtma yaratildi.",
    deliveryAddress: 'Yetkazish manzili', paymentMethod: 'To\'lov usuli',
    locationDetected: 'Lokatsiya aniqlandi', changeLocation: 'O\'zgartirish',
    detectLocation: 'Hozirgi joylashuvimni aniqlash', detecting: 'Aniqlanmoqda...',
    total: 'Jami', sendInvoice: 'Telegram invoice yuborish', sending: 'Yuborilmoqda...',
    invoiceSent: 'Invoice Telegram ga yuborildi! 📱',
    paymentPending: 'To\'lov kutilmoqda...', openTelegram: 'Telegram botni oching va to\'lang',
    paymentConfirmed: '✅ To\'lov tasdiqlandi! Buyurtma yaratildi.',
    cancel: 'Bekor qilish', items: 'xil mahsulot',
    paymentNote: "To'lov tasdiqlangandan keyingina buyurtma yaratiladi.",

    // Orders
    ordersTitle: 'Buyurtmalar', orderNumber: 'Buyurtma', statusPending: 'Kutilmoqda',
    statusConfirmed: 'Tasdiqlandi', statusDelivered: 'Yetkazildi', statusCancelled: 'Bekor qilindi',
    statusInTransit: "Yo'lda", statusLoading: 'Yuklanmoqda', statusDriverAssigned: 'Haydovchiga biriktirildi',
    statusAwaitingPayment: "To'lov kutilmoqda", noOrders: 'Buyurtmalar yo\'q',

    // Profile
    profileTitle: 'Profil', editProfile: 'Tahrirlash', save: 'Saqlash', saving: 'Saqlanmoqda...',
    personalInfo: 'Shaxsiy ma\'lumotlar', contactInfo: 'Aloqa ma\'lumotlari',

    // Misc
    language: 'Til', offline: 'Internet yo\'q', offlineDesc: 'Ulanishni tekshiring',
    pdfExport: 'PDF yuklash', farmRating: 'Ferma reytingi', driverRating: 'Haydovchi reytingi',
    somPrice: 'so\'m', perKg: '/kg', per: '/', copy: 'Nusxa olish', copied: 'Nusxalandi!',
    delete: 'O\'chirish', edit: 'Tahrirlash', add: 'Qo\'shish', close: 'Yopish',
    confirm: 'Tasdiqlash', back: 'Orqaga', next: 'Keyingi', yes: 'Ha', no: 'Yo\'q',
    success: 'Muvaffaqiyatli', error: 'Xatolik', warning: 'Ogohlantirish',
    noData: 'Ma\'lumot topilmadi', retry: 'Qayta urinish',

    // Farm
    farmDashboard: 'Ferma boshqaruvi', addFishTitle: 'Baliq qo\'shish',
    fishName: 'Baliq nomi', fishPrice: 'Narx (so\'m/kg)', fishStock: 'Ombor (kg)',
    fishCategory: 'Kategoriya', fishDescription: 'Tavsif', uploadImage: 'Rasm yuklash',
    maxStock: 'Maksimal:', stockExceeded: 'Ombordagi miqdordan oshib ketdi',

    // Driver
    driverDashboard: 'Haydovchi paneli', myDeliveries: 'Mening yetkazishlarim',
    startDelivery: 'Yetkazishni boshlash', completeDelivery: 'Yakunlash',

    // Admin
    adminDashboard: 'Admin paneli', approveRequest: 'Tasdiqlash', rejectRequest: 'Rad etish',
    createPromo: 'Promo kod yaratish', promoCode: 'Promo kod', discount: 'Chegirma',
    maxUses: 'Max foydalanish', expiry: 'Muddati',

    // Catalog filters
    catalog: 'Katalog', filter: 'Filter', sort: 'Saralash', sortBy: 'Saralash:',
    priceAsc: 'Arzon → Qimmat', priceDesc: 'Qimmat → Arzon',
    minPrice: 'Min narx', maxPrice: 'Max narx',

    // Review
    reviewTitle: 'Baho berish', reviewPlaceholder: 'Izoh yozing...',
    reviewSubmit: 'Yuborish', reviewSuccess: 'Bahoingiz qabul qilindi! ✅',
    ratingDesc: 'Qanday baho berasiz?',

    // Search
    searching: 'Qidirilmoqda...', noSearchResult: "bo'yicha natija topilmadi",
    viewAllCatalog: "Barcha katalogni ko'rish →",

    // Misc
    loggedOut: 'Tizimdan chiqildi',
    agreeTerms: "Kirib, foydalanish shartlariga rozilik bildirasiz",
    platformSlogan: "O'zbekistonning №1 baliq savdo platformasi",
    platformDesc: "Mijoz, Fermer, Haydovchi va Admin rollari uchun professional boshqaruv. Real-vaqt kuzatuv, GPS logistika, kuchli analitika.",
    statFarms: 'Fermalar', statCustomers: 'Mijozlar', statSatisfaction: 'Mamnunlik',
    feat1Title: 'Real-vaqt', feat1Desc: "Buyurtmalarni jonli kuzating",
    feat2Title: 'Xavfsiz', feat2Desc: "To'lovlar 256-bit himoyalangan",
    feat3Title: 'Analitika', feat3Desc: 'Kuchli hisobot paneli',
    feat4Title: 'GPS', feat4Desc: 'Navigatsiya va yetkazib berish',
    headlinePart1: "Ferma, logistika", headlineAccent: "va savdoni", headlinePart2: "bitta panelda.",
    roleCustomer: 'Mijoz', roleFarmOwner: 'Ferma egasi', roleDriver: 'Haydovchi',
    roleAdmin: 'Administrator', roleManager: 'Menejer', roleSuperAdmin: 'Super Admin',
  },

  ru: {
    // Nav
    dashboard: 'Панель', fishCatalog: 'Каталог рыбы', farmList: 'Список ферм', driverList: 'Регистрация водителя',
    productDetail: 'Детали товара', cart: 'Корзина', myOrders: 'Мои заказы',
    chat: 'Чат', profile: 'Профиль', paymentBonus: 'Оплата и бонусы', security: 'Безопасность',
    settings: 'Настройки', fish: 'Рыба', addFish: 'Добавить рыбу', inventory: 'Склад',
    orders: 'Заказы', customers: 'Клиенты', balance: 'Баланс', reports: 'Отчёты',
    myOrdersDriver: 'Мои заказы', liveTracking: 'Живое отслеживание',
    farmRequests: 'Заявки ферм', driverRequests: 'Заявки водителей', users: 'Пользователи',
    promoCodes: 'Промокоды', gpsMonitoring: 'GPS Мониторинг', chatMonitoring: 'Мониторинг чата',
    auditLog: 'Журнал аудита', statistics: 'Статистика', netProfit: 'Чистая прибыль',
    withdrawals: 'Вывод средств', dbAdmin: 'Управление БД', kpi: 'KPI',
    systemStatistics: 'Статистика системы', adminManagement: 'Управление админами',
    roles: 'Роли', permissions: 'Разрешения', systemSettings: 'Настройки системы',

    // Auth
    logout: 'Выход', login: 'Войти', registerNow: 'Регистрация',
    noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?',
    rememberMe: 'Запомнить меня', forgotPassword: 'Забыли пароль?',
    welcomeBack: 'С возвращением', enterCredentials: 'Введите данные для входа в платформу.',
    phone: 'Номер телефона', password: 'Пароль', enterPhone: '+998 90 000 00 00',
    phonePlaceholder: '+998901234567', phoneHint: 'Например: 901234567',
    passwordPlaceholder: '••••••••',
    loggingIn: 'Вход...', firstName: 'Имя', lastName: 'Фамилия',
    creating: 'Создание...', createAccount: 'Создать аккаунт',
    registerTitle: 'Регистрация', registerDesc: 'Создайте аккаунт и начните пользоваться платформой.',
    smsCodeBtn: 'Получить код',
    telegramOtpSent: 'Код подтверждения отправлен в Telegram 📱',
    forgotTitle: 'Восстановление пароля', forgotDesc: 'Введите номер телефона — отправим код через Telegram.',
    sendCode: 'Получить код', backToLogin: 'Вернуться ко входу',
    resetTitle: 'Новый пароль', resetDesc: 'Установите новый пароль.',
    newPassword: 'Новый пароль', confirmPassword: 'Подтвердите пароль',
    savePassword: 'Сохранить', savingPassword: 'Сохранение...',
    otpTitle: 'Код подтверждения', otpDesc: 'Введите 6-значный код, отправленный на',
    otpSentTelegram: 'Код отправлен в Telegram бот', verify: 'Подтвердить',
    verifying: 'Проверка...', resend: 'Отправить повторно',
    otpVerifyBtn: 'Подтвердить', otpVerifying: 'Проверка...',
    otpResend: 'Отправить повторно', otpResending: 'Отправка...',
    otpTimer: 'Повторная отправка через:', otpTimerSec: 'сек',
    otpSentToBot: 'Код отправлен в Telegram бот',
    otpExpired: 'Код истёк. Отправьте повторно.',
    otpConnectTitle: 'Подключите Telegram', otpConnectDesc: 'Подключите Telegram бот для получения кода',
    otpCheckBtn: 'Проверить подключение', otpChecking: 'Проверка...', otpCheckingDesc: 'Проверяем подключение к Telegram...',
    otpOpenBot: 'Открыть бот', otpOpenBotLink: 'Перейти в бот',
    otpHowStep1: 'Откройте Telegram бот', otpHowStep2: 'Нажмите /start', otpHowStep3: 'Введите код',
    otpSecurity: 'Безопасность', otpSecurityDesc: 'Если это не вы, смените пароль',
    otpSecurityWarning: 'Обнаружен подозрительный вход',
    telegramTitle: 'Подключите Telegram', telegramDesc: 'Для получения кода подтверждения подключите Telegram бот.',
    openBot: 'Открыть Telegram бот', checkLink: 'Проверить подключение', checking: 'Проверка...',

    // Dashboard
    goodMorning: 'Доброе утро', goodDay: 'Добрый день', goodEvening: 'Добрый вечер',
    liveDashboard: 'Панель в реальном времени', totalOrders: 'Заказы', totalFish: 'Рыба',
    totalFarms: 'Фермы', totalDrivers: 'Водители',

    // Catalog
    search: 'Поиск...', all: 'Все', addToCart: 'В корзину', detail: 'Подробнее',
    inStock: 'В наличии', outOfStock: 'Нет в наличии', catalogTitle: 'Каталог рыбы',
    catalogFound: 'найдено', loading: 'Загрузка...', noResults: 'Рыба не найдена',
    noResultsDesc: 'Попробуйте другой запрос', clear: 'Очистить',

    // Cart
    cartTitle: 'Корзина', cartEmpty: 'Корзина пуста',
    cartEmptyDesc: 'Выберите рыбу из каталога и добавьте в корзину',
    cartGoToCatalog: 'Перейти в каталог', goToCatalog: 'Перейти в каталог', clearCart: 'Очистить',
    cartDeliveryAddress: 'Адрес доставки',
    cartGetLocation: 'Определить по GPS', cartDetecting: 'Определение...', cartLocationDetected: 'Местоположение определено',
    cartPromoCode: 'Промокод', cartPromoApply: 'Применить',
    cartPayMethod: 'Способ оплаты', cartCash: 'Наличные', cartComingSoon: 'Скоро',
    cartTelegramInvoice: 'Telegram invoice',
    cartProducts: 'Товары', cartItems: 'товаров',
    cartSubtotal: 'Подытог', cartDiscount: 'Скидка', cartTotal: 'Итого',
    cartPlaceOrder: 'Оформить заказ', cartPlacing: 'Оформление...',
    cartConfirm: 'Подтвердить', cartCancel: 'Отмена',
    cartRemoveTitle: 'Удалить из корзины?', cartRemoveDesc: 'Товар будет удалён из корзины.',
    waitingPaymentTitle: 'Ожидание оплаты', waitingPaymentDesc: 'Invoice отправлен в Telegram. Оплатите заказ.',
    waitingPaymentCheck: 'Проверить оплату', waitingPaymentChecking: 'Проверка...',
    waitingPaymentCancel: 'Отмена', waitingPaymentSuccess: '✅ Оплата подтверждена! Заказ создан.',
    deliveryAddress: 'Адрес доставки', paymentMethod: 'Способ оплаты',
    locationDetected: 'Местоположение определено', changeLocation: 'Изменить',
    detectLocation: 'Определить моё местоположение', detecting: 'Определение...',
    total: 'Итого', sendInvoice: 'Отправить Telegram Invoice', sending: 'Отправка...',
    invoiceSent: 'Invoice отправлен в Telegram! 📱',
    paymentPending: 'Ожидание оплаты...', openTelegram: 'Откройте Telegram бот и оплатите',
    paymentConfirmed: '✅ Оплата подтверждена! Заказ создан.',
    cancel: 'Отмена', items: 'позиций',
    paymentNote: 'Заказ создаётся только после подтверждения оплаты.',

    // Orders
    ordersTitle: 'Заказы', orderNumber: 'Заказ', statusPending: 'Ожидание',
    statusConfirmed: 'Подтверждён', statusDelivered: 'Доставлен', statusCancelled: 'Отменён',
    statusInTransit: 'В пути', statusLoading: 'Загрузка', noOrders: 'Заказов нет',

    // Profile
    profileTitle: 'Профиль', editProfile: 'Редактировать', save: 'Сохранить', saving: 'Сохранение...',
    personalInfo: 'Личные данные', contactInfo: 'Контактные данные',

    // Misc
    language: 'Язык', offline: 'Нет интернета', offlineDesc: 'Проверьте соединение',
    pdfExport: 'Скачать PDF', farmRating: 'Рейтинг фермы', driverRating: 'Рейтинг водителя',
    somPrice: 'сум', perKg: '/кг', per: '/', copy: 'Копировать', copied: 'Скопировано!',
    delete: 'Удалить', edit: 'Редактировать', add: 'Добавить', close: 'Закрыть',
    confirm: 'Подтвердить', back: 'Назад', next: 'Далее', yes: 'Да', no: 'Нет',
    success: 'Успешно', error: 'Ошибка', warning: 'Предупреждение',
    noData: 'Данные не найдены', retry: 'Повторить',

    // Farm
    farmDashboard: 'Управление фермой', addFishTitle: 'Добавить рыбу',
    fishName: 'Название рыбы', fishPrice: 'Цена (сум/кг)', fishStock: 'Склад (кг)',
    fishCategory: 'Категория', fishDescription: 'Описание', uploadImage: 'Загрузить фото',
    maxStock: 'Максимум:', stockExceeded: 'Превышено количество на складе',

    // Driver
    driverDashboard: 'Панель водителя', myDeliveries: 'Мои доставки',
    startDelivery: 'Начать доставку', completeDelivery: 'Завершить',

    // Admin
    adminDashboard: 'Панель администратора', approveRequest: 'Одобрить', rejectRequest: 'Отклонить',
    createPromo: 'Создать промокод', promoCode: 'Промокод', discount: 'Скидка',
    maxUses: 'Макс. использований', expiry: 'Срок действия',

    // Catalog filters
    catalog: 'Каталог', filter: 'Фильтр', sort: 'Сортировка', sortBy: 'Сортировать:',
    priceAsc: 'По возрастанию цены', priceDesc: 'По убыванию цены',
    minPrice: 'Мин. цена', maxPrice: 'Макс. цена',

    // Review
    reviewTitle: 'Оставить отзыв', reviewPlaceholder: 'Напишите отзыв...',
    reviewSubmit: 'Отправить', reviewSuccess: 'Отзыв принят! ✅',
    ratingDesc: 'Как вы оцениваете?',

    // Search
    searching: 'Поиск...', noSearchResult: 'по запросу результатов нет',
    viewAllCatalog: 'Весь каталог →',

    // Misc
    loggedOut: 'Выход выполнен',
    agreeTerms: 'Войдя, вы соглашаетесь с условиями использования',
    platformSlogan: '№1 платформа продажи рыбы в Узбекистане',
    platformDesc: 'Профессиональное управление для покупателей, фермеров, водителей и администраторов. Отслеживание в реальном времени, GPS-логистика, мощная аналитика.',
    statFarms: 'Фермы', statCustomers: 'Клиенты', statSatisfaction: 'Довольных',
    feat1Title: 'Реальное время', feat1Desc: 'Отслеживайте заказы онлайн',
    feat2Title: 'Безопасно', feat2Desc: 'Платежи защищены 256-bit',
    feat3Title: 'Аналитика', feat3Desc: 'Мощная панель отчётов',
    feat4Title: 'GPS', feat4Desc: 'Навигация и доставка',
    headlinePart1: "Ферма, логистика", headlineAccent: "и торговлю", headlinePart2: "в одной панели.",
    roleCustomer: 'Покупатель', roleFarmOwner: 'Владелец фермы', roleDriver: 'Водитель',
    roleAdmin: 'Администратор', roleManager: 'Менеджер', roleSuperAdmin: 'Супер Админ',
  },
}

export const useI18nStore = create(
  persist(
    (set) => ({ lang: 'uz', setLang: (lang) => set({ lang }) }),
    { name: 'baliq-lang' }
  )
)

export function useT() {
  const lang = useI18nStore((s) => s.lang)
  return translations[lang] || translations.uz
}
