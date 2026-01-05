
import { input, print } from "../ui";
import { unlockAchievement } from "../achievements";

interface Commit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
}

export async function cmdNews() {
    print("Fetching latest news from headquarters...", "system");
    input.disabled = true;

    try {
        const response = await fetch("https://api.github.com/repos/wxn0brP/wxn0.xyz/commits?per_page=100");
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const commits: Commit[] = await response.json();
        let count = 0;
        let versionCount = 0;

        print("=== LATEST TRANSMISSIONS ===", "header");

        for (const commit of commits) {
            const message = commit.commit.message.split("\n")[0];

            if (message.startsWith("feat: v") && /\d+\.\d+\.\d+/.test(message)) {
                versionCount++;
                if (versionCount >= 2) {
                    break;
                }
            }

            print(`<span style="color: #aaa">[${commit.commit.author.date.substring(0, 10)}]</span> <span style="color: #fff">${message}</span>`);
            count++;
        }

        if (count === 0) {
            print("No recent news found.", "warning");
        } else {
            unlockAchievement("informed");
        }

    } catch (err: unknown) {
        if (err instanceof Error) {
            print(`Failed to fetch news: ${err.message}`, "error");
        } else {
            print(`Failed to fetch news: Unknown error`, "error");
        }
    } finally {
        input.disabled = false;
        input.focus();
    }
}
