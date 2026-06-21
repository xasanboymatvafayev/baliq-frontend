// ─── Har bir kolleksiya uchun forma sxemasi (oddiy odam tushunadigan) ───────

const SCHEMAS = {
  users: {
    icon: "👤",
    title: "Foydalanuvchilar",
    fields: [
      { key: "firstName", label: "Ism", type: "text" },
      { key: "lastName", label: "Familiya", type: "text" },
      { key: "phone", label: "Telefon raqam", type: "text" },
      { key: "email", label: "Email", type: "text" },
      {
        key: "role",
        label: "Roli",
        type: "select",
        options: [
          { value: "customer", label: "Mijoz" },
          { value: "farm-owner", label: "Ferma egasi" },
          { value: "driver", label: "Haydovchi" },
          { value: "admin", label: "Admin" },
          { value: "manager", label: "Menejer" },
          { value: "super-admin", label: "Super Admin" },
        ],
      },
      { key: "is_active", label: "Faolmi", type: "boolean" },
      { key: "bonus_balance", label: "Bonus ball", type: "number" },
      { key: "two_fa_enabled", label: "2FA yoqilganmi", type: "boolean" },
      { key: "created_at", label: "Ro'yxatdan o'tgan sana", type: "readonly" },
    ],
  },

  drivers: {
    icon: "🚚",
    title: "Haydovchilar",
    fields: [
      { key: "firstName", label: "Ism", type: "text" },
      { key: "lastName", label: "Familiya", type: "text" },
      { key: "phone", label: "Telefon", type: "text" },
      { key: "plateNumber", label: "Mashina raqami", type: "text" },
      { key: "capacity", label: "Yuk sig'imi (kg)", type: "number" },
      {
        key: "status",
        label: "Holati",
        type: "select",
        options: [
          { value: "PENDING", label: "Kutilmoqda" },
          { value: "APPROVED", label: "Tasdiqlangan" },
          { value: "REJECTED", label: "Rad etilgan" },
        ],
      },
      { key: "user_id", label: "Foydalanuvchi ID", type: "readonly" },
      { key: "created_at", label: "Yaratilgan sana", type: "readonly" },
    ],
  },

  farms: {
    icon: "🏡",
    title: "Fermalar",
    fields: [
      { key: "farmName", label: "Ferma nomi", type: "text" },
      { key: "farmAddress", label: "Manzil", type: "text" },
      { key: "phone", label: "Telefon", type: "text" },
      { key: "description", label: "Tavsif", type: "textarea" },
      { key: "rating", label: "Reytingi", type: "number" },
      { key: "rating_count", label: "Sharhlar soni", type: "number" },
      {
        key: "status",
        label: "Holati",
        type: "select",
        options: [
          { value: "PENDING", label: "Kutilmoqda" },
          { value: "APPROVED", label: "Tasdiqlangan" },
          { value: "REJECTED", label: "Rad etilgan" },
        ],
      },
      { key: "owner_id", label: "Egasi (foydalanuvchi ID)", type: "readonly" },
      { key: "created_at", label: "Yaratilgan sana", type: "readonly" },
    ],
  },

  orders: {
    icon: "📦",
    title: "Buyurtmalar",
    fields: [
      { key: "customer_name", label: "Mijoz ismi", type: "text" },
      { key: "total", label: "Jami summa (so'm)", type: "number" },
      {
        key: "status",
        label: "Holati",
        type: "select",
        options: [
          { value: "AWAITING_PAYMENT", label: "To'lov kutilmoqda" },
          { value: "PENDING", label: "Kutilmoqda" },
          { value: "CONFIRMED", label: "Tasdiqlandi" },
          { value: "DRIVER_ASSIGNED", label: "Haydovchi biriktirildi" },
          { value: "LOADING", label: "Yuklanmoqda" },
          { value: "IN_TRANSIT", label: "Yo'lda" },
          { value: "DELIVERED", label: "Yetkazildi" },
          { value: "CANCELLED", label: "Bekor qilindi" },
        ],
      },
      {
        key: "payment_method",
        label: "To'lov usuli",
        type: "select",
        options: [
          { value: "cash", label: "Naqt pul" },
          { value: "click", label: "Click" },
          { value: "payme", label: "Payme" },
        ],
      },
      { key: "paid", label: "To'langanmi", type: "boolean" },
      { key: "delivery_address", label: "Yetkazish manzili", type: "text" },
      { key: "tax_percent", label: "Soliq foizi", type: "number" },
      { key: "customer_id", label: "Mijoz ID", type: "readonly" },
      { key: "farm_id", label: "Ferma ID", type: "readonly" },
      { key: "driver_id", label: "Haydovchi ID", type: "readonly" },
      { key: "items", label: "Mahsulotlar", type: "readonly" },
      { key: "created_at", label: "Yaratilgan sana", type: "readonly" },
    ],
  },

  fish_products: {
    icon: "🐟",
    title: "Baliqlar",
    fields: [
      { key: "name", label: "Baliq nomi", type: "text" },
      { key: "category", label: "Kategoriya", type: "text" },
      { key: "price", label: "Narxi (so'm)", type: "number" },
      { key: "unit", label: "O'lchov birligi", type: "text" },
      { key: "stock", label: "Zaxira", type: "number" },
      { key: "description", label: "Tavsif", type: "textarea" },
      { key: "image_url", label: "Rasm havolasi", type: "text" },
      { key: "farm_rating", label: "Ferma reytingi", type: "readonly" },
      { key: "farm_id", label: "Ferma ID", type: "readonly" },
      { key: "deleted_at", label: "O'chirilganmi", type: "readonly" },
      { key: "created_at", label: "Qo'shilgan sana", type: "readonly" },
    ],
  },

  chat_messages: {
    icon: "💬",
    title: "Chat xabarlari",
    readonlyAll: true,
    fields: [
      { key: "sender_id", label: "Yuboruvchi ID", type: "readonly" },
      { key: "room_id", label: "Xona ID", type: "readonly" },
      { key: "text", label: "Xabar matni", type: "readonly" },
      { key: "created_at", label: "Yuborilgan sana", type: "readonly" },
    ],
  },

  chat_rooms: {
    icon: "🗂️",
    title: "Chat xonalari",
    readonlyAll: true,
    fields: [
      { key: "order_id", label: "Buyurtma ID", type: "readonly" },
      { key: "participants", label: "Ishtirokchilar", type: "readonly" },
      { key: "created_at", label: "Yaratilgan sana", type: "readonly" },
    ],
  },

  gps_tracks: {
    icon: "📍",
    title: "GPS izlari",
    readonlyAll: true,
    fields: [
      { key: "driver_id", label: "Haydovchi ID", type: "readonly" },
      { key: "lat", label: "Kenglik (lat)", type: "readonly" },
      { key: "lng", label: "Uzunlik (lng)", type: "readonly" },
      { key: "created_at", label: "Vaqt", type: "readonly" },
    ],
  },

  audit_logs: {
    icon: "📋",
    title: "Harakatlar tarixi",
    readonlyAll: true,
    fields: [
      { key: "action", label: "Amal", type: "readonly" },
      { key: "user_id", label: "Foydalanuvchi ID", type: "readonly" },
      { key: "details", label: "Tafsilotlar", type: "readonly" },
      { key: "created_at", label: "Vaqt", type: "readonly" },
    ],
  },

  telegram_links: {
    icon: "✈️",
    title: "Telegram ulanishlari",
    fields: [
      { key: "phone", label: "Telefon raqam", type: "text" },
      { key: "chat_id", label: "Telegram Chat ID", type: "readonly" },
      { key: "linked_at", label: "Ulangan sana", type: "readonly" },
    ],
  },

  otp_tokens: {
    icon: "🔑",
    title: "OTP kodlar",
    readonlyAll: true,
    fields: [
      { key: "user_id", label: "Foydalanuvchi ID", type: "readonly" },
      { key: "otp", label: "OTP kod", type: "readonly" },
      { key: "purpose", label: "Maqsadi", type: "readonly" },
      { key: "expires_at", label: "Muddati tugaydi", type: "readonly" },
    ],
  },

  settings: {
    icon: "⚙️",
    title: "Sozlamalar",
    fields: [
      { key: "key", label: "Sozlama nomi", type: "text" },
      { key: "tax_percent", label: "Soliq foizi (%)", type: "number" },
      { key: "click_balance", label: "Click balans", type: "number" },
      { key: "payme_balance", label: "Payme balans", type: "number" },
      { key: "net_profit", label: "Sof foyda", type: "number" },
    ],
  },

  finance_settings: {
    icon: "💰",
    title: "Moliya sozlamalari",
    fields: [
      { key: "tax_percent", label: "Soliq foizi (%)", type: "number" },
      { key: "click_balance", label: "Click balans (so'm)", type: "number" },
      { key: "payme_balance", label: "Payme balans (so'm)", type: "number" },
      { key: "net_profit", label: "Sof foyda (so'm)", type: "number" },
      { key: "click_api_key", label: "Click API key", type: "text" },
      { key: "payme_api_key", label: "Payme API key", type: "text" },
    ],
  },

  farm_balances: {
    icon: "🏦",
    title: "Ferma balanslari",
    fields: [
      { key: "farm_id", label: "Ferma ID", type: "readonly" },
      { key: "available_amount", label: "Mavjud summa (so'm)", type: "number" },
      { key: "pending_amount", label: "Kutilayotgan summa (so'm)", type: "number" },
      { key: "withdrawn_amount", label: "Yechilgan summa (so'm)", type: "number" },
    ],
  },

  withdraw_requests: {
    icon: "💸",
    title: "Pul chiqarish so'rovlari",
    fields: [
      { key: "farm_id", label: "Ferma ID", type: "readonly" },
      { key: "amount", label: "Summa (so'm)", type: "number" },
      { key: "card_number", label: "Karta raqami", type: "text" },
      { key: "card_holder", label: "Karta egasi", type: "text" },
      {
        key: "status",
        label: "Holati",
        type: "select",
        options: [
          { value: "PENDING", label: "Kutilmoqda" },
          { value: "PAID", label: "To'landi" },
        ],
      },
      { key: "created_at", label: "So'rov yuborilgan sana", type: "readonly" },
      { key: "paid_at", label: "To'langan sana", type: "readonly" },
    ],
  },

  fish_reviews: {
    icon: "⭐",
    title: "Baliq sharhlari",
    readonlyAll: true,
    fields: [
      { key: "fish_id", label: "Baliq ID", type: "readonly" },
      { key: "user_name", label: "Mijoz ismi", type: "readonly" },
      { key: "rating", label: "Reyting (1-5)", type: "readonly" },
      { key: "comment", label: "Izoh", type: "readonly" },
      { key: "created_at", label: "Sana", type: "readonly" },
    ],
  },

  telegram_payments: {
    icon: "💳",
    title: "Telegram to'lovlari",
    readonlyAll: true,
    fields: [
      { key: "order_id", label: "Buyurtma ID", type: "readonly" },
      { key: "provider", label: "Provider", type: "readonly" },
      { key: "amount", label: "Summa (so'm)", type: "readonly" },
      { key: "status", label: "Holati", type: "readonly" },
      { key: "created_at", label: "Sana", type: "readonly" },
    ],
  },

  finance_transactions: {
    icon: "📊",
    title: "Moliyaviy tranzaksiyalar",
    readonlyAll: true,
    fields: [
      { key: "type", label: "Turi", type: "readonly" },
      { key: "order_id", label: "Buyurtma ID", type: "readonly" },
      { key: "farm_name", label: "Ferma nomi", type: "readonly" },
      { key: "amount", label: "Summa (so'm)", type: "readonly" },
      { key: "tax_percent", label: "Soliq foizi", type: "readonly" },
      { key: "provider", label: "Provider", type: "readonly" },
      { key: "created_at", label: "Sana", type: "readonly" },
    ],
  },

  sessions: {
    icon: "💻",
    title: "Sessiyalar",
    readonlyAll: true,
    fields: [
      { key: "user_id", label: "Foydalanuvchi ID", type: "readonly" },
      { key: "device", label: "Qurilma", type: "readonly" },
      { key: "ip", label: "IP manzil", type: "readonly" },
      { key: "last_active", label: "Oxirgi faollik", type: "readonly" },
    ],
  },

  promos: {
    icon: "🏷️",
    title: "Promo-kodlar",
    fields: [
      { key: "code", label: "Promo-kod", type: "text" },
      { key: "discount_percent", label: "Chegirma (%)", type: "number" },
      { key: "max_uses", label: "Maksimal ishlatish soni", type: "number" },
      { key: "used_count", label: "Ishlatilgan soni", type: "readonly" },
      { key: "created_at", label: "Yaratilgan sana", type: "readonly" },
    ],
  },

  bonus_history: {
    icon: "🎁",
    title: "Bonus tarixi",
    readonlyAll: true,
    fields: [
      { key: "user_id", label: "Foydalanuvchi ID", type: "readonly" },
      { key: "amount", label: "Summa", type: "readonly" },
      { key: "type", label: "Turi", type: "readonly" },
      { key: "description", label: "Tavsif", type: "readonly" },
      { key: "created_at", label: "Sana", type: "readonly" },
    ],
  },

  farm_cards: {
    icon: "💳",
    title: "Ferma kartalari",
    fields: [
      { key: "farm_id", label: "Ferma ID", type: "readonly" },
      { key: "card_number", label: "Karta raqami", type: "text" },
      { key: "card_holder", label: "Karta egasi", type: "text" },
      { key: "updated_at", label: "Yangilangan sana", type: "readonly" },
    ],
  },
};

// Default schema - ro'yxatda yo'q kolleksiyalar uchun
const DEFAULT_SCHEMA = {
  icon: "📄",
  title: "Boshqa",
  fields: [],
};

export function getSchema(collectionName) {
  const schema = SCHEMAS[collectionName];
  if (schema) return schema;
  return { ...DEFAULT_SCHEMA, title: collectionName };
}
