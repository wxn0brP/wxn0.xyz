import { output, terminal } from "../ui";

export async function getXkcdImageUrl(comicNumber: number): Promise<string> {
    const response = await fetch(`/xkcd.php?i=${comicNumber}`);
    return response.text();
}

export async function cmdXkcd(arg?: string) {
    const num = +arg || Math.floor(Math.random() * 3211) + 1;
    const imageUrl = await getXkcdImageUrl(num);

    const p = document.createElement("p");
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = `xkcd ${num}`;
    img.addEventListener("load", () => {
        terminal.scrollTop = terminal.scrollHeight;
    });
    img.addEventListener("click", () => {
        window.open(`https://xkcd.com/${num}`, "_blank");
    });
    p.appendChild(img);
    output.appendChild(p);
}
