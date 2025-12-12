// Mensajes mock y respuestas automáticas para el sistema de chat

export const mockHostResponses = [
    "¡Hola! Gracias por reservar. Te espero.",
    "Perfecto, el espacio está listo para ti.",
    "Sin problema, cualquier duda me escribes.",
    "¡El portón está abierto, pasa tranquilo!",
    "Gracias por usar mi garaje 😊",
    "¡Claro! El código del portón es 1234.",
    "Excelente, te espero en unos minutos.",
    "Todo listo por acá, bienvenido.",
];

export const mockDriverMessages = [
    "Hola, acabo de reservar tu espacio.",
    "Ya voy en camino, llego en 10 minutos.",
    "¿El portón tiene código o abres tú?",
    "Gracias, excelente servicio.",
    "Ya estoy llegando al garaje.",
    "¡Listo! Ya estacioné, gracias.",
    "¿Puedo extender el tiempo de reserva?",
    "Perfecto, muchas gracias por todo.",
];

export const mockSupportResponses = [
    "¡Hola! Soy el asistente de EasyParker. ¿En qué puedo ayudarte?",
    "Claro, déjame revisar eso por ti.",
    "Para cancelar una reserva, ve a 'Mis Reservas' y selecciona la opción de cancelar.",
    "El reembolso se procesa en 3-5 días hábiles después de la cancelación.",
    "Puedes contactar directamente al anfitrión desde el chat de la reserva.",
    "¿Hay algo más en lo que pueda ayudarte?",
    "Gracias por usar EasyParker. ¡Que tengas un excelente día!",
];

// Función para obtener una respuesta aleatoria
export function getRandomHostResponse(): string {
    return mockHostResponses[Math.floor(Math.random() * mockHostResponses.length)];
}

export function getRandomDriverMessage(): string {
    return mockDriverMessages[Math.floor(Math.random() * mockDriverMessages.length)];
}

export function getRandomSupportResponse(): string {
    return mockSupportResponses[Math.floor(Math.random() * mockSupportResponses.length)];
}

// Mensaje inicial del conductor al reservar
export const driverInitialMessages = [
    "Hola, acabo de reservar tu espacio. Voy en camino.",
    "¡Hola! Reservé tu garaje, llego en unos 15 minutos.",
    "Buenas, acabo de hacer la reserva. ¿El espacio está disponible?",
];

// Mensaje inicial del anfitrión al aceptar
export const hostWelcomeMessages = [
    "¡Bienvenido! Tu reserva está confirmada. El portón estará abierto.",
    "Perfecto, espacio reservado. Te espero.",
    "¡Hola! Gracias por reservar. Cualquier cosa me avisas.",
];

export function getRandomDriverInitialMessage(): string {
    return driverInitialMessages[Math.floor(Math.random() * driverInitialMessages.length)];
}

export function getRandomHostWelcomeMessage(): string {
    return hostWelcomeMessages[Math.floor(Math.random() * hostWelcomeMessages.length)];
}
