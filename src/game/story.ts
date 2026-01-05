import { saveGame } from "../save";
import { print } from "../ui";
import { $store, Mail } from "../vars";

interface StoryStep {
    id: number;
    trigger: (level: number, xp: number) => boolean;
    action: () => void;
}

const cipherMails = [
    {
        id: "welcome_cipher",
        from: "Cipher <unknown@wxn0.xyz>",
        subject: "Welcome to the network",
        body: `Greetings, User.
        
I see you've managed to gain access to the terminal. Impressive for a newcomer.
This system is not what it seems. There are layers here that most never see.

If you want to uncover the truth, start by proving your worth.
Reach Level 2 and I might have something for you.

- Cipher`
    },
    {
        id: "level_2_task",
        from: "Cipher <unknown@wxn0.xyz>",
        subject: "The first test",
        body: `You are learning fast. Good.

I need you to explore the system. Use the 'ls' and 'cd' commands to navigate the filesystem.
There might be some interesting files hidden around.

Also, try the 'hack' command. We need resources for the operations ahead.
Report back when you reach Level 5.

- Cipher`
    },
    {
        id: "level_5_market",
        from: "Cipher <unknown@wxn0.xyz>",
        subject: "The Dark Market",
        body: `Level 5. You are becoming a threat... or an asset.

I've unlocked access to the Dark Market for you.
Use the command 'shop' to access it. You can upgrade your rig there.
You'll need those upgrades if you want to pierce the stronger firewalls ahead.

Keep a low profile.

- Cipher`
    },
    {
        id: "level_10_truth",
        from: "Cipher <unknown@wxn0.xyz>",
        subject: "The Truth",
        body: `Listen carefully.

The "game" you are playing is a simulation. A training ground.
But for what? That's what we are trying to find out.

I am not an AI. I am another user, trapped in a higher layer.
Keep growing stronger. At Level 20, we break out.

- Cipher`
    },
    {
        id: "level_20_ascension",
        from: "Cipher <unknown@wxn0.xyz>",
        subject: "ASCENSION",
        body: `The time has come.

You have mastered this layer. But the ceiling is just a floor for the next level.
To truly ascend, you must look beyond the commands.

Have you found the 'god_mode'? Have you found the answer to '42'?
The system is crumbling.

Prepare yourself.

- Cipher`
    }
];

export async function sendMail(mailDef: any) {
    const mails = $store.mails.get();
    if (mails.find(m => m.id === mailDef.id)) return;

    const newMail: Mail = {
        ...mailDef,
        timestamp: Date.now(),
        read: false
    };

    $store.mails.set([newMail, ...mails]);

    print("<br>📨 <span class='success'>You have a new message!</span> Type 'mail' to read.<br>", "system");
    saveGame();
}

const storySteps: StoryStep[] = [
    {
        id: 0,
        trigger: () => true,
        action: () => sendMail(cipherMails[0])
    },
    {
        id: 1,
        trigger: (level) => level >= 2,
        action: () => sendMail(cipherMails[1])
    },
    {
        id: 2,
        trigger: (level) => level >= 5,
        action: () => sendMail(cipherMails[2])
    },
    {
        id: 3,
        trigger: (level) => level >= 10,
        action: () => sendMail(cipherMails[3])
    },
    {
        id: 4,
        trigger: (level) => level >= 20,
        action: () => sendMail(cipherMails[4])
    }
];

export function checkStoryProgress() {
    const currentProgress = $store.storyProgress.get();
    const level = $store.level.get();
    const xp = $store.xp.get();

    if (currentProgress < storySteps.length) {
        const step = storySteps[currentProgress];
        if (step.trigger(level, xp)) {
            step.action();
            $store.storyProgress.set(currentProgress + 1);
            saveGame();
        }
    }
}
