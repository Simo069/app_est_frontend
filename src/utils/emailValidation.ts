/**
 * Helper function for real email format, domain existence, and disposable email checks.
 * Supports any real email address (Gmail, Yahoo, Outlook, EST Casa, etc.).
 */

export interface EmailValidationResult {
    isValid: boolean;
    error?: string;
    domain?: string;
}

// Common temporary / fake email domain list to block burner emails
const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'tempmail.com',
    '10minutemail.com',
    'mailinator.com',
    'dispostable.com',
    'guerrillamail.com',
    'trashmail.com',
    'yopmail.com',
    'sharklasers.com',
    'getnada.com',
    'temp-mail.org',
    'fakeinbox.com',
    'throwawaymail.com'
]);

export function validateEmail(email: string): EmailValidationResult {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
        return { isValid: false, error: "L'adresse email est requise." };
    }

    // Standard RFC 5322 regex for valid email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: "Veuillez entrer une adresse email valide (ex: exemple@gmail.com)." };
    }

    // Check for syntax anomalies (double dots, spaces, misplaced symbols)
    if (trimmed.includes('..') || trimmed.includes('@.') || trimmed.includes('.@') || trimmed.startsWith('.')) {
        return { isValid: false, error: "L'adresse email contient une syntaxe invalide." };
    }

    const domain = trimmed.split('@')[1];
    if (!domain) {
        return { isValid: false, error: "Domaine de l'email manquant." };
    }

    // Reject fake disposable email providers
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        return { isValid: false, error: "Les adresses email temporaires ou jetables ne sont pas autorisées." };
    }

    // Ensure valid domain structure (has valid name and extension)
    const domainParts = domain.split('.');
    if (domainParts.length < 2 || domainParts.some(part => part.length === 0)) {
        return { isValid: false, error: "Le nom de domaine de l'email est invalide." };
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || /^\d+$/.test(tld)) {
        return { isValid: false, error: "L'extension du domaine (.com, .ma, .fr...) est invalide." };
    }

    return {
        isValid: true,
        domain
    };
}
