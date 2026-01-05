import { $store } from "./vars";
import { addXp } from "./xp";
import { print } from "./ui";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    xp: number;
    hidden?: boolean;
    order: number;
    requiredLevel?: number;
}

export const achievements: Achievement[] = [
    // Level 0 - Basic commands
    { id: "first_steps", name: "First Steps", description: "Run your first command.", xp: 10, order: 1 },
    { id: "status_check", name: "Status Check", description: "Check your status.", xp: 20, order: 2 },
    { id: "hacker", name: "Script Kiddie", description: "Complete your first hack.", xp: 50, order: 3 },
    { id: "link_finder", name: "Link Finder", description: "View available links.", xp: 25, order: 4 },

    // Level 1+ commands
    { id: "miner", name: "Crypto Miner", description: "Mine for XP successfully.", xp: 40, order: 5, requiredLevel: 1 },
    { id: "time_traveler", name: "Time Traveler", description: "Check the current date and time.", xp: 15, order: 6, requiredLevel: 1 },
    { id: "self_aware", name: "Self Aware", description: "Check who you are.", xp: 15, order: 7, requiredLevel: 1 },

    // Level 2+ commands
    { id: "explorer", name: "Explorer", description: "List directory contents.", xp: 20, order: 8, requiredLevel: 2 },
    { id: "navigator", name: "Navigator", description: "Change directory 5 times.", xp: 25, order: 9, requiredLevel: 2 },
    { id: "reader", name: "Reader", description: "Read a file with cat.", xp: 20, order: 10, requiredLevel: 2 },

    // Level 3+ commands
    { id: "snake_player", name: "Snake Charmer", description: "Play Snake.", xp: 30, order: 11, requiredLevel: 3 },
    { id: "snake_master", name: "Snake Master", description: "Score 20+ in Snake.", xp: 100, order: 12, requiredLevel: 3 },
    { id: "vim_brave", name: "Brave Soul", description: "Enter vim (congratulations on your courage or your stupidity).", xp: 25, order: 13, requiredLevel: 3 },
    { id: "vim_survivor", name: "Vim Survivor", description: "Exit vim (congratulations on your persistence).", xp: 50, order: 14, requiredLevel: 3 },

    // Level 4+ commands
    { id: "pong_player", name: "Pong Rookie", description: "Play Pong.", xp: 30, order: 15, requiredLevel: 4 },
    { id: "pong_winner", name: "Pong Champion", description: "Score 10+ points in Pong.", xp: 100, order: 16, requiredLevel: 4 },

    // Level 5+ commands
    { id: "coin_flipper", name: "Gambler", description: "Flip a coin 10 times.", xp: 30, order: 17, requiredLevel: 5 },
    { id: "matrix_fan", name: "Matrix Fan", description: "Enter the Matrix.", xp: 25, order: 18, requiredLevel: 5 },

    // Advanced achievements (any level)
    { id: "hacker_pro", name: "Hacker Pro", description: "Complete 10 successful hacks.", xp: 100, order: 19 },
    { id: "elite_hacker", name: "Elite Hacker", description: "Complete 50 successful hacks.", xp: 250, order: 20 },
    { id: "mining_tycoon", name: "Mining Tycoon", description: "Successfully mine 20 times.", xp: 150, order: 21, requiredLevel: 1 },

    // Progression milestones
    { id: "level_5", name: "Rising Star", description: "Reach level 5.", xp: 50, order: 22 },
    { id: "level_10", name: "Veteran", description: "Reach level 10.", xp: 100, order: 23 },
    { id: "level_20", name: "Master", description: "Reach level 20.", xp: 200, order: 24 },

    // Hidden achievements
    { id: "hello_world", name: "Friendly", description: "Say hello to the system.", xp: 15, hidden: true, order: 100 },
    { id: "curious", name: "Polite Hacker", description: "Ask nicely for a sandwich.", xp: 30, hidden: true, order: 102 },
    { id: "god_mode", name: "God Mode", description: "Unlock unlimited power.", xp: 100, hidden: true, order: 103 },
    { id: "escape_artist", name: "Escape Artist", description: "Try to exit 5 times.", xp: 40, hidden: true, order: 104 },
    { id: "destructor", name: "Destructor", description: "Try to delete system files.", xp: 50, hidden: true, order: 105 },
    { id: "echo_chamber", name: "Echo Chamber", description: "Use echo 10 times.", xp: 30, hidden: true, order: 106, requiredLevel: 1 },
    { id: "persistent", name: "Persistent", description: "Try the same failed command 3 times in a row.", xp: 25, hidden: true, order: 107 },
    { id: "clean_freak", name: "Clean Freak", description: "Clear the terminal 10 times.", xp: 35, hidden: true, order: 108 },
    { id: "answer_seeker", name: "Answer Seeker", description: "Discover the answer to everything.", xp: 42, hidden: true, order: 112 },
    { id: "zhiva_user", name: "Zhiva User", description: "Launch Zhiva app.", xp: 40, hidden: true, order: 113, requiredLevel: 3 },
    { id: "completionist", name: "Completionist", description: "Unlock all non-hidden achievements.", xp: 500, hidden: true, order: 200 },
];

export const achievementCounters = {
    cdCount: 0,
    hackCount: 0,
    mineCount: 0,
    exitCount: 0,
    echoCount: 0,
    clearCount: 0,
    coinflipCount: 0,
    lastFailedCommand: "",
    failedCommandCount: 0,
};

export function unlockAchievement(id: string) {
    const unlocked = $store.achievements.get();
    if (unlocked.includes(id)) return;

    const achievement = achievements.find(a => a.id === id);
    if (!achievement) return;

    $store.achievements.set([...unlocked, id]);
    addXp(achievement.xp);

    print(`<br>🏆 <span class="success">Achievement Unlocked: ${achievement.name}</span>`, "system");
    print(`   ${achievement.description} (+${achievement.xp} XP)<br>`, "dim");

    checkCompletionist();
}

function checkCompletionist() {
    const unlocked = $store.achievements.get();
    const nonHidden = achievements.filter(a => !a.hidden);
    const allNonHiddenUnlocked = nonHidden.every(a => unlocked.includes(a.id));

    if (allNonHiddenUnlocked && !unlocked.includes("completionist")) {
        unlockAchievement("completionist");
    }
}

export function checkLevelAchievements(level: number) {
    if (level >= 5) unlockAchievement("level_5");
    if (level >= 10) unlockAchievement("level_10");
    if (level >= 20) unlockAchievement("level_20");
}

export function getAchievementProgress(): string {
    const unlocked = $store.achievements.get();
    const total = achievements.length;
    return `${unlocked.length}/${total}`;
}

export function getVisibleAchievements() {
    const unlocked = $store.achievements.get();
    const currentLevel = $store.level.get();
    const sorted = [...achievements].sort((a, b) => a.order - b.order);

    const visible: (Achievement & { unlocked: boolean })[] = [];
    let nextCount = 0;

    for (const achievement of sorted) {
        const isUnlocked = unlocked.includes(achievement.id);

        const levelLocked = achievement.requiredLevel !== undefined && currentLevel < achievement.requiredLevel;

        if (isUnlocked) {
            visible.push({ ...achievement, unlocked: true });
        } else if (achievement.hidden) {
            continue;
        } else if (levelLocked) {
            continue;
        } else if (
            nextCount < 5 &&
            (
                achievement.requiredLevel === undefined ||
                achievement.requiredLevel <= currentLevel
            )
        ) {
            visible.push({ ...achievement, unlocked: false });
            nextCount++;
        }
    }

    return visible;
}
