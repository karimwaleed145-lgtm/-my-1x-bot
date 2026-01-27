import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 10000;

const token = '8051153052:AAH2kD20SdH48uKCPZqggk8_z6rfEO3nbCQ';
const bot = new TelegramBot(token, { polling: true });
const MY_ADMIN_ID = '7603957873';

// High-performance Map-based session tracking
const sessions = new Map<number, {
  lang: string;
  step: string;
  flowType?: 'fill_info' | 'link';
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    country?: string;
    promoCode?: string;
  };
}>();

// Complete translations for all 10 languages
const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: "🌍 *Welcome to 1XPartners!*\n\nChoose your language:",
    welcomeGreeting: "Welcome to 1xPartners, the world's leading affiliate program with over 15 years of market experience. Join 100,000+ partners and earn up to 40% RevShare with daily stats and weekly payouts. Choosing us is the right choice for your business growth.",
    mainMenu: "🌍 *Welcome to 1XPartners!*\n\nChoose an option:",
    becomePartner: "💎 Become a Partner",
    promoMarketing: "🛠 Promo & Marketing Materials",
    commissionPayouts: "💰 Commission & Payouts",
    downloadAndroid: "📱 Download Android App",
    premiumSupportCenter: "📞 Premium Support Center",
    promoMarketingDesc: "Access high-converting banners and unique promo codes to track players effortlessly.",
    registration: "📝 Registration",
    support: "🛠 Support",
    registerMenu: "Choose your registration method:",
    optionA: "Option A: Sign up by Link",
    optionAInstant: "🚀 Instant Activation (Via Link)",
    premiumManagedSetup: "👨‍💼 Premium Managed Setup",
    optionB: "Option B: Fill Info",
    shareContact: "📞 Share My Official Contact",
    linkFlowEmail: "To finalize your activation, please provide your Email address.",
    linkFlowPromo: "Enter your desired promo code (Latin letters/numbers, min 4 chars).",
    enterFullName: "Please enter your full name:",
    enterEmail: "Please enter your email:",
    enterPhone: "Please enter your phone number:",
    enterCountry: "Please enter your country:",
    enterPromoCode: "Please enter your desired promo code (Latin letters and numbers only, minimum 4 characters):",
    invalidPromoCode: "❌ Invalid promo code. Must be at least 4 characters, Latin letters and numbers only. Please try again:",
    invalidEmail: "❌ Invalid email format. Please try again:",
    thankYou: "✅ Thank you! Your registration has been submitted. We will contact you soon.",
    back: "🔙 Back",
    reviewTitle: "📋 Review your details",
    confirmDetails: "✅ Confirm Details",
    startOver: "❌ Start Over",
    verifyRegistrationDetails: "📝 Verify your registration details:",
    confirmActivation: "✅ Confirm Activation",
    cancelEdit: "❌ Cancel / Edit",
    activationSent: "🚀 Activation request sent to management.",
    activationCancelled: "❌ Activation cancelled.",
    typeCountry: "Please type your country name:",
    supportMenu: "Choose a support topic:",
    twoFactorAuth: "🔐 2-Factor Authentication (2FA)",
    withdrawCommission: "💰 Withdraw Commission",
    demoAccounts: "🎮 Demo Accounts",
    activate2FA: "Activate 2FA",
    deactivate2FA: "Deactivate 2FA",
    activate2FAInfo: "To activate 2FA, watch this video tutorial:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "To deactivate 2FA, please email Support@partners1xbet.com with:\n\n• Your Name and Surname\n• 3 pictures:\n  1) Front page of ID card / passport / driving license\n  2) Back page of ID card / passport / driving license\n  3) Selfie with the front page of ID card / passport / driving license",
    withdrawCommissionInfo: "📋 *Commission & Payout Rules*\n\n*Rule 1:* You must achieve a minimum of 15 registrations with deposits to unlock your first withdrawal.\n\n*Rule 2:* Your first 3 withdrawals will be processed exclusively to a brand-new 1xBet player account registered with your personal information.\n_Note: This player account is for commission receipt only; it requires no deposits or active betting._\n\n*Rule 3:* Minimum withdrawal amount is $30.",
    demoAccountsInfo: "🎮 *Demo Accounts*\n\nDemo accounts allow you to create content and show players how the platform works without using real money, significantly increasing your conversion rate.\n\n*Conditions to get demo accounts:*\n\n1️⃣ Must have *10 registrations with deposits*\n2️⃣ Must provide a *brand new 1XBet player ID* for the demo charge"
  },
  ru: {
    welcome: "🌍 *Добро пожаловать в 1XPartners!*\n\nВыберите язык:",
    welcomeGreeting: "Добро пожаловать в 1xPartners — ведущую партнёрскую программу мира с более чем 15-летним опытом на рынке. Присоединяйтесь к 100 000+ партнёров и получайте до 40% RevShare со ежедневной статистикой и еженедельными выплатами. Выбор нас — правильный выбор для роста вашего бизнеса.",
    mainMenu: "🌍 *Добро пожаловать в 1XPartners!*\n\nВыберите опцию:",
    becomePartner: "💎 Стать партнёром",
    promoMarketing: "🛠 Промо и маркетинг",
    commissionPayouts: "💰 Комиссии и выплаты",
    downloadAndroid: "📱 Скачать приложение Android",
    premiumSupportCenter: "📞 Premium-поддержка",
    promoMarketingDesc: "Доступ к высококонверсионным баннерам и уникальным промокодам для удобного отслеживания игроков.",
    registration: "📝 Регистрация",
    support: "🛠 Поддержка",
    registerMenu: "Выберите способ регистрации:",
    optionA: "Вариант A: Регистрация по ссылке",
    optionAInstant: "🚀 Мгновенная активация (по ссылке)",
    premiumManagedSetup: "👨‍💼 Premium-регистрация",
    optionB: "Вариант B: Заполнить информацию",
    shareContact: "📞 Поделиться моим контактом",
    linkFlowEmail: "Для завершения активации укажите ваш Email.",
    linkFlowPromo: "Введите желаемый промокод (латинские буквы/цифры, мин. 4 символа).",
    enterFullName: "Пожалуйста, введите ваше полное имя:",
    enterEmail: "Пожалуйста, введите ваш email:",
    enterPhone: "Пожалуйста, введите ваш номер телефона:",
    enterCountry: "Пожалуйста, введите вашу страну:",
    enterPromoCode: "Пожалуйста, введите желаемый промокод (только латинские буквы и цифры, минимум 4 символа):",
    invalidPromoCode: "❌ Неверный промокод. Должен быть минимум 4 символа, только латинские буквы и цифры. Попробуйте снова:",
    invalidEmail: "❌ Неверный формат email. Попробуйте снова:",
    thankYou: "✅ Спасибо! Ваша регистрация отправлена. Мы свяжемся с вами в ближайшее время.",
    back: "🔙 Назад",
    reviewTitle: "📋 Проверьте данные",
    confirmDetails: "✅ Подтвердить",
    startOver: "❌ Начать заново",
    verifyRegistrationDetails: "📝 Проверьте данные регистрации:",
    confirmActivation: "✅ Подтвердить активацию",
    cancelEdit: "❌ Отмена / Изменить",
    activationSent: "🚀 Запрос на активацию отправлен руководству.",
    activationCancelled: "❌ Активация отменена.",
    typeCountry: "Введите название страны:",
    supportMenu: "Выберите тему поддержки:",
    twoFactorAuth: "🔐 Двухфакторная аутентификация (2FA)",
    withdrawCommission: "💰 Вывести комиссию",
    demoAccounts: "🎮 Демо-счета",
    activate2FA: "Активировать 2FA",
    deactivate2FA: "Деактивировать 2FA",
    activate2FAInfo: "Для активации 2FA посмотрите это видео:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "Для деактивации 2FA отправьте письмо на Support@partners1xbet.com с:\n\n• Вашим именем и фамилией\n• 3 фотографиями:\n  1) Лицевая сторона удостоверения / паспорта / водительских прав\n  2) Обратная сторона удостоверения / паспорта / водительских прав\n  3) Селфи с лицевой стороной удостоверения / паспорта / водительских прав",
    withdrawCommissionInfo: "📋 *Правила комиссий и выплат*\n\n*Правило 1:* Для первой выплаты необходимо минимум 15 регистраций с депозитами.\n\n*Правило 2:* Первые 3 выплаты производятся только на новый игровой счёт 1xBet, зарегистрированный вашими данными.\n_Примечание: Этот счёт предназначен только для получения комиссии; депозиты и ставки не требуются._\n\n*Правило 3:* Минимальная сумма вывода — $30.",
    demoAccountsInfo: "🎮 *Демо-счета*\n\nДемо-счета позволяют создавать контент и показывать игрокам, как работает платформа, без использования реальных денег, значительно увеличивая конверсию.\n\n*Условия для получения демо-счетов:*\n\n1️⃣ Должно быть *10 регистраций с депозитами*\n2️⃣ Должен быть предоставлен *новый ID игрока 1XBet* для демо-заряда"
  },
  tr: {
    welcome: "🌍 *1XPartners'a Hoş Geldiniz!*\n\nDilinizi seçin:",
    welcomeGreeting: "1xPartners'a hoş geldiniz — 15 yılı aşkın pazar deneyimiyle dünyanın önde gelen affiliate programı. 100.000'den fazla ortak aramıza katılın ve günlük istatistikler ve haftalık ödemelerle %40'a kadar RevShare kazanın. Bizi seçmek işletmenizin büyümesi için doğru tercihtir.",
    mainMenu: "🌍 *1XPartners'a Hoş Geldiniz!*\n\nBir seçenek seçin:",
    becomePartner: "💎 Ortak Olun",
    promoMarketing: "🛠 Promosyon ve Pazarlama",
    commissionPayouts: "💰 Komisyon ve Ödemeler",
    downloadAndroid: "📱 Android Uygulaması İndir",
    premiumSupportCenter: "📞 Premium Destek",
    promoMarketingDesc: "Yüksek dönüşüm sağlayan afişler ve oyuncuları kolayca takip etmek için benzersiz promosyon kodlarına erişin.",
    registration: "📝 Kayıt",
    support: "🛠 Destek",
    registerMenu: "Kayıt yönteminizi seçin:",
    optionA: "Seçenek A: Bağlantı ile Kayıt Ol",
    optionAInstant: "🚀 Anında Aktivasyon (Bağlantı ile)",
    premiumManagedSetup: "👨‍💼 Premium Kayıt",
    optionB: "Seçenek B: Bilgi Doldur",
    shareContact: "📞 Resmi iletişimimi paylaş",
    linkFlowEmail: "Aktivasyonu tamamlamak için lütfen E-posta adresinizi girin.",
    linkFlowPromo: "İstediğiniz promosyon kodunu girin (Latin harfler/rakamlar, en az 4 karakter).",
    enterFullName: "Lütfen tam adınızı girin:",
    enterEmail: "Lütfen e-postanızı girin:",
    enterPhone: "Lütfen telefon numaranızı girin:",
    enterCountry: "Lütfen ülkenizi girin:",
    enterPromoCode: "Lütfen istediğiniz promosyon kodunu girin (sadece Latin harfleri ve rakamlar, minimum 4 karakter):",
    invalidPromoCode: "❌ Geçersiz promosyon kodu. Minimum 4 karakter, sadece Latin harfleri ve rakamlar olmalıdır. Lütfen tekrar deneyin:",
    invalidEmail: "❌ Geçersiz e-posta formatı. Lütfen tekrar deneyin:",
    thankYou: "✅ Teşekkürler! Kaydınız gönderildi. Yakında sizinle iletişime geçeceğiz.",
    back: "🔙 Geri",
    reviewTitle: "📋 Bilgilerinizi kontrol edin",
    confirmDetails: "✅ Onayla",
    startOver: "❌ Baştan başla",
    verifyRegistrationDetails: "📝 Kayıt bilgilerinizi doğrulayın:",
    confirmActivation: "✅ Aktivasyonu Onayla",
    cancelEdit: "❌ İptal / Düzenle",
    activationSent: "🚀 Aktivasyon talebi yönetime iletildi.",
    activationCancelled: "❌ Aktivasyon iptal edildi.",
    typeCountry: "Lütfen ülke adınızı yazın:",
    supportMenu: "Bir destek konusu seçin:",
    twoFactorAuth: "🔐 İki Faktörlü Kimlik Doğrulama (2FA)",
    withdrawCommission: "💰 Komisyon Çek",
    demoAccounts: "🎮 Demo Hesaplar",
    activate2FA: "2FA'yı Etkinleştir",
    deactivate2FA: "2FA'yı Devre Dışı Bırak",
    activate2FAInfo: "2FA'yı etkinleştirmek için bu videoyu izleyin:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "2FA'yı devre dışı bırakmak için Support@partners1xbet.com adresine şunlarla e-posta gönderin:\n\n• Adınız ve Soyadınız\n• 3 resim:\n  1) Kimlik kartı / pasaport / ehliyet ön sayfası\n  2) Kimlik kartı / pasaport / ehliyet arka sayfası\n  3) Kimlik kartı / pasaport / ehliyet ön sayfası ile selfie",
    withdrawCommissionInfo: "📋 *Komisyon ve ödeme kuralları*\n\n*Kural 1:* İlk çekim için minimum 15 yatırımlı kayıt gereklidir.\n\n*Kural 2:* İlk 3 çekim yalnızca sizin bilgilerinizle açılmış yeni bir 1xBet oyuncu hesabına yapılır.\n_Not: Bu hesap yalnızca komisyon alımı içindir; yatırım veya aktif bahis gerekmez._\n\n*Kural 3:* Minimum çekim tutarı $30'dır.",
    demoAccountsInfo: "🎮 *Demo Hesaplar*\n\nDemo hesaplar, gerçek para kullanmadan içerik oluşturmanıza ve oyunculara platformun nasıl çalıştığını göstermenize olanak tanır, dönüşüm oranınızı önemli ölçüde artırır.\n\n*Demo hesap alma koşulları:*\n\n1️⃣ *Yatırımlı 10 kayıt* olmalı\n2️⃣ Demo yüklemesi için *yeni bir 1XBet oyuncu ID'si* sağlanmalı"
  },
  es: {
    welcome: "🌍 *¡Bienvenido a 1XPartners!*\n\nElija su idioma:",
    welcomeGreeting: "Bienvenido a 1xPartners, el programa de afiliados líder mundial con más de 15 años de experiencia en el mercado. Únase a más de 100.000 socios y gane hasta 40% RevShare con estadísticas diarias y pagos semanales. Elegirnos es la elección correcta para el crecimiento de su negocio.",
    mainMenu: "🌍 *¡Bienvenido a 1XPartners!*\n\nElija una opción:",
    becomePartner: "💎 Ser socio",
    promoMarketing: "🛠 Promo y marketing",
    commissionPayouts: "💰 Comisión y pagos",
    downloadAndroid: "📱 Descargar app Android",
    premiumSupportCenter: "📞 Soporte Premium",
    promoMarketingDesc: "Acceda a banners de alta conversión y códigos promocionales únicos para seguir a los jugadores sin esfuerzo.",
    registration: "📝 Registro",
    support: "🛠 Soporte",
    registerMenu: "Elija su método de registro:",
    optionA: "Opción A: Registrarse por Enlace",
    optionAInstant: "🚀 Activación instantánea (por enlace)",
    premiumManagedSetup: "👨‍💼 Registro Premium",
    optionB: "Opción B: Completar Información",
    shareContact: "📞 Compartir mi contacto",
    linkFlowEmail: "Para finalizar su activación, proporcione su dirección de correo electrónico.",
    linkFlowPromo: "Introduzca su código promocional deseado (letras/números latinos, mín. 4 caracteres).",
    enterFullName: "Por favor ingrese su nombre completo:",
    enterEmail: "Por favor ingrese su correo electrónico:",
    enterPhone: "Por favor ingrese su número de teléfono:",
    enterCountry: "Por favor ingrese su país:",
    enterPromoCode: "Por favor ingrese su código promocional deseado (solo letras latinas y números, mínimo 4 caracteres):",
    invalidPromoCode: "❌ Código promocional inválido. Debe tener mínimo 4 caracteres, solo letras latinas y números. Por favor intente de nuevo:",
    invalidEmail: "❌ Formato de correo electrónico inválido. Por favor intente de nuevo:",
    thankYou: "✅ ¡Gracias! Su registro ha sido enviado. Nos pondremos en contacto pronto.",
    back: "🔙 Atrás",
    reviewTitle: "📋 Revise sus datos",
    confirmDetails: "✅ Confirmar datos",
    startOver: "❌ Empezar de nuevo",
    verifyRegistrationDetails: "📝 Verifique sus datos de registro:",
    confirmActivation: "✅ Confirmar activación",
    cancelEdit: "❌ Cancelar / Editar",
    activationSent: "🚀 Solicitud de activación enviada a gestión.",
    activationCancelled: "❌ Activación cancelada.",
    typeCountry: "Escriba el nombre de su país:",
    supportMenu: "Elija un tema de soporte:",
    twoFactorAuth: "🔐 Autenticación de Dos Factores (2FA)",
    withdrawCommission: "💰 Retirar Comisión",
    demoAccounts: "🎮 Cuentas Demo",
    activate2FA: "Activar 2FA",
    deactivate2FA: "Desactivar 2FA",
    activate2FAInfo: "Para activar 2FA, vea este video:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "Para desactivar 2FA, envíe un correo a Support@partners1xbet.com con:\n\n• Su Nombre y Apellido\n• 3 fotos:\n  1) Página frontal de tarjeta de identidad / pasaporte / licencia de conducir\n  2) Página trasera de tarjeta de identidad / pasaporte / licencia de conducir\n  3) Selfie con la página frontal de tarjeta de identidad / pasaporte / licencia de conducir",
    withdrawCommissionInfo: "📋 *Reglas de comisión y pagos*\n\n*Regla 1:* Debe alcanzar un mínimo de 15 registros con depósitos para desbloquear su primer retiro.\n\n*Regla 2:* Sus primeros 3 retiros se procesarán exclusivamente a una cuenta de jugador 1xBet nueva registrada con sus datos personales.\n_Nota: Esta cuenta es solo para recibir comisión; no requiere depósitos ni apuestas activas._\n\n*Regla 3:* El monto mínimo de retiro es $30.",
    demoAccountsInfo: "🎮 *Cuentas Demo*\n\nLas cuentas demo le permiten crear contenido y mostrar a los jugadores cómo funciona la plataforma sin usar dinero real, aumentando significativamente su tasa de conversión.\n\n*Condiciones para obtener cuentas demo:*\n\n1️⃣ Debe tener *10 registros con depósitos*\n2️⃣ Debe proporcionar un *nuevo ID de jugador 1XBet* para la carga demo"
  },
  pt: {
    welcome: "🌍 *Bem-vindo à 1XPartners!*\n\nEscolha seu idioma:",
    welcomeGreeting: "Bem-vindo à 1xPartners, o programa de afiliados líder mundial com mais de 15 anos de experiência de mercado. Junte-se a mais de 100.000 parceiros e ganhe até 40% RevShare com estatísticas diárias e pagamentos semanais. Escolher-nos é a escolha certa para o crescimento do seu negócio.",
    mainMenu: "🌍 *Bem-vindo à 1XPartners!*\n\nEscolha uma opção:",
    becomePartner: "💎 Ser parceiro",
    promoMarketing: "🛠 Promo e marketing",
    commissionPayouts: "💰 Comissão e pagamentos",
    downloadAndroid: "📱 Baixar app Android",
    premiumSupportCenter: "📞 Suporte Premium",
    promoMarketingDesc: "Acesse banners de alta conversão e códigos promocionais únicos para rastrear jogadores facilmente.",
    registration: "📝 Registro",
    support: "🛠 Suporte",
    registerMenu: "Escolha seu método de registro:",
    optionA: "Opção A: Inscrever-se por Link",
    optionAInstant: "🚀 Ativação instantânea (via link)",
    premiumManagedSetup: "👨‍💼 Cadastro Premium",
    optionB: "Opção B: Preencher Informações",
    shareContact: "📞 Compartilhar meu contacto",
    linkFlowEmail: "Para finalizar sua ativação, forneça seu endereço de email.",
    linkFlowPromo: "Digite seu código promocional desejado (letras/números latinos, mín. 4 caracteres).",
    enterFullName: "Por favor, insira seu nome completo:",
    enterEmail: "Por favor, insira seu email:",
    enterPhone: "Por favor, insira seu número de telefone:",
    enterCountry: "Por favor, insira seu país:",
    enterPromoCode: "Por favor, insira seu código promocional desejado (apenas letras latinas e números, mínimo 4 caracteres):",
    invalidPromoCode: "❌ Código promocional inválido. Deve ter mínimo 4 caracteres, apenas letras latinas e números. Por favor, tente novamente:",
    invalidEmail: "❌ Formato de email inválido. Por favor, tente novamente:",
    thankYou: "✅ Obrigado! Seu registro foi enviado. Entraremos em contato em breve.",
    back: "🔙 Voltar",
    reviewTitle: "📋 Revise seus dados",
    confirmDetails: "✅ Confirmar dados",
    startOver: "❌ Começar de novo",
    verifyRegistrationDetails: "📝 Verifique seus dados de registro:",
    confirmActivation: "✅ Confirmar ativação",
    cancelEdit: "❌ Cancelar / Editar",
    activationSent: "🚀 Pedido de ativação enviado à gestão.",
    activationCancelled: "❌ Ativação cancelada.",
    typeCountry: "Digite o nome do seu país:",
    supportMenu: "Escolha um tópico de suporte:",
    twoFactorAuth: "🔐 Autenticação de Dois Fatores (2FA)",
    withdrawCommission: "💰 Sacar Comissão",
    demoAccounts: "🎮 Contas Demo",
    activate2FA: "Ativar 2FA",
    deactivate2FA: "Desativar 2FA",
    activate2FAInfo: "Para ativar 2FA, assista a este vídeo:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "Para desativar 2FA, envie um email para Support@partners1xbet.com com:\n\n• Seu Nome e Sobrenome\n• 3 fotos:\n  1) Página frontal do cartão de identidade / passaporte / carteira de motorista\n  2) Página traseira do cartão de identidade / passaporte / carteira de motorista\n  3) Selfie com a página frontal do cartão de identidade / passaporte / carteira de motorista",
    withdrawCommissionInfo: "📋 *Regras de comissão e pagamentos*\n\n*Regra 1:* Você deve alcançar no mínimo 15 registros com depósitos para desbloquear seu primeiro saque.\n\n*Regra 2:* Seus primeiros 3 saques serão processados exclusivamente para uma conta de jogador 1xBet nova registrada com seus dados pessoais.\n_Nota: Esta conta é apenas para receber comissão; não requer depósitos ou apostas ativas._\n\n*Regra 3:* O valor mínimo de saque é $30.",
    demoAccountsInfo: "🎮 *Contas Demo*\n\nAs contas demo permitem criar conteúdo e mostrar aos jogadores como a plataforma funciona sem usar dinheiro real, aumentando significativamente sua taxa de conversão.\n\n*Condições para obter contas demo:*\n\n1️⃣ Deve ter *10 registros com depósitos*\n2️⃣ Deve fornecer um *novo ID de jogador 1XBet* para a carga demo"
  },
  fr: {
    welcome: "🌍 *Bienvenue chez 1XPartners!*\n\nChoisissez votre langue:",
    welcomeGreeting: "Bienvenue chez 1xPartners, le programme d'affiliation leader mondial avec plus de 15 ans d'expérience sur le marché. Rejoignez plus de 100 000 partenaires et gagnez jusqu'à 40 % RevShare avec des statistiques quotidiennes et des paiements hebdomadaires. Nous choisir est le bon choix pour la croissance de votre entreprise.",
    mainMenu: "🌍 *Bienvenue chez 1XPartners!*\n\nChoisissez une option:",
    becomePartner: "💎 Devenir partenaire",
    promoMarketing: "🛠 Promo et marketing",
    commissionPayouts: "💰 Commission et paiements",
    downloadAndroid: "📱 Télécharger l'app Android",
    premiumSupportCenter: "📞 Support Premium",
    promoMarketingDesc: "Accédez à des bannières à forte conversion et des codes promo uniques pour suivre les joueurs facilement.",
    registration: "📝 Inscription",
    support: "🛠 Support",
    registerMenu: "Choisissez votre méthode d'inscription:",
    optionA: "Option A: S'inscrire par Lien",
    optionAInstant: "🚀 Activation instantanée (via lien)",
    premiumManagedSetup: "👨‍💼 Inscription Premium",
    optionB: "Option B: Remplir les Informations",
    shareContact: "📞 Partager mon contact",
    linkFlowEmail: "Pour finaliser votre activation, veuillez fournir votre adresse email.",
    linkFlowPromo: "Entrez votre code promo souhaité (lettres/chiffres latins, min. 4 caractères).",
    enterFullName: "Veuillez entrer votre nom complet:",
    enterEmail: "Veuillez entrer votre email:",
    enterPhone: "Veuillez entrer votre numéro de téléphone:",
    enterCountry: "Veuillez entrer votre pays:",
    enterPromoCode: "Veuillez entrer votre code promo souhaité (lettres latines et chiffres uniquement, minimum 4 caractères):",
    invalidPromoCode: "❌ Code promo invalide. Doit contenir minimum 4 caractères, lettres latines et chiffres uniquement. Veuillez réessayer:",
    invalidEmail: "❌ Format d'email invalide. Veuillez réessayer:",
    thankYou: "✅ Merci! Votre inscription a été envoyée. Nous vous contacterons bientôt.",
    back: "🔙 Retour",
    reviewTitle: "📋 Vérifiez vos données",
    confirmDetails: "✅ Confirmer les données",
    startOver: "❌ Recommencer",
    verifyRegistrationDetails: "📝 Vérifiez vos données d'inscription:",
    confirmActivation: "✅ Confirmer l'activation",
    cancelEdit: "❌ Annuler / Modifier",
    activationSent: "🚀 Demande d'activation envoyée à la direction.",
    activationCancelled: "❌ Activation annulée.",
    typeCountry: "Veuillez saisir le nom de votre pays:",
    supportMenu: "Choisissez un sujet de support:",
    twoFactorAuth: "🔐 Authentification à Deux Facteurs (2FA)",
    withdrawCommission: "💰 Retirer la Commission",
    demoAccounts: "🎮 Comptes Demo",
    activate2FA: "Activer 2FA",
    deactivate2FA: "Désactiver 2FA",
    activate2FAInfo: "Pour activer 2FA, regardez cette vidéo:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "Pour désactiver 2FA, envoyez un email à Support@partners1xbet.com avec:\n\n• Votre Nom et Prénom\n• 3 photos:\n  1) Page avant de la carte d'identité / passeport / permis de conduire\n  2) Page arrière de la carte d'identité / passeport / permis de conduire\n  3) Selfie avec la page avant de la carte d'identité / passeport / permis de conduire",
    withdrawCommissionInfo: "📋 *Règles de commission et paiements*\n\n*Règle 1:* Vous devez atteindre au moins 15 inscriptions avec dépôts pour débloquer votre premier retrait.\n\n*Règle 2:* Vos 3 premiers retraits seront traités exclusivement sur un nouveau compte joueur 1xBet enregistré avec vos données personnelles.\n_Note : Ce compte est uniquement pour recevoir la commission ; aucun dépôt ni pari actif requis._\n\n*Règle 3:* Le montant minimum de retrait est de 30 $.",
    demoAccountsInfo: "🎮 *Comptes Demo*\n\nLes comptes demo vous permettent de créer du contenu et de montrer aux joueurs comment fonctionne la plateforme sans utiliser d'argent réel, augmentant considérablement votre taux de conversion.\n\n*Conditions pour obtenir des comptes demo:*\n\n1️⃣ Doit avoir *10 inscriptions avec dépôts*\n2️⃣ Doit fournir un *nouvel ID de joueur 1XBet* pour la charge demo"
  },
  hi: {
    welcome: "🌍 *1XPartners में आपका स्वागत है!*\n\nअपनी भाषा चुनें:",
    welcomeGreeting: "1xPartners में आपका स्वागत है, 15 से अधिक वर्षों के बाजार अनुभव के साथ दुनिया का अग्रणी एफिलिएट कार्यक्रम। 100,000 से अधिक पार्टनर से जुड़ें और दैनिक आंकड़ों और साप्ताहिक भुगतान के साथ 40% तक RevShare अर्जित करें। हमें चुनना आपके व्यवसाय विकास के लिए सही विकल्प है।",
    mainMenu: "🌍 *1XPartners में आपका स्वागत है!*\n\nएक विकल्प चुनें:",
    becomePartner: "💎 पार्टनर बनें",
    promoMarketing: "🛠 प्रोमो और मार्केटिंग",
    commissionPayouts: "💰 कमीशन और भुगतान",
    downloadAndroid: "📱 Android ऐप डाउनलोड करें",
    premiumSupportCenter: "📞 Premium सहायता",
    promoMarketingDesc: "उच्च रूपांतरण बैनर और अद्वितीय प्रोमो कोड तक पहुंचें ताकि खिलाड़ियों को आसानी से ट्रैक कर सकें।",
    registration: "📝 पंजीकरण",
    support: "🛠 सहायता",
    registerMenu: "अपना पंजीकरण विधि चुनें:",
    optionA: "विकल्प A: लिंक से साइन अप करें",
    optionAInstant: "🚀 तत्काल सक्रियण (लिंक के माध्यम से)",
    premiumManagedSetup: "👨‍💼 Premium पंजीकरण",
    optionB: "विकल्प B: जानकारी भरें",
    shareContact: "📞 मेरा संपर्क साझा करें",
    linkFlowEmail: "अपना सक्रियण पूरा करने के लिए कृपया अपना ईमेल पता प्रदान करें।",
    linkFlowPromo: "अपना वांछित प्रोमो कोड दर्ज करें (लैटिन अक्षर/संख्याएं, न्यूनतम 4 वर्ण)।",
    enterFullName: "कृपया अपना पूरा नाम दर्ज करें:",
    enterEmail: "कृपया अपना ईमेल दर्ज करें:",
    enterPhone: "कृपया अपना फोन नंबर दर्ज करें:",
    enterCountry: "कृपया अपना देश दर्ज करें:",
    enterPromoCode: "कृपया अपना वांछित प्रोमो कोड दर्ज करें (केवल लैटिन अक्षर और संख्याएं, न्यूनतम 4 वर्ण):",
    invalidPromoCode: "❌ अमान्य प्रोमो कोड। न्यूनतम 4 वर्ण, केवल लैटिन अक्षर और संख्याएं होनी चाहिए। कृपया पुनः प्रयास करें:",
    invalidEmail: "❌ अमान्य ईमेल प्रारूप। कृपया पुनः प्रयास करें:",
    thankYou: "✅ धन्यवाद! आपका पंजीकरण सबमिट किया गया है। हम जल्द ही संपर्क करेंगे।",
    back: "🔙 वापस",
    reviewTitle: "📋 अपना विवरण देखें",
    confirmDetails: "✅ विवरण की पुष्टि करें",
    startOver: "❌ फिर से शुरू करें",
    verifyRegistrationDetails: "📝 अपना पंजीकरण विवरण सत्यापित करें:",
    confirmActivation: "✅ सक्रियण की पुष्टि करें",
    cancelEdit: "❌ रद्द करें / संपादित करें",
    activationSent: "🚀 प्रबंधन को सक्रियण अनुरोध भेजा गया।",
    activationCancelled: "❌ सक्रियण रद्द।",
    typeCountry: "कृपया अपने देश का नाम टाइप करें:",
    supportMenu: "एक सहायता विषय चुनें:",
    twoFactorAuth: "🔐 दो-कारक प्रमाणीकरण (2FA)",
    withdrawCommission: "💰 कमीशन निकालें",
    demoAccounts: "🎮 डेमो खाते",
    activate2FA: "2FA सक्रिय करें",
    deactivate2FA: "2FA निष्क्रिय करें",
    activate2FAInfo: "2FA सक्रिय करने के लिए, यह वीडियो देखें:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "2FA निष्क्रिय करने के लिए, Support@partners1xbet.com पर ईमेल भेजें:\n\n• आपका नाम और उपनाम\n• 3 तस्वीरें:\n  1) आईडी कार्ड / पासपोर्ट / ड्राइविंग लाइसेंस का सामने का पृष्ठ\n  2) आईडी कार्ड / पासपोर्ट / ड्राइविंग लाइसेंस का पीछे का पृष्ठ\n  3) आईडी कार्ड / पासपोर्ट / ड्राइविंग लाइसेंस के सामने के पृष्ठ के साथ सेल्फी",
    withdrawCommissionInfo: "📋 *कमीशन और भुगतान नियम*\n\n*नियम 1:* अपना पहला निकासी अनलॉक करने के लिए न्यूनतम 15 जमा के साथ पंजीकरण आवश्यक है।\n\n*नियम 2:* आपके पहले 3 निकासी विशेष रूप से आपकी व्यक्तिगत जानकारी से पंजीकृत एक नए 1xBet खिलाड़ी खाते में किए जाएंगे।\n_नोट: यह खाता केवल कमीशन प्राप्ति के लिए है; जमा या सक्रिय बेटिंग की आवश्यकता नहीं है।_\n\n*नियम 3:* न्यूनतम निकासी राशि $30 है।",
    demoAccountsInfo: "🎮 *डेमो खाते*\n\nडेमो खाते आपको वास्तविक धन का उपयोग किए बिना सामग्री बनाने और खिलाड़ियों को दिखाने की अनुमति देते हैं कि प्लेटफॉर्म कैसे काम करता है, जिससे आपकी रूपांतरण दर में काफी वृद्धि होती है।\n\n*डेमो खाते प्राप्त करने की शर्तें:*\n\n1️⃣ *जमा के साथ 10 पंजीकरण* होना चाहिए\n2️⃣ डेमो चार्ज के लिए *एक नया 1XBet खिलाड़ी ID* प्रदान करना होगा"
  },
  br: {
    welcome: "🌍 *Bem-vindo à 1XPartners!*\n\nEscolha seu idioma:",
    welcomeGreeting: "Bem-vindo à 1xPartners, o programa de afiliados líder mundial com mais de 15 anos de experiência de mercado. Junte-se a mais de 100.000 parceiros e ganhe até 40% RevShare com estatísticas diárias e pagamentos semanais. Escolher-nos é a escolha certa para o crescimento do seu negócio.",
    mainMenu: "🌍 *Bem-vindo à 1XPartners!*\n\nEscolha uma opção:",
    becomePartner: "💎 Ser parceiro",
    promoMarketing: "🛠 Promo e marketing",
    commissionPayouts: "💰 Comissão e pagamentos",
    downloadAndroid: "📱 Baixar app Android",
    premiumSupportCenter: "📞 Suporte Premium",
    promoMarketingDesc: "Acesse banners de alta conversão e códigos promocionais únicos para rastrear jogadores facilmente.",
    registration: "📝 Registro",
    support: "🛠 Suporte",
    registerMenu: "Escolha seu método de registro:",
    optionA: "Opção A: Inscrever-se por Link",
    optionAInstant: "🚀 Ativação instantânea (via link)",
    premiumManagedSetup: "👨‍💼 Cadastro Premium",
    optionB: "Opção B: Preencher Informações",
    shareContact: "📞 Compartilhar meu contacto",
    linkFlowEmail: "Para finalizar sua ativação, forneça seu endereço de email.",
    linkFlowPromo: "Digite seu código promocional desejado (letras/números latinos, mín. 4 caracteres).",
    enterFullName: "Por favor, insira seu nome completo:",
    enterEmail: "Por favor, insira seu email:",
    enterPhone: "Por favor, insira seu número de telefone:",
    enterCountry: "Por favor, insira seu país:",
    enterPromoCode: "Por favor, insira seu código promocional desejado (apenas letras latinas e números, mínimo 4 caracteres):",
    invalidPromoCode: "❌ Código promocional inválido. Deve ter mínimo 4 caracteres, apenas letras latinas e números. Por favor, tente novamente:",
    invalidEmail: "❌ Formato de email inválido. Por favor, tente novamente:",
    thankYou: "✅ Obrigado! Seu registro foi enviado. Entraremos em contato em breve.",
    back: "🔙 Voltar",
    reviewTitle: "📋 Revise seus dados",
    confirmDetails: "✅ Confirmar dados",
    startOver: "❌ Começar de novo",
    verifyRegistrationDetails: "📝 Verifique seus dados de registro:",
    confirmActivation: "✅ Confirmar ativação",
    cancelEdit: "❌ Cancelar / Editar",
    activationSent: "🚀 Pedido de ativação enviado à gestão.",
    activationCancelled: "❌ Ativação cancelada.",
    typeCountry: "Digite o nome do seu país:",
    supportMenu: "Escolha um tópico de suporte:",
    twoFactorAuth: "🔐 Autenticação de Dois Fatores (2FA)",
    withdrawCommission: "💰 Sacar Comissão",
    demoAccounts: "🎮 Contas Demo",
    activate2FA: "Ativar 2FA",
    deactivate2FA: "Desativar 2FA",
    activate2FAInfo: "Para ativar 2FA, assista a este vídeo:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "Para desativar 2FA, envie um email para Support@partners1xbet.com com:\n\n• Seu Nome e Sobrenome\n• 3 fotos:\n  1) Página frontal do cartão de identidade / passaporte / carteira de motorista\n  2) Página traseira do cartão de identidade / passaporte / carteira de motorista\n  3) Selfie com a página frontal do cartão de identidade / passaporte / carteira de motorista",
    withdrawCommissionInfo: "📋 *Regras de comissão e pagamentos*\n\n*Regra 1:* Você deve alcançar no mínimo 15 registros com depósitos para desbloquear seu primeiro saque.\n\n*Regra 2:* Seus primeiros 3 saques serão processados exclusivamente para uma conta de jogador 1xBet nova registrada com seus dados pessoais.\n_Nota: Esta conta é apenas para receber comissão; não requer depósitos ou apostas ativas._\n\n*Regra 3:* O valor mínimo de saque é $30.",
    demoAccountsInfo: "🎮 *Contas Demo*\n\nAs contas demo permitem criar conteúdo e mostrar aos jogadores como a plataforma funciona sem usar dinheiro real, aumentando significativamente sua taxa de conversão.\n\n*Condições para obter contas demo:*\n\n1️⃣ Deve ter *10 registros com depósitos*\n2️⃣ Deve fornecer um *novo ID de jogador 1XBet* para a carga demo"
  },
  vi: {
    welcome: "🌍 *Chào mừng đến với 1XPartners!*\n\nChọn ngôn ngữ của bạn:",
    welcomeGreeting: "Chào mừng đến với 1xPartners, chương trình affiliate hàng đầu thế giới với hơn 15 năm kinh nghiệm thị trường. Tham gia hơn 100.000 đối tác và kiếm tới 40% RevShare với thống kê hàng ngày và thanh toán hàng tuần. Chọn chúng tôi là lựa chọn đúng đắn cho sự phát triển doanh nghiệp của bạn.",
    mainMenu: "🌍 *Chào mừng đến với 1XPartners!*\n\nChọn một tùy chọn:",
    becomePartner: "💎 Trở thành đối tác",
    promoMarketing: "🛠 Khuyến mãi & marketing",
    commissionPayouts: "💰 Hoa hồng & thanh toán",
    downloadAndroid: "📱 Tải app Android",
    premiumSupportCenter: "📞 Hỗ trợ Premium",
    promoMarketingDesc: "Truy cập banner chuyển đổi cao và mã khuyến mãi độc quyền để theo dõi người chơi dễ dàng.",
    registration: "📝 Đăng Ký",
    support: "🛠 Hỗ Trợ",
    registerMenu: "Chọn phương thức đăng ký:",
    optionA: "Tùy chọn A: Đăng Ký qua Liên Kết",
    optionAInstant: "🚀 Kích hoạt ngay (qua liên kết)",
    premiumManagedSetup: "👨‍💼 Đăng ký Premium",
    optionB: "Tùy chọn B: Điền Thông Tin",
    shareContact: "📞 Chia sẻ liên hệ của tôi",
    linkFlowEmail: "Để hoàn tất kích hoạt, vui lòng cung cấp địa chỉ email của bạn.",
    linkFlowPromo: "Nhập mã khuyến mãi mong muốn (chữ Latin/số, tối thiểu 4 ký tự).",
    enterFullName: "Vui lòng nhập họ tên đầy đủ của bạn:",
    enterEmail: "Vui lòng nhập email của bạn:",
    enterPhone: "Vui lòng nhập số điện thoại của bạn:",
    enterCountry: "Vui lòng nhập quốc gia của bạn:",
    enterPromoCode: "Vui lòng nhập mã khuyến mãi mong muốn (chỉ chữ cái Latin và số, tối thiểu 4 ký tự):",
    invalidPromoCode: "❌ Mã khuyến mãi không hợp lệ. Phải có tối thiểu 4 ký tự, chỉ chữ cái Latin và số. Vui lòng thử lại:",
    invalidEmail: "❌ Định dạng email không hợp lệ. Vui lòng thử lại:",
    thankYou: "✅ Cảm ơn! Đăng ký của bạn đã được gửi. Chúng tôi sẽ liên hệ sớm.",
    back: "🔙 Quay lại",
    reviewTitle: "📋 Xem lại thông tin của bạn",
    confirmDetails: "✅ Xác nhận thông tin",
    startOver: "❌ Bắt đầu lại",
    verifyRegistrationDetails: "📝 Xác minh thông tin đăng ký của bạn:",
    confirmActivation: "✅ Xác nhận kích hoạt",
    cancelEdit: "❌ Hủy / Chỉnh sửa",
    activationSent: "🚀 Yêu cầu kích hoạt đã gửi đến quản lý.",
    activationCancelled: "❌ Đã hủy kích hoạt.",
    typeCountry: "Vui lòng nhập tên quốc gia của bạn:",
    supportMenu: "Chọn chủ đề hỗ trợ:",
    twoFactorAuth: "🔐 Xác Thực Hai Yếu Tố (2FA)",
    withdrawCommission: "💰 Rút Hoa Hồng",
    demoAccounts: "🎮 Tài Khoản Demo",
    activate2FA: "Kích Hoạt 2FA",
    deactivate2FA: "Vô Hiệu Hóa 2FA",
    activate2FAInfo: "Để kích hoạt 2FA, xem video này:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "Để vô hiệu hóa 2FA, gửi email đến Support@partners1xbet.com với:\n\n• Tên và Họ của bạn\n• 3 hình ảnh:\n  1) Mặt trước thẻ căn cước / hộ chiếu / bằng lái xe\n  2) Mặt sau thẻ căn cước / hộ chiếu / bằng lái xe\n  3) Selfie với mặt trước thẻ căn cước / hộ chiếu / bằng lái xe",
    withdrawCommissionInfo: "📋 *Quy tắc hoa hồng và thanh toán*\n\n*Quy tắc 1:* Bạn phải đạt tối thiểu 15 đăng ký có tiền gửi để mở khóa lần rút đầu tiên.\n\n*Quy tắc 2:* 3 lần rút đầu tiên sẽ được xử lý độc quyền vào tài khoản người chơi 1xBet mới đăng ký bằng thông tin cá nhân của bạn.\n_Ghi chú: Tài khoản này chỉ dùng để nhận hoa hồng; không yêu cầu nạp tiền hay cá cược._\n\n*Quy tắc 3:* Số tiền rút tối thiểu là $30.",
    demoAccountsInfo: "🎮 *Tài Khoản Demo*\n\nTài khoản demo cho phép bạn tạo nội dung và cho người chơi thấy cách nền tảng hoạt động mà không cần sử dụng tiền thật, làm tăng đáng kể tỷ lệ chuyển đổi của bạn.\n\n*Điều kiện để có tài khoản demo:*\n\n1️⃣ Phải có *10 đăng ký có tiền gửi*\n2️⃣ Phải cung cấp *ID người chơi 1XBet mới* để nạp demo"
  },
  kz: {
    welcome: "🌍 *1XPartners-қа қош келдіңіз!*\n\nТіліңізді таңдаңыз:",
    welcomeGreeting: "1xPartners-қа қош келдіңіз — 15 жылдан астам нарықтық тәжірибесі бар әлемдік көшбасшы партнерлік бағдарлама. 100.000-нан астам серіктестер қатарына қосылыңыз және күнделікті статистика мен апталық төлемдермен 40% дейін RevShare алыңыз. Бізді таңдау сіздің бизнесіңіздің өсуі үшін дұрыс таңдау.",
    mainMenu: "🌍 *1XPartners-қа қош келдіңіз!*\n\nОпция таңдаңыз:",
    becomePartner: "💎 Серіктес болу",
    promoMarketing: "🛠 Промо және маркетинг",
    commissionPayouts: "💰 Комиссия және төлемдер",
    downloadAndroid: "📱 Android қолданбасын жүктеу",
    premiumSupportCenter: "📞 Premium қолдау",
    promoMarketingDesc: "Ойыншыларды оңай қадағалау үшін жоғары конверсиялы баннерлер мен бірегей промокодтарға қол жеткізіңіз.",
    registration: "📝 Тіркелу",
    support: "🛠 Қолдау",
    registerMenu: "Тіркелу әдісін таңдаңыз:",
    optionA: "Нұсқа A: Сілтеме арқылы Тіркелу",
    optionAInstant: "🚀 Лезде белсендіру (сілтеме арқылы)",
    premiumManagedSetup: "👨‍💼 Premium тіркелу",
    optionB: "Нұсқа B: Ақпаратты Толтыру",
    shareContact: "📞 Байланысымды бөлісу",
    linkFlowEmail: "Белсендіруді аяқтау үшін электрондық поштаңызды көрсетіңіз.",
    linkFlowPromo: "Қалаған промокодыңызды енгізіңіз (латын әріптері/сандар, кем дегенде 4 таңба).",
    enterFullName: "Толық атыңызды енгізіңіз:",
    enterEmail: "Электрондық поштаңызды енгізіңіз:",
    enterPhone: "Телефон нөміріңізді енгізіңіз:",
    enterCountry: "Еліңізді енгізіңіз:",
    enterPromoCode: "Қалаған промокодыңызды енгізіңіз (тек латын әріптері мен сандар, ең аз 4 таңба):",
    invalidPromoCode: "❌ Жарамсыз промокод. Ең аз 4 таңба, тек латын әріптері мен сандар болуы керек. Қайталап көріңіз:",
    invalidEmail: "❌ Жарамсыз электрондық пошта форматы. Қайталап көріңіз:",
    thankYou: "✅ Рахмет! Тіркелуіңіз жіберілді. Жақында байланысамыз.",
    back: "🔙 Артқа",
    reviewTitle: "📋 Деректеріңізді тексеріңіз",
    confirmDetails: "✅ Растау",
    startOver: "❌ Қайта бастау",
    verifyRegistrationDetails: "📝 Тіркелу деректерін тексеріңіз:",
    confirmActivation: "✅ Белсендіруді растау",
    cancelEdit: "❌ Болдырмау / Өңдеу",
    activationSent: "🚀 Белсендіру сұранысы басшылыққа жіберілді.",
    activationCancelled: "❌ Белсендіру болдырылмады.",
    typeCountry: "Еліңіздің атын енгізіңіз:",
    supportMenu: "Қолдау тақырыбын таңдаңыз:",
    twoFactorAuth: "🔐 Екі Факторлы Аутентификация (2FA)",
    withdrawCommission: "💰 Комиссияны Алу",
    demoAccounts: "🎮 Демо Есептер",
    activate2FA: "2FA-ны Іске Қосу",
    deactivate2FA: "2FA-ны Өшіру",
    activate2FAInfo: "2FA-ны іске қосу үшін мына бейнені көріңіз:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "2FA-ны өшіру үшін Support@partners1xbet.com-ға мынамен хабарласыңыз:\n\n• Атыңыз бен Тегіңіз\n• 3 сурет:\n  1) Жеке куәлік / паспорт / жүргізуші куәлігінің алдыңғы беті\n  2) Жеке куәлік / паспорт / жүргізуші куәлігінің артқы беті\n  3) Жеке куәлік / паспорт / жүргізуші куәлігінің алдыңғы бетімен селфи",
    withdrawCommissionInfo: "📋 *Комиссия және төлем ережелері*\n\n*Ереже 1:* Алғашқы төлембен шығару үшін кем дегенде 15 депозитті тіркелу қажет.\n\n*Ереже 2:* Алғашқы 3 төлембен шығару жеке деректеріңізбен тіркелген жаңа 1xBet ойыншы тегіне ғана жасалады.\n_Ескерту: Бұл тегі комиссия қабылдау үшін; депозит немесе белсенді ставка қажет емес._\n\n*Ереже 3:* Ең аз төлембен шығару сомасы $30.",
    demoAccountsInfo: "🎮 *Демо Есептер*\n\nДемо есептер нақты ақша пайдаланбай контент жасауға және ойыншыларға платформаның қалай жұмыс істейтінін көрсетуге мүмкіндік береді, конверсия жылдамдығыңызды айтарлықтай арттырады.\n\n*Демо есеп алу шарттары:*\n\n1️⃣ *Депозиттері бар 10 тіркелу* болуы керек\n2️⃣ Демо заряд үшін *жаңа 1XBet ойыншы ID-сы* беру керек"
  },
  ar: {
    welcome: "🌍 *مرحباً بك في 1XPartners!*\n\nاختر لغتك:",
    welcomeGreeting: "مرحباً بك في 1xPartners، برنامج الإحالة الرائد في العالم مع أكثر من 15 عاماً من الخبرة في السوق. انضم إلى أكثر من 100,000 شريك واحصل على ما يصل إلى 40٪ RevShare مع إحصائيات يومية ومدفوعات أسبوعية. اختيارنا هو الخيار الصحيح لنمو عملك.",
    mainMenu: "🌍 *مرحباً بك في 1XPartners!*\n\nاختر خياراً:",
    becomePartner: "💎 كن شريكاً",
    promoMarketing: "🛠 العروض والمواد التسويقية",
    commissionPayouts: "💰 العمولات والمدفوعات",
    downloadAndroid: "📱 تحميل تطبيق أندرويد",
    premiumSupportCenter: "📞 مركز الدعم Premium",
    promoMarketingDesc: "الوصول إلى بانرات عالية التحويل ورموز ترويجية فريدة لتتبع اللاعبين بسهولة.",
    registration: "📝 التسجيل",
    support: "🛠 الدعم",
    registerMenu: "اختر طريقة التسجيل:",
    optionA: "الخيار أ: التسجيل عبر الرابط",
    optionAInstant: "🚀 التفعيل الفوري (عبر الرابط)",
    premiumManagedSetup: "👨‍💼 التسجيل Premium",
    optionB: "الخيار ب: ملء المعلومات",
    shareContact: "📞 مشاركة رقمي الرسمي",
    linkFlowEmail: "لإتمام التفعيل، يرجى تقديم عنوان بريدك الإلكتروني.",
    linkFlowPromo: "أدخل رمز الترويج المطلوب (أحرف لاتينية/أرقام، 4 أحرف كحد أدنى).",
    enterFullName: "الرجاء إدخال الاسم الكامل:",
    enterEmail: "الرجاء إدخال البريد الإلكتروني:",
    enterPhone: "الرجاء إدخال رقم الهاتف:",
    enterCountry: "الرجاء إدخال البلد:",
    enterPromoCode: "الرجاء إدخال رمز الترويج المطلوب (أحرف لاتينية وأرقام فقط، 4 أحرف على الأقل):",
    invalidPromoCode: "❌ رمز الترويج غير صحيح. يجب أن يكون 4 أحرف على الأقل، أحرف لاتينية وأرقام فقط. الرجاء المحاولة مرة أخرى:",
    invalidEmail: "❌ تنسيق البريد الإلكتروني غير صحيح. الرجاء المحاولة مرة أخرى:",
    thankYou: "✅ شكراً لك! تم إرسال تسجيلك. سنتواصل معك قريباً.",
    back: "🔙 رجوع",
    reviewTitle: "📋 راجع بياناتك",
    confirmDetails: "✅ تأكيد البيانات",
    startOver: "❌ البدء من جديد",
    verifyRegistrationDetails: "📝 تحقق من تفاصيل التسجيل:",
    confirmActivation: "✅ تأكيد التفعيل",
    cancelEdit: "❌ إلغاء / تعديل",
    activationSent: "🚀 تم إرسال طلب التفعيل إلى الإدارة.",
    activationCancelled: "❌ تم إلغاء التفعيل.",
    typeCountry: "يرجى كتابة اسم بلدك:",
    supportMenu: "اختر موضوع الدعم:",
    twoFactorAuth: "🔐 المصادقة الثنائية (2FA)",
    withdrawCommission: "💰 سحب العمولة",
    demoAccounts: "🎮 الحسابات التجريبية",
    activate2FA: "تفعيل 2FA",
    deactivate2FA: "إلغاء تفعيل 2FA",
    activate2FAInfo: "لتفعيل 2FA، شاهد هذا الفيديو:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "لإلغاء تفعيل 2FA، أرسل بريداً إلكترونياً إلى Support@partners1xbet.com مع:\n\n• اسمك واسم العائلة\n• 3 صور:\n  1) الصفحة الأمامية من بطاقة الهوية / جواز السفر / رخصة القيادة\n  2) الصفحة الخلفية من بطاقة الهوية / جواز السفر / رخصة القيادة\n  3) صورة شخصية مع الصفحة الأمامية من بطاقة الهوية / جواز السفر / رخصة القيادة",
    withdrawCommissionInfo: "📋 *قواعد العمولة والمدفوعات*\n\n*القاعدة 1:* يجب تحقيق الحد الأدنى 15 تسجيل مع إيداعات لفتح أول سحب.\n\n*القاعدة 2:* أول 3 عمليات سحب تتم حصرياً إلى حساب لاعب 1xBet جديد مسجل ببياناتك الشخصية.\n_ملاحظة: هذا الحساب لاستلام العمولة فقط؛ لا يتطلب إيداعات أو مراهنات._\n\n*القاعدة 3:* الحد الأدنى للسحب 30 دولاراً.",
    demoAccountsInfo: "🎮 *الحسابات التجريبية*\n\nتسمح لك الحسابات التجريبية بإنشاء محتوى وإظهار كيفية عمل المنصة للاعبين دون استخدام أموال حقيقية، مما يزيد بشكل كبير من معدل التحويل.\n\n*شروط الحصول على حسابات تجريبية:*\n\n1️⃣ يجب أن يكون لديك *10 تسجيلات مع إيداعات*\n2️⃣ يجب تقديم *معرف لاعب 1XBet جديد* لشحن الحساب التجريبي"
  },
  uz: {
    welcome: "🌍 *1XPartners-ga xush kelibsiz!*\n\nTilingizni tanlang:",
    welcomeGreeting: "1xPartners-ga xush kelibsiz — 15 yildan ortiq bozor tajribasiga ega dunyoning yetakchi affiliate dasturi. 100.000 dan ortiq sheriklar qatoriga qo'shiling va kunlik statistikalar va haftalik to'lovlar bilan 40% gacha RevShare oling. Bizni tanlash sizning biznesingiz o'sishi uchun to'g'ri tanlov.",
    mainMenu: "🌍 *1XPartners-ga xush kelibsiz!*\n\nVariantni tanlang:",
    becomePartner: "💎 Sherik bo'lish",
    promoMarketing: "🛠 Promo va marketing",
    commissionPayouts: "💰 Komissiya va to'lovlar",
    downloadAndroid: "📱 Android ilovani yuklash",
    premiumSupportCenter: "📞 Premium qo'llab-quvvatlash",
    promoMarketingDesc: "O'yinchilarni oson kuzatish uchun yuqori konversiyali bannerlar va noyob promo kodlarga kirish.",
    registration: "📝 Ro'yxatdan o'tish",
    support: "🛠 Yordam",
    registerMenu: "Ro'yxatdan o'tish usulini tanlang:",
    optionA: "Variant A: Havola orqali ro'yxatdan o'tish",
    optionAInstant: "🚀 Tezkor aktivatsiya (havola orqali)",
    premiumManagedSetup: "👨‍💼 Premium ro'yxatdan o'tish",
    optionB: "Variant B: Ma'lumotlarni to'ldirish",
    shareContact: "📞 Raqamimni ulashish",
    linkFlowEmail: "Aktivatsiyani yakunlash uchun elektron pochtangizni kiriting.",
    linkFlowPromo: "Istagan promo kodingizni kiriting (lotin harflar/raqamlar, kamida 4 belgi).",
    enterFullName: "Iltimos, to'liq ismingizni kiriting:",
    enterEmail: "Iltimos, emailingizni kiriting:",
    enterPhone: "Iltimos, telefon raqamingizni kiriting:",
    enterCountry: "Iltimos, mamlakatni kiriting:",
    enterPromoCode: "Iltimos, istagan promo kodingizni kiriting (faqat lotin harflari va raqamlar, kamida 4 belgi):",
    invalidPromoCode: "❌ Noto'g'ri promo kod. Kamida 4 belgi, faqat lotin harflari va raqamlar bo'lishi kerak. Iltimos, qayta urinib ko'ring:",
    invalidEmail: "❌ Noto'g'ri email formati. Iltimos, qayta urinib ko'ring:",
    thankYou: "✅ Rahmat! Ro'yxatdan o'tishingiz yuborildi. Tez orada siz bilan bog'lanamiz.",
    back: "🔙 Orqaga",
    reviewTitle: "📋 Ma'lumotlaringizni tekshiring",
    confirmDetails: "✅ Tasdiqlash",
    startOver: "❌ Qaytadan boshlash",
    verifyRegistrationDetails: "📝 Ro'yxatdan o'tish ma'lumotlarini tekshiring:",
    confirmActivation: "✅ Faollashtirishni tasdiqlash",
    cancelEdit: "❌ Bekor qilish / Tahrirlash",
    activationSent: "🚀 Faollashtirish so'rovi boshqarmaga yuborildi.",
    activationCancelled: "❌ Faollashtirish bekor qilindi.",
    typeCountry: "Mamlakat nomingizni kiriting:",
    supportMenu: "Yordam mavzusini tanlang:",
    twoFactorAuth: "🔐 Ikki Faktorli Autentifikatsiya (2FA)",
    withdrawCommission: "💰 Komissiyani Yechib Olish",
    demoAccounts: "🎮 Demo Hisoblar",
    activate2FA: "2FA-ni Faollashtirish",
    deactivate2FA: "2FA-ni O'chirish",
    activate2FAInfo: "2FA-ni faollashtirish uchun ushbu videoni tomosha qiling:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "2FA-ni o'chirish uchun Support@partners1xbet.com ga quyidagilar bilan xabar yuboring:\n\n• Ismingiz va Familiyangiz\n• 3 ta rasm:\n  1) ID karta / pasport / haydovchilik guvohnomasining old tomoni\n  2) ID karta / pasport / haydovchilik guvohnomasining orqa tomoni\n  3) ID karta / pasport / haydovchilik guvohnomasining old tomoni bilan selfie",
    withdrawCommissionInfo: "📋 *Komissiya va to'lov qoidalari*\n\n*Qoida 1:* Birinchi yechib olish uchun kamida 15 ta depozitli ro'yxatdan o'tish talab qilinadi.\n\n*Qoida 2:* Ilk 3 marta yechib olish shaxsiy ma'lumotlaringiz bilan ro'yxatdan o'tkazilgan yangi 1xBet o'yinchi hisobiga amalga oshiriladi.\n_Eslatma: Bu hisob faqat komissiya olish uchun; depozit yoki faol tikish shart emas._\n\n*Qoida 3:* Minimal yechib olish summasi $30.",
    demoAccountsInfo: "🎮 *Demo Hisoblar*\n\nDemo hisoblar haqiqiy pul ishlatmasdan kontent yaratishga va o'yinchilarga platformaning qanday ishlashini ko'rsatishga imkon beradi, konversiya darajasini sezilarli darajada oshiradi.\n\n*Demo hisob olish shartlari:*\n\n1️⃣ *Depozitlar bilan 10 ta ro'yxatdan o'tish* bo'lishi kerak\n2️⃣ Demo zaryad uchun *yangi 1XBet o'yinchi ID si* taqdim etilishi kerak"
  },
  zh: {
    welcome: "🌍 *欢迎来到 1XPartners!*\n\n选择您的语言:",
    welcomeGreeting: "欢迎来到1xPartners，拥有超过15年市场经验的全球领先联盟计划。加入100,000多名合作伙伴，享受每日统计和每周支付，赚取高达40%的RevShare。选择我们是为您的业务增长做出的正确选择。",
    mainMenu: "🌍 *欢迎来到 1XPartners!*\n\n选择一个选项:",
    becomePartner: "💎 成为合作伙伴",
    promoMarketing: "🛠 促销与营销素材",
    commissionPayouts: "💰 佣金与支付",
    downloadAndroid: "📱 下载 Android 应用",
    premiumSupportCenter: "📞 Premium 支持中心",
    promoMarketingDesc: "获取高转化率横幅和独特促销代码，轻松追踪玩家。",
    registration: "📝 注册",
    support: "🛠 支持",
    registerMenu: "选择您的注册方式:",
    optionA: "选项 A: 通过链接注册",
    optionAInstant: "🚀 即时激活（通过链接）",
    premiumManagedSetup: "👨‍💼 Premium 注册",
    optionB: "选项 B: 填写信息",
    shareContact: "📞 分享我的联系方式",
    linkFlowEmail: "为完成激活，请提供您的电子邮件地址。",
    linkFlowPromo: "输入您想要的促销代码（拉丁字母/数字，至少4个字符）。",
    enterFullName: "请输入您的全名:",
    enterEmail: "请输入您的电子邮件:",
    enterPhone: "请输入您的电话号码:",
    enterCountry: "请输入您的国家:",
    enterPromoCode: "请输入您想要的促销代码（仅拉丁字母和数字，最少4个字符）:",
    invalidPromoCode: "❌ 无效的促销代码。必须至少4个字符，仅拉丁字母和数字。请重试:",
    invalidEmail: "❌ 无效的电子邮件格式。请重试:",
    thankYou: "✅ 谢谢！您的注册已提交。我们会尽快与您联系。",
    back: "🔙 返回",
    reviewTitle: "📋 请核对您的信息",
    confirmDetails: "✅ 确认信息",
    startOver: "❌ 重新开始",
    verifyRegistrationDetails: "📝 请核验您的注册信息：",
    confirmActivation: "✅ 确认激活",
    cancelEdit: "❌ 取消 / 编辑",
    activationSent: "🚀 激活请求已提交至管理。",
    activationCancelled: "❌ 激活已取消。",
    typeCountry: "请输入您的国家名称：",
    supportMenu: "选择一个支持主题:",
    twoFactorAuth: "🔐 双因素身份验证 (2FA)",
    withdrawCommission: "💰 提取佣金",
    demoAccounts: "🎮 演示账户",
    activate2FA: "激活 2FA",
    deactivate2FA: "停用 2FA",
    activate2FAInfo: "要激活 2FA，请观看此视频:\n\nhttps://www.youtube.com/watch?v=Y3eNZLaMUo8",
    deactivate2FAInfo: "要停用 2FA，请发送电子邮件至 Support@partners1xbet.com，包含:\n\n• 您的姓名和姓氏\n• 3张照片:\n  1) 身份证/护照/驾驶执照的正面\n  2) 身份证/护照/驾驶执照的背面\n  3) 与身份证/护照/驾驶执照正面的自拍",
    withdrawCommissionInfo: "📋 *佣金与支付规则*\n\n*规则 1:* 您必须达到至少 15 个带存款的注册才能解锁首次提款。\n\n*规则 2:* 您的前 3 次提款将仅会转入以您个人信息注册的全新 1xBet 玩家账户。\n_说明：该账户仅用于收取佣金；无需存款或主动投注。_\n\n*规则 3:* 最低提款金额为 30 美元。",
    demoAccountsInfo: "🎮 *演示账户*\n\n演示账户允许您创建内容并向玩家展示平台如何工作，而无需使用真实资金，从而显著提高您的转化率。\n\n*获得演示账户的条件:*\n\n1️⃣ 必须有 *10个带存款的注册*\n2️⃣ 必须提供 *新的1XBet玩家ID* 用于演示充值"
  }
};

