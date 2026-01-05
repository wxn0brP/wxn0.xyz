import { $store, Mail } from "../vars";
import { print } from "../ui";
import { saveGame } from "../save";

export function cmdMail(args: string[], fullArgs: string) {
    const mails = $store.mails.get();

    if (args.length === 0) {
        print("=== INBOX ===", "success");
        if (mails.length === 0) {
            print("No messages.", "dim");
            return;
        }

        mails.forEach((mail, index) => {
            const status = mail.read ? " " : "*";
            const date = new Date(mail.timestamp).toLocaleDateString();
            print(`[${index + 1}] ${status} ${mail.from}: ${mail.subject} <span class="dim">(${date})</span>`);
        });

        print("<br>", "dim").textContent += "Usage: mail read <number> | mail send <message>";
        return;
    }

    if (args[0] === "send") {
        if (args.length === 1) {
            print("Usage: mail send", "error").textContent += " <message>";
            return;
        }
        const message = args.slice(1).join(" ");
        const mailCodes = [109, "a", 105, 108, "t", 111, 58, "r", 7 * 8 + 5 * 11, 111, 116, Math.pow(2, 6)];
        const mailURL = mailCodes.map(code => typeof code === "string" ? code : String.fromCharCode(code)).join("");
        location.href = `${mailURL}wxn0.xyz?subject=Mail from game&body=${encodeURIComponent(message)}`;
        return;
    }


    if (args[0] === "read") args.shift();
    if (args.length === 0) {
        print("Usage: mail read", "error").textContent += " <number>";
        return;
    }

    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= mails.length) {
        print("Invalid message number.", "error");
        return;
    }

    const mail = mails[index];
    print("----------------------------------------", "dim");
    print(`From: <span class="success">${mail.from}</span>`);
    print(`Subject: ${mail.subject}`);
    print(`Date: ${new Date(mail.timestamp).toLocaleString()}`);
    print("----------------------------------------", "dim");
    print(mail.body.replace(/\n/g, "<br>"));
    print("----------------------------------------", "dim");

    if (!mail.read) {
        const newMails = [...mails];
        newMails[index] = { ...mail, read: true };
        $store.mails.set(newMails);
        saveGame();
    }
}