export const sendAuthCode = async (Mobile) => {
    try {
        const res = await fetch('https://api.limosms.com/api/sendcode', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                ApiKey: process.env.SMS_KEY
            },
            body: JSON.stringify({ Mobile, Footer: 'Chat-app' }),
            signal: AbortSignal.timeout(3000)
        });
        const data = await res.json();
        return data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn("SMS API failed/timed out, using development mock for sendAuthCode:", error.message);
            return { success: true, message: "Mock SMS sent (use 12345)" };
        }
        return { success: false, message: "SMS service unavailable" };
    }
}

export const verifyCode = async (Mobile, Code) => {
    if (process.env.NODE_ENV !== 'production' && Code === "12345") {
        console.warn("Used development mock OTP code 12345");
        return { success: true };
    }

    try {
        const res = await fetch('https://api.limosms.com/api/checkcode', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                ApiKey: process.env.SMS_KEY
            },
            body: JSON.stringify({ Mobile, Code }),
            signal: AbortSignal.timeout(3000)
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.warn("SMS API failed/timed out for verifyCode:", error.message);
        return { success: false, message: 'خطا در بررسی کد (API Timeout)' };
    }
}