// Helper function to get translation
const t = (chatId: number, key: string): string => {
  const session = sessions.get(chatId);
  const lang = session?.lang || 'en';
  return translations[lang]?.[key] || translations.en[key] || '';
};

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPromoCode = (code: string): boolean => {
  const promoCodeRegex = /^[A-Za-z0-9]{4,}$/;
  return promoCodeRegex.test(code);
};

// Affiliate URL & Android App
const AFFILIATE_URL = 'https://refpa58144.com/L?tag=d_4240218m_2528c_&site=4240218&ad=2528';
const ANDROID_APP_URL = 'https://1x.partners/mobile-app';

// Country options for callback (Option 1 — avoids freeze when user selects a country button)
const COUNTRY_OPTIONS: { cb: string; name: string }[] = [
  { cb: 'country_US', name: 'United States' },
  { cb: 'country_GB', name: 'United Kingdom' },
  { cb: 'country_IN', name: 'India' },
  { cb: 'country_RU', name: 'Russia' },
  { cb: 'country_TR', name: 'Turkey' },
  { cb: 'country_OTHER', name: 'Other' }
];

console.log('🚀 1XPartners Premium Funnel is running...');

// /start command handler
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Initialize session
  sessions.set(chatId, {
    lang: 'en',
    step: 'select_language',
    data: {}
  });

  const greeting = translations.en.welcomeGreeting + '\n\nChoose your language:';
  await bot.sendMessage(chatId, greeting, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇺🇸 English", callback_data: 'lang_en' }, { text: "🇦🇪 العربية", callback_data: 'lang_ar' }],
        [{ text: "🇷🇺 Русский", callback_data: 'lang_ru' }, { text: "🇹🇷 Türkçe", callback_data: 'lang_tr' }],
        [{ text: "🇪🇸 Español", callback_data: 'lang_es' }, { text: "🇵🇹 Português", callback_data: 'lang_pt' }],
        [{ text: "🇫🇷 Français", callback_data: 'lang_fr' }, { text: "🇮🇳 हिन्दी", callback_data: 'lang_hi' }],
        [{ text: "🇧🇷 Português BR", callback_data: 'lang_br' }, { text: "🇻🇳 Tiếng Việt", callback_data: 'lang_vi' }],
        [{ text: "🇰🇿 Қазақша", callback_data: 'lang_kz' }, { text: "🇺🇿 O'zbek", callback_data: 'lang_uz' }],
        [{ text: "🇨🇳 中文", callback_data: 'lang_zh' }]
      ]
    }
  });
});

