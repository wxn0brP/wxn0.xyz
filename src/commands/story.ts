import { $store, Mail } from "../vars";
import { print } from "../ui";
import { saveGame } from "../save";

export function cmdMail(args: string[]) {
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

        print("<br>Usage: mail read <number>", "dim");
        return;
    }

    if (args[0] === "read") args.shift();
    if (args.length === 0) {
        print("Usage: mail read <number>", "error");
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