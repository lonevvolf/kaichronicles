
/**
 * A HTTP cookie.
 * Taken from https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
 */
export class Cookie {

    /**
     * Cookie name
     */
    public name: string;

    public constructor(name: string) {
        this.name = name;
    }

    /**
     *
     */
    public getValue(): string|null {
        const nameEQ = this.name + "=";

        const currentCookies = document.cookie.split(";");
        for (let c of currentCookies) {
            // Left trim
            while (c.charAt(0) === " ") {
                c = c.substring( 1 , c.length );
            }

            if (c.indexOf(nameEQ) === 0) {
                return c.substring( nameEQ.length , c.length );
            }
        }
        return null;
    }

    public setValue( value: string , days: number ) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
            expires = "; Expires=" + date.toUTCString();
        }
        document.cookie = this.name + "=" + (value || "")  + expires + "; Path=/";
    }

    public delete() {
        document.cookie = this.name + "=; Path=/; Max-Age=-99999999;";
    }

}
