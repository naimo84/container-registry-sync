import { parseDockerHost } from "./helper";
import Dockerode from 'dockerode';
import { getRepos, getTags } from "@snyk/docker-registry-v2-client";
import pDebounce from 'p-debounce';
export interface SyncOptions {
  tasks: any;
  filter: any;
  dryrun: any;
  host: string | string[];
  bail: any;
}
export class RegistrySync {
  dryrun: any;
  docker: Dockerode;
  bailOnError: any;
  filter: any;
  tasks: any;

  constructor(opts: SyncOptions) {
    this.dryrun = opts.dryrun;
    this.bailOnError = opts.bail;
    this.tasks = opts.tasks;
    opts.host = opts.host || process.env.DOCKER_HOST || '/var/run/docker.sock';

    this.docker = new Dockerode(parseDockerHost(opts.host));
  }

  async start() {
    let ret = [];

    for (const task of this.tasks) {
      await this.docker.checkAuth({
        username: task.target.username,
        password: task.target.password,
        serveraddress: task.target.registry
      })

      const repos = await getRepos(task.source.registry, task.source.username, task.source.password);

      for (let mapping of task.mappings) {
        for (let repo of repos) {
          const filterRegExp = new RegExp(mapping.from);
          const filterMatch = repo.match(filterRegExp);
          if (new RegExp(mapping.excludeRepo).test(repo)) {
            continue;
          }
          if (filterMatch && filterMatch.length > 0) {
            const tags = await getTags(task.source.registry, repo, task.source.username, task.source.password);

            for (const tag of tags) {
              try {
                let found = false;
                for (const excludeTag of mapping.excludeTags.split(",")) {
                  if (new RegExp(excludeTag).test(tag)) {
                    found = true;
                  }
                }
                if (found) continue;

                const dockerpull = await this.docker.pull(`${task.source.registry}/${repo}:${tag}`, { "disable-content-trust": "false" });

                await new Promise((resolve, reject) => {
                  this.docker.modem.followProgress(dockerpull, async (err: any, res: any) => {
                    console.log(`${task.source.registry}/${repo}:${tag} pulled`);
                    err ? reject(err) : resolve(res);
                  });
                })

                let image = this.docker.getImage(`${task.source.registry}/${repo}:${tag}`);

                const newRepo = repo.replace(new RegExp(mapping.from), mapping.to);

                // await pDebounce(() => {
                image.tag({ "repo": `${task.target.registry}/${newRepo}`, "tag": tag });
                console.log(`${task.target.registry}/${newRepo}:${tag} tagged`);
                //}, 200);


                let newImage = this.docker.getImage(`${task.target.registry}/${newRepo}:${tag}`);
                // await pDebounce(() => {
                newImage.push({
                  authconfig: {
                    username: task.target.username,
                    password: task.target.password,
                    serveraddress: task.target.registry
                  }
                });
                console.log(`${task.target.registry}/${newRepo}:${tag} pushed`);
                //}, 200);


              } catch (err) {
                console.log(`${task.target.registry}/${repo}:${tag} failed`);
              }
            }

            ret.push({
              repo,
              tags
            });
          }
        }

        console.log(`${mapping.from} finished`);
      }
      console.log(`${task.source} finished`);
    }

    return ret;
  }
}
