import { output, print, terminal } from "../ui";

const codes = [
    0, 100, 101, 102, 103,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 214, 226,
    300, 301, 302, 303, 304, 305, 307, 308,
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411,
    412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423,
    424, 425, 426, 428, 429, 431, 444, 450, 451, 495, 496, 497, 498, 499,
    500, 501, 502, 503, 504, 506, 507, 508, 509, 510, 511, 521, 522, 523, 525, 530, 599,
]

export function cat(code?: number) {
    if (!code || !codes.includes(code)) {
        code = codes[Math.floor(Math.random() * codes.length)];
    }
    print(`HTTP cat ${code}`);

    const p = document.createElement("p");
    const img = document.createElement("img");
    img.src = `https://http.cat/images/${code}.jpg`;
    img.alt = `HTTP cat ${code}`;
    img.addEventListener("load", () => {
        terminal.scrollTop = terminal.scrollHeight;
    });
    img.addEventListener("click", () => {
        window.open(`https://http.cat/status/${code}`, "_blank");
    });
    p.appendChild(img);
    output.appendChild(p);
}