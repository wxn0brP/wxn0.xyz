import { print } from "./ui";

interface FSNode {
    type: "file" | "dir";
    name?: string;
    parent?: FSNode;
    children?: Record<string, FSNode>;
    src?: string;
    hidden?: boolean;
}

class VirtualFileSystem {
    private root: FSNode | null = null;
    private currentPath: string[] = ["home", "guest"];
    private loaded = false;

    constructor() {
        this.load();
    }

    async load() {
        try {
            const res = await fetch("./system.json");
            const raw = await res.json();
            this.root = this.parseNode(raw, "root");
            this.loaded = true;
        } catch (e) {
            console.error("Failed to load VFS", e);
            print("System Error: Filesystem corruption detected.", "error");
        }
    }

    private parseNode(raw: any, name: string): FSNode {
        if (typeof raw === "string") {
            return { type: "file", src: raw, name };
        }

        const children: Record<string, FSNode> = {};
        const isHidden = raw["$hidden"] === true;

        for (const [key, value] of Object.entries(raw)) {
            if (key === "$hidden") continue;
            const childNode = this.parseNode(value, key);
            childNode.parent = undefined;
            children[key] = childNode;
        }

        return { type: "dir", children, hidden: isHidden, name };
    }

    public getCWD(): string {
        return "/" + this.currentPath.join("/");
    }

    private resolvePath(path: string): FSNode | null {
        if (!this.loaded || !this.root) return null;

        let parts = path.split("/").filter(Boolean);

        let p: string[] = path.startsWith("/") ? [] : [...this.currentPath];

        const normalizedPath: string[] = [];
        for (const part of p) {
            normalizedPath.push(part);
        }

        for (const part of parts) {
            if (part === ".") continue;
            if (part === "..") {
                if (normalizedPath.length > 0) normalizedPath.pop();
            } else {
                normalizedPath.push(part);
            }
        }

        let current: FSNode = this.root;

        if (normalizedPath.length === 0) return this.root;

        for (const part of normalizedPath) {
            if (current.type !== "dir" || !current.children) return null;
            if (current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }
        return current;
    }

    public ls(args: string) {
        if (!this.loaded) return;

        let target: FSNode | null;
        if (!args || args.trim() === "") {
            target = this.resolvePath(this.getCWD());
        } else {
            target = this.resolvePath(args);
        }

        if (!target) {
            print(`ls: cannot access '${args || ""}': No such file or directory`, "error");
            return;
        }

        if (target.type === "file") {
            print(target.src || target.name || "file");
            return;
        }

        if (!target.children) return;

        const names = Object.keys(target.children).filter(k => !target.children![k].hidden);

        if (names.length === 0) {
            print("(empty)", "dim");
        } else {
            names.sort((a, b) => {
                const nodeA = target!.children![a];
                const nodeB = target!.children![b];
                const typeA = nodeA.type === "dir" ? 0 : 1;
                const typeB = nodeB.type === "dir" ? 0 : 1;
                if (typeA !== typeB) return typeA - typeB;
                return a.localeCompare(b);
            });

            names.forEach(name => {
                const node = target!.children![name];
                const suffix = node.type === "dir" ? "/" : "";
                const style = node.type === "dir" ? "system" : "";
                print(`<span class="${style}">${name}${suffix}</span>`);
            });
        }
    }

    public cd(path: string) {
        if (!this.loaded) return;
        if (!path) {
            this.currentPath = ["home", "guest"];
            return;
        }

        const target = this.resolvePath(path);
        if (!target) {
            print(`cd: ${path}: No such file or directory`, "error");
            return;
        }
        if (target.type !== "dir") {
            print(`cd: ${path}: Not a directory`, "error");
            return;
        }

        let p: string[] = path.startsWith("/") ? [] : [...this.currentPath];
        const parts = path.split("/").filter(Boolean);
        for (const part of parts) {
            if (part === ".") continue;
            if (part === "..") {
                if (p.length > 0) p.pop();
            } else {
                p.push(part);
            }
        }
        this.currentPath = p;
    }

    public async cat(path: string, isSudo: boolean = false) {
        if (!this.loaded) return;
        if (!path) {
            print("Usage: cat <filename>", "error");
            return;
        }

        const target = this.resolvePath(path);
        if (!target) {
            print(`cat: ${path}: No such file or directory`, "error");
            return;
        }
        if (target.type !== "file") {
            print(`cat: ${path}: Is a directory`, "error");
            return;
        }

        let src = target.src;
        if (src) {
            try {
                if (src.startsWith("sudo:")) {
                    if (!isSudo) {
                        print("******** [PERMISSION DENIED] ********", "error");
                        return;
                    }
                    src = src.split(":")[1];
                }

                const response = await fetch(`./files/${src}`);
                if (!response.ok) throw new Error("404");
                const text = await response.text();
                print(text.replace(/\n/g, "<br>"));
            } catch (e) {
                print("Error reading file: IO Error", "error");
            }
        } else {
            print("(empty)");
        }
    }
}

export const fileSystem = new VirtualFileSystem();
