import { incrementCell, decrementCell } from "@wxn0brp/flanker-ui/storeUtils";
import { $store } from "../vars";
import { print } from "../ui";
import { saveGame } from "../save";

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    buy: () => void;
}

const items: ShopItem[] = [
    {
        id: "cpu_overclock",
        name: "CPU Overclock",
        description: "Increase XP gain multiplier by +0.5x",
        cost: 200,
        buy: () => {
            incrementCell($store.xpMultiplier, 0.5);
            print("Successfully overclocked CPU! XP gain increased.", "success");
        }
    },
    {
        id: "ram_expansion",
        name: "RAM Expansion",
        description: "Increase XP gain multiplier by +1.0x",
        cost: 500,
        buy: () => {
            incrementCell($store.xpMultiplier, 1.0);
            print("RAM Expansion installed! System running faster.", "success");
        }
    },
    {
        id: "quantum_core",
        name: "Quantum Core",
        description: "Increase XP gain multiplier by +2.0x",
        cost: 1000,
        buy: () => {
            incrementCell($store.xpMultiplier, 2.0);
            print("Quantum Core online. Processing power limit broken.", "success");
        }
    }
];

export function startShop(args: string = "") {
    if ($store.level.get() < 5) {
        print("Access Denied: Dark Market requires Level 5 security clearance.", "error");
        return;
    }

    const command = args.trim().split(" ");

    if (command[0] === "buy") {
        const itemId = command[1];
        if (!itemId) {
            print("Usage: shop buy <item_id>", "warning");
            return;
        }

        const item = items.find(i => i.id === itemId);
        if (!item) {
            print(`Item '${itemId}' not found in catalog.`, "error");
            return;
        }

        const credits = $store.credits.get();
        if (credits < item.cost) {
            print(`Insufficient funds. You have <span class="warning">${credits}</span> credits, but item costs <span class="error">${item.cost}</span>.`, "error");
            return;
        }

        decrementCell($store.credits, item.cost);
        item.buy();
        saveGame();
        return;
    }

    // List items
    print("=== DARK MARKET ===", "success");
    print(`Credits Available: <span class="warning">${$store.credits.get()}</span>`);
    print(`Current XP Multiplier: <span class="success">${$store.xpMultiplier.get()}x</span><br>`);

    print("Available Upgrades:");
    items.forEach(item => {
        print(`<span class="success">${item.id}</span> - ${item.name}`);
        print(`  ${item.description}`);
        print(`  Cost: <span class="warning">${item.cost}</span> Credits`);
    });

    print("<br>Usage: shop buy <item_id>", "dim");
}
