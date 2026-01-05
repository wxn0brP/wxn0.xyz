import { fileSystem } from "./filesystem";
import { moveCursorToEnd } from "./input";
import { input } from "./ui";

export function handleAutoComplete(cmd: string, split: string[]) {
    if (["ls", "cd", "cat"].includes(cmd)) {
        const files = fileSystem.getFilesAndDirs(fileSystem.getCWD());
        const matchingFiles = files.filter((file) => file.startsWith(split[1]));
        if (matchingFiles.length === 1) {
            split[1] = matchingFiles[0];
            input.value = split.join(" ");
            moveCursorToEnd();
        }
    }
}