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

// ========== Quick Reply Suggestions ==========

// Sugerencias de mensajes rápidos para conductor a anfitrión
export const driverQuickReplies = [
    "Hola, ya voy en camino 🚗",
    "¿El portón tiene código o abres tú?",
    "¿Está disponible el espacio?",
    "Gracias, excelente servicio 👍",
];

// Sugerencias de mensajes rápidos para anfitrión a conductor
export const hostQuickReplies = [
    "¡Bienvenido! El espacio está listo",
    "El código del portón es 1234",
    "¿A qué hora llegas?",
    "Gracias por usar mi garaje 😊",
];


// Sugerencias para chat de soporte (CONDUCTOR)
export const driverSupportQuickReplies = [
    "¿Cómo cancelo una reserva?",
    "Tengo un problema con el pago",
    "¿Cómo contacto al anfitrión?",
    "Necesito ayuda con mi cuenta",
];

// Sugerencias para chat de soporte (ANFITRIÓN)
export const hostSupportQuickReplies = [
    "¿Cómo registro mi garaje?",
    "Problemas con un conductor",
    "¿Cuándo recibo mis pagos?",
    "Modificar precio de mi garaje",
];

// Lógica de respuesta "inteligente" basada en keywords
export function getSmartHostResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("camino") || lowerInput.includes("llegando") || lowerInput.includes("voy")) {
        return "¡Perfecto! Te estaré esperando. Avísame cuando estés afuera.";
    }
    if (lowerInput.includes("portón") || lowerInput.includes("código") || lowerInput.includes("abres")) {
        return "El portón es automático. El código es 1234. ¡Pasa con confianza!";
    }
    if (lowerInput.includes("gracias") || lowerInput.includes("excelente")) {
        return "¡De nada! Gracias a ti por confiar en mi garaje. ¡Vuelve pronto! 😊";
    }
    if (lowerInput.includes("disponible") || lowerInput.includes("espacio")) {
        return "Sí, el espacio está 100% disponible y reservado para ti.";
    }

    // Default random callback
    return getRandomHostResponse();
}

export function getSmartSupportResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    // Consultas de conductor
    if (lowerInput.includes("cancelo") || lowerInput.includes("cancelar")) {
        return "Para cancelar, ve a 'Mis Reservas', selecciona la reserva activa y presiona 'Cancelar'. El reembolso es automático.";
    }
    if (lowerInput.includes("pago") || lowerInput.includes("cobro")) {
        return "Si tuviste un problema con el pago, por favor envíanos una captura del comprobante a pagos@easyparker.com para revisarlo.";
    }
    if (lowerInput.includes("contacto") || lowerInput.includes("anfitrión")) {
        return "Puedes chatear con el anfitrión directamente desde los detalles de tu reserva confirmada.";
    }
    if (lowerInput.includes("cuenta") || lowerInput.includes("perfil")) {
        return "Puedes gestionar tu cuenta desde la sección 'Perfil'. Si tienes problemas de acceso, intenta restablecer tu contraseña.";
    }

    // Consultas de anfitrión
    if (lowerInput.includes("registro") || lowerInput.includes("registrar")) {
        return "Para registrar un garaje, ve a la pestaña 'Mi Garaje' y pulsa el botón '+' o 'Agregar nuevo garaje'.";
    }
    if (lowerInput.includes("pagos") || lowerInput.includes("dinero")) {
        return "Los pagos se procesan semanalmente cada martes. Asegúrate de tener tu cuenta bancaria configurada.";
    }
    if (lowerInput.includes("conductor") || lowerInput.includes("problema")) {
        return "Si tienes un problema con un conductor, puedes reportarlo desde el detalle de la reserva o contactar a seguridad.";
    }
    if (lowerInput.includes("precio") || lowerInput.includes("tarifa")) {
        return "Para cambiar el precio, ve a 'Mi Garaje', selecciona tu parqueo y pulsa 'Editar'. Ahí podrás actualizar la tarifa por hora.";
    }

    return getRandomSupportResponse();
}

export function getSmartDriverResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("código") || lowerInput.includes("abierto")) {
        return "¡Listo! Ya estacioné, gracias.";
    }
    if (lowerInput.includes("hora") || lowerInput.includes("llegas")) {
        return "Ya voy en camino, llego en 10 minutos.";
    }
    if (lowerInput.includes("bienvenido") || lowerInput.includes("listo")) {
        return "Gracias, ya estoy llegando al garaje.";
    }

    return getRandomDriverMessage();
}

export const supportQuickReplies = driverSupportQuickReplies; // Fallback legacy

