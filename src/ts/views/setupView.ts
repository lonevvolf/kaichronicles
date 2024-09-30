/**
 * The setup view API
 */
export const setupView = {
    log(text: string, level: string|null = null) {
        let style: string = "";
        if (level === "ok") {
            style = "color: green";
        } else if (level === "error") {
            style = "color: red; font-weight: bold";
        }
        const div = document.createElement('div');
        $(div).prop("style", style);
        div.innerText = text;
        $("#setup-log").append(div);
    },

    done() {
        $("#setup-loadImg").hide();
    }
};