// SINGLE callback_query handler - prevents double replies
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  // Answer immediately to prevent "query is too old" / timeout — do not await long work before this
  try {
    await bot.answerCallbackQuery(query.id);
  } catch (_) {
    // Timeout or stale query; ignore so it doesn't crash the bot
  }

  let session = sessions.get(chatId);
  if (!session) {
    session = { lang: 'en', step: 'select_language', data: {} };
    sessions.set(chatId, session);
  }

  // Language selection
  if (query.data?.startsWith('lang_')) {
    const lang = query.data.replace('lang_', '');
    session.lang = lang;
    session.step = 'main_menu';
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'mainMenu'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'becomePartner'), callback_data: 'become_partner' }],
          [{ text: t(chatId, 'promoMarketing'), callback_data: 'promo_marketing' }],
          [{ text: t(chatId, 'commissionPayouts'), callback_data: 'commission_payouts' }],
          [{ text: t(chatId, 'downloadAndroid'), url: ANDROID_APP_URL }],
          [{ text: t(chatId, 'premiumSupportCenter'), callback_data: 'vip_support' }]
        ]
      }
    });
    return;
  }

  // Become a Partner → registration flow
  if (query.data === 'become_partner') {
    session.step = 'register_menu';
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'registerMenu'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'premiumManagedSetup'), callback_data: 'fill_info' }],
          [{ text: t(chatId, 'optionAInstant'), callback_data: 'instant_link' }],
          [{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]
        ]
      }
    });
    return;
  }

  // Promo & Marketing Materials
  if (query.data === 'promo_marketing') {
    await bot.sendMessage(chatId, t(chatId, 'promoMarketingDesc'), {
      reply_markup: {
        inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]]
      }
    });
    return;
  }

  // Commission & Payouts
  if (query.data === 'commission_payouts') {
    await bot.sendMessage(chatId, t(chatId, 'withdrawCommissionInfo'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]]
      }
    });
    return;
  }

  // Download Android App — send link + Back (url button is in main menu)
  if (query.data === 'download_android') {
    await bot.sendMessage(chatId, t(chatId, 'downloadAndroid') + '\n\n' + ANDROID_APP_URL, {
      reply_markup: {
        inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]]
      }
    });
    return;
  }

  // Premium Support Center (2FA + Demo)
  if (query.data === 'vip_support' || query.data === 'support') {
    session.step = 'support_menu';
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'supportMenu'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'twoFactorAuth'), callback_data: 'support_2fa' }],
          [{ text: t(chatId, 'demoAccounts'), callback_data: 'support_demo' }],
          [{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]
        ]
      }
    });
    return;
  }

  // Instant Activation (Via Link): send link first, then ask email
  if (query.data === 'instant_link') {
    session.flowType = 'link';
    session.data = {};
    session.step = 'link_get_email';
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, AFFILIATE_URL);
    await bot.sendMessage(chatId, t(chatId, 'linkFlowEmail'), {
      reply_markup: {
        inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]]
      }
    });
    return;
  }

  // Fill Info option
  if (query.data === 'fill_info') {
    session.flowType = 'fill_info';
    session.step = 'get_full_name';
    session.data = {};
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'enterFullName'), {
      reply_markup: {
        inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]]
      }
    });
    return;
  }

  // Support button
  if (query.data === 'support') {
    session.step = 'support_menu';
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'supportMenu'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'twoFactorAuth'), callback_data: 'support_2fa' }],
          [{ text: t(chatId, 'withdrawCommission'), callback_data: 'support_withdraw' }],
          [{ text: t(chatId, 'demoAccounts'), callback_data: 'support_demo' }],
          [{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]
        ]
      }
    });
    return;
  }

  // Support: 2FA submenu
  if (query.data === 'support_2fa') {
    await bot.sendMessage(chatId, t(chatId, 'twoFactorAuth'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'activate2FA'), callback_data: 'support_2fa_activate' }],
          [{ text: t(chatId, 'deactivate2FA'), callback_data: 'support_2fa_deactivate' }],
          [{ text: t(chatId, 'back'), callback_data: 'support' }]
        ]
      }
    });
    return;
  }

  // Support: Activate 2FA
  if (query.data === 'support_2fa_activate') {
    await bot.sendMessage(chatId, t(chatId, 'activate2FAInfo'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'back'), callback_data: 'support_2fa' }]
        ]
      }
    });
    return;
  }

  // Support: Deactivate 2FA
  if (query.data === 'support_2fa_deactivate') {
    await bot.sendMessage(chatId, t(chatId, 'deactivate2FAInfo'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'back'), callback_data: 'support_2fa' }]
        ]
      }
    });
    return;
  }

  // Support: Withdraw Commission
  if (query.data === 'support_withdraw') {
    await bot.sendMessage(chatId, t(chatId, 'withdrawCommissionInfo'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'back'), callback_data: 'support' }]
        ]
      }
    });
    return;
  }

  // Support: Demo Accounts
  if (query.data === 'support_demo') {
    await bot.sendMessage(chatId, t(chatId, 'demoAccountsInfo'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'back'), callback_data: 'support' }]
        ]
      }
    });
    return;
  }

  // Country selection (Option 1) — callback ensures correct transition, answerCallbackQuery already called first
  if (query.data?.startsWith('country_') && session.step === 'get_country') {
    if (query.data === 'country_OTHER') {
      await bot.sendMessage(chatId, t(chatId, 'typeCountry'), {
        reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
      });
      return;
    }
    const opt = COUNTRY_OPTIONS.find((o) => o.cb === query.data);
    if (opt) {
      session.data.country = opt.name;
      session.step = 'get_promo_code';
      sessions.set(chatId, session);
      await bot.sendMessage(chatId, t(chatId, 'enterPromoCode'), {
        reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
      });
    }
    return;
  }

  // Confirm details — send report to admin only when user confirms (fill_info flow)
  if (query.data === 'confirm_details') {
    const sid = sessions.get(chatId);
    if (!sid || sid.step !== 'review' || !sid.data) return;
    const from = query.from;
    const uid = from?.id ?? chatId;
    const displayName = (sid.flowType === 'fill_info' && sid.data.fullName)
      ? sid.data.fullName
      : [from?.first_name, from?.last_name].filter(Boolean).join(' ') || `User ${uid}`;
    const username = from?.username ? `@${from.username}` : '—';
    const d = sid.data;
    const langLabel = sid.lang.toUpperCase();
    const adminMessage = sid.flowType === 'link'
      ? `👤 New Lead: [${displayName.replace(/[[\]]/g, '')}](tg://user?id=${uid})\n🆔 User ID: ${uid}\n👤 Username: ${username}\n📧 Email: ${d.email}\n📱 Phone: —\n🔑 Promo Code: ${d.promoCode}\n🗺 Language: ${langLabel}`
      : `👤 New Lead: [${displayName.replace(/[[\]]/g, '')}](tg://user?id=${uid})\n🆔 User ID: ${uid}\n👤 Username: ${username}\n📧 Email: ${d.email}\n📱 Phone: ${d.phone || '—'}\n🔑 Promo Code: ${d.promoCode}\n🗺 Language: ${langLabel}`;
    await bot.sendMessage(MY_ADMIN_ID, adminMessage, { parse_mode: 'Markdown' });
    await bot.sendMessage(chatId, t(chatId, 'thankYou'));
    sessions.delete(chatId);
    return;
  }

  // Confirm Activation (Option 2 — Via Link): success message + forward to admin
  if (query.data === 'confirm_activation') {
    const sid = sessions.get(chatId);
    if (!sid || sid.step !== 'review' || sid.flowType !== 'link' || !sid.data) return;
    const from = query.from;
    const uid = from?.id ?? chatId;
    const displayName = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || `User ${uid}`;
    const username = from?.username ? `@${from.username}` : '—';
    const d = sid.data;
    const langLabel = sid.lang.toUpperCase();
    const adminMessage = `👤 New Lead: [${displayName.replace(/[[\]]/g, '')}](tg://user?id=${uid})\n🆔 User ID: ${uid}\n👤 Username: ${username}\n📧 Email: ${d.email}\n🔑 Promo Code: ${d.promoCode}\n🗺 Language: ${langLabel}`;
    await bot.sendMessage(MY_ADMIN_ID, adminMessage, { parse_mode: 'Markdown' });
    await bot.sendMessage(chatId, t(chatId, 'activationSent'));
    sessions.delete(chatId);
    return;
  }

  // Cancel / Edit (Option 2 — Via Link): cancel message + main menu
  if (query.data === 'cancel_activation') {
    await bot.sendMessage(chatId, t(chatId, 'activationCancelled'));
    session.step = 'main_menu';
    session.flowType = undefined;
    session.data = {};
    sessions.set(chatId, session);
    await bot.sendMessage(chatId, t(chatId, 'mainMenu'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'becomePartner'), callback_data: 'become_partner' }],
          [{ text: t(chatId, 'promoMarketing'), callback_data: 'promo_marketing' }],
          [{ text: t(chatId, 'commissionPayouts'), callback_data: 'commission_payouts' }],
          [{ text: t(chatId, 'downloadAndroid'), url: ANDROID_APP_URL }],
          [{ text: t(chatId, 'premiumSupportCenter'), callback_data: 'vip_support' }]
        ]
      }
    });
    return;
  }

  // Start over — reset and show main menu
  if (query.data === 'start_over') {
    session.step = 'main_menu';
    session.flowType = undefined;
    session.data = {};
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'mainMenu'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'becomePartner'), callback_data: 'become_partner' }],
          [{ text: t(chatId, 'promoMarketing'), callback_data: 'promo_marketing' }],
          [{ text: t(chatId, 'commissionPayouts'), callback_data: 'commission_payouts' }],
          [{ text: t(chatId, 'downloadAndroid'), url: ANDROID_APP_URL }],
          [{ text: t(chatId, 'premiumSupportCenter'), callback_data: 'vip_support' }]
        ]
      }
    });
    return;
  }

  // Back to main menu
  if (query.data === 'back_to_main') {
    session.step = 'main_menu';
    session.flowType = undefined;
    session.data = {};
    sessions.set(chatId, session);

    await bot.sendMessage(chatId, t(chatId, 'mainMenu'), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'becomePartner'), callback_data: 'become_partner' }],
          [{ text: t(chatId, 'promoMarketing'), callback_data: 'promo_marketing' }],
          [{ text: t(chatId, 'commissionPayouts'), callback_data: 'commission_payouts' }],
          [{ text: t(chatId, 'downloadAndroid'), url: ANDROID_APP_URL }],
          [{ text: t(chatId, 'premiumSupportCenter'), callback_data: 'vip_support' }]
        ]
      }
    });
    return;
  }
});

