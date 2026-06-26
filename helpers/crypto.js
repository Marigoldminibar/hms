window.hashPassword = async function (text) {

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer =
        await crypto.subtle.digest("SHA-256", data);

    const hashArray =
        Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

};
window.isHash = function (value) {

    if (!value) return false;

    return /^[a-f0-9]{64}$/i.test(value);

};
window.verifyPassword = async function (inputPassword, storedPassword) {

    if (!storedPassword) return false;

    // SHA-256 ise
    if (isHash(storedPassword)) {
        return await hashPassword(inputPassword) === storedPassword;
    }

    // Eski düz metin ise
    return inputPassword === storedPassword;

};