import "@wxn0brp/flanker-ui/html";
import { welcome } from "./game";
import "./input";
import "./misc";
import { loadGame } from "./save";
import { startParams } from "./start";

loadGame();
welcome().then(startParams);