// SINGLE message handler with switch statement for zero lag
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const hasContact = !!msg.contact;

  if (msg.from?.is_bot) return;
  const session = sessions.get(chatId);
  if (!session || !session.step) return;
  // Allow contact when in get_phone; otherwise require text
  if (!text && !(session.step === 'get_phone' && hasContact)) return;
  if (text && text.startsWith('/')) return;

  // Helper to build review summary and show Confirm / Start Over (fill_info) or Verify + Confirm Activation / Cancel (link)
  const sendReviewAndSetStep = () => {
    const d = session.data;
    const isLink = session.flowType === 'link';
    session.step = 'review';
    sessions.set(chatId, session);
    if (isLink) {
      const body = t(chatId, 'verifyRegistrationDetails') + '\n\n*Email:* ' + d.email + '\n*Promo Code:* ' + d.promoCode;
      return bot.sendMessage(chatId, body, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: t(chatId, 'confirmActivation'), callback_data: 'confirm_activation' }],
            [{ text: t(chatId, 'cancelEdit'), callback_data: 'cancel_activation' }]
          ]
        }
      });
    }
    const summary = `*Full Name:* ${d.fullName}\n*Email:* ${d.email}\n*Phone:* ${d.phone}\n*Country:* ${d.country}\n*Promo Code:* ${d.promoCode}`;
    const body = t(chatId, 'reviewTitle') + '\n\n' + summary;
    return bot.sendMessage(chatId, body, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: t(chatId, 'confirmDetails'), callback_data: 'confirm_details' }],
          [{ text: t(chatId, 'startOver'), callback_data: 'start_over' }]
        ]
      }
    });
  };

  // High-performance switch-based state machine
  switch (session.step) {
    case 'get_full_name':
      session.data.fullName = text ?? '';
      session.step = 'get_email';
      sessions.set(chatId, session);
      await bot.sendMessage(chatId, t(chatId, 'enterEmail'), {
        reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
      });
      break;

    case 'get_email':
      if (!isValidEmail(text ?? '')) {
        await bot.sendMessage(chatId, t(chatId, 'invalidEmail'), {
          reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
        });
        return;
      }
      session.data.email = text ?? '';
      session.step = 'get_phone';
      sessions.set(chatId, session);
      await bot.sendMessage(chatId, t(chatId, 'enterPhone'), {
        reply_markup: {
          keyboard: [
            [{ text: t(chatId, 'shareContact'), request_contact: true }],
            [{ text: t(chatId, 'back') }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
      break;

    case 'get_phone': {
      if (text === t(chatId, 'back')) {
        session.step = 'main_menu';
        session.flowType = undefined;
        session.data = {};
        sessions.set(chatId, session);
        await bot.sendMessage(chatId, t(chatId, 'mainMenu'), {
          parse_mode: 'Markdown',
          reply_markup: { remove_keyboard: true }
        });
        await bot.sendMessage(chatId, '\u200B', {
          reply_markup: {
            inline_keyboard: [
              [{ text: t(chatId, 'becomePartner'), callback_data: 'become_partner' }],
              [{ text: t(chatId, 'promoMarketing'), callback_data: 'promo_marketing' }],
              [{ text: t(chatId, 'commissionPayouts'), callback_data: 'commission_payouts' }],
              [{ text: t(chatId, 'downloadAndroid'), url: ANDROID_APP_URL }],
              [{ text: t(chatId, 'premiumSupportCenter'), callback_data: 'vip_support' }]
            ]
          }
        });
        break;
      }
      const phone = hasContact ? (msg.contact?.phone_number ?? '') : (text ?? '');
      if (!phone.trim()) break;
      session.data.phone = phone.trim();
      session.step = 'get_country';
      sessions.set(chatId, session);
      const countryRows = [
        COUNTRY_OPTIONS.slice(0, 3).map((o) => ({ text: o.name, callback_data: o.cb })),
        COUNTRY_OPTIONS.slice(3, 6).map((o) => ({ text: o.name, callback_data: o.cb })),
        [{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]
      ];
      await bot.sendMessage(chatId, t(chatId, 'enterCountry'), {
        reply_markup: { remove_keyboard: true }
      });
      await bot.sendMessage(chatId, '\u200B', {
        reply_markup: { inline_keyboard: countryRows }
      });
      break;
    }

    case 'get_country':
      session.data.country = text ?? '';
      session.step = 'get_promo_code';
      sessions.set(chatId, session);
      await bot.sendMessage(chatId, t(chatId, 'enterPromoCode'), {
        reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
      });
      break;

    case 'get_promo_code':
      if (!isValidPromoCode(text ?? '')) {
        await bot.sendMessage(chatId, t(chatId, 'invalidPromoCode'), {
          reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
        });
        return;
      }
      session.data.promoCode = text ?? '';
      sessions.set(chatId, session);
      await sendReviewAndSetStep();
      break;

    case 'link_get_email':
      if (!isValidEmail(text ?? '')) {
        await bot.sendMessage(chatId, t(chatId, 'invalidEmail'), {
          reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
        });
        return;
      }
      session.data.email = text ?? '';
      session.step = 'link_get_promo_code';
      sessions.set(chatId, session);
      await bot.sendMessage(chatId, t(chatId, 'linkFlowPromo'), {
        reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
      });
      break;

    case 'link_get_promo_code':
      if (!isValidPromoCode(text ?? '')) {
        await bot.sendMessage(chatId, t(chatId, 'invalidPromoCode'), {
          reply_markup: { inline_keyboard: [[{ text: t(chatId, 'back'), callback_data: 'back_to_main' }]] }
        });
        return;
      }
      session.data.promoCode = text ?? '';
      sessions.set(chatId, session);
      await sendReviewAndSetStep();
      break;

    default:
      // Ignore messages when not in registration flow
      break;
  }
});

// HTTP server for Render port scan / health check
app.get('/', (_req, res) => res.send('ok'));
app.listen(port, '0.0.0.0', () => {
  console.log('✅ Server successfully bound to 0.0.0.0:' + port);
});
