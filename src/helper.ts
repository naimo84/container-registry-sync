import { parse, format } from "url";
import pick from "101/pick.js";

export function parseDockerHost(host: string | string[]) {
    var parsed = parse(host as string);
    var out: any = {};
    if (parsed.host) {
        if (!!parsed?.protocol?.indexOf('unix')) {
            out.socketPath = format(pick('host', 'path')(parsed));
        }
        else {
            if (parsed.protocol === 'tcp:') parsed.protocol = 'http:';
            out.host = format(pick('protocol', 'hostname')(parsed));
            out.port = parsed.port || 2375;
        }
    }
    else if (host[0] === '/') {
        out.socketPath = host;
    }
    else {
        if (parsed.protocol === 'tcp:') parsed.protocol = 'http:';
        //@ts-ignore
        parsed = parse('http://' + host);
        out.host = format(pick('protocol', 'hostname')(parsed));
        out.port = parsed.port || 2375;
    }
    return out;
}
