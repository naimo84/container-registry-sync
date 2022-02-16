# Container Registry Sync

## Synopsis

Container Registry Sync (crs) lets you sync Docker images between registries, public or private. Several sync tasks can be defined, as one-off or periodic tasks (see Configuration section). An image is synced by using a sync relay, a local Docker daemon. When using the latter, the image is first pulled from the source, then tagged for the destination, and finally pushed there.

## :sparkling_heart: Support my projects

I open-source almost everything I can, and I try to reply to everyone needing help using these projects. Obviously,
this takes time. You can integrate and use these projects in your applications _for free_! You can even change the source code and redistribute (even resell it).

Thank you to all my backers!
### People

- [fflorent](https://github.com/fflorent)
- [Speeedy0815](https://github.com/Speeedy0815)
- Ralf S.
- Enno L.
- Jürgen G.
- Mark MC G.
- Kay-Uwe M.
- Craig O.
- Manuel G.

### Become a backer

However, if you get some profit from this or just want to encourage me to continue creating stuff, there are few ways you can do it:

- Starring and sharing the projects you like :rocket:
- **Crypto.&#65279;com** &nbsp;—&nbsp; Use my referral link https://crypto.com/app/f2smbah8fm to sign up for Crypto.&#65279;com and we both get $25 USD :)  

- [![PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=for-the-badge)][paypal-donations] &nbsp; — &nbsp; You can make one-time donations via PayPal. I'll probably buy a ~~coffee~~ tea. :tea:
- [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T412CXA) &nbsp;—&nbsp; I'll buy a ~~tea~~ coffee. :coffee: :wink:

Thanks! :heart:

## Usage

```sh
Usage: registry-sync or crs [options]

  Options:

    -h, --help      output usage information
    -V, --version   output the version number
    -d, --dryrun    Enable dryrun (simulate pushes and pulls). Flag.
    -h, --host <s>  Docker host. Default: $DOCKER_HOST or unix:///var/run/docker.sock
    -b --bail       Exit process on first error. Flag.
    --config <s>    Path to config yaml.
```

## Config File

```yaml
docker:
  # Docker host to use as the relay
  dockerhost: unix:///var/run/docker.sock
  # Docker API version to use, defaults to 1.24
  api-version: 1.24

# settings for image matching (see below)
lister:
  # maximum number of repositories to list, set to -1 for no limit, defaults to 100
  maxItems: 100
  # for how long a repository list will be re-used before retrieving again;
  # specify as a Go duration value ('s', 'm', or 'h'), set to -1 for not caching,
  # defaults to 1h
  cacheDuration: 1h

# list of sync tasks
tasks:
  - name: task1 # required

    # interval in seconds at which the task should be run; when omitted,
    # the task is only run once at start-up
    interval: 60

    # determines whether for this task, more verbose output should be
    # produced; defaults to false when omitted
    verbose: true

    # 'source' and 'target' are both required and describe the source and
    # target registries for this task:
    #  - 'registry' points to the server; required
    #  - 'username' if required by the registry
    #  - 'password' if required by the registry
    #  - 'skip-tls-verify' determines whether to skip TLS verification for the
    #    registry server (only for 'skopeo', see note below); defaults to false
    source:
      registry: source-registry.acme.com
      username: docker@example.com
      password: CLI-PASSWORD
    target:
      registry: dest-registry.acme.com
      username: docker@example.com
      password: CLI-PASSWORD
      skip-tls-verify: true

    # 'mappings' is a list of 'from':'to' pairs that define mappings of image
    # paths in the source registry to paths in the destination; 'from' is
    # required, while 'to' can be dropped if the path should remain the same as
    # 'from'. Regular expressions are supported in both fields. Additionally, 
    # the tags being synced for a mapping can
    # be limited by providing a 'tags' list. This list may contain semver and
    # regular expressions filters. When omitted, all image tags are
    # synced.
    mappings:
      - from: test/image
        to: archive/test/image
        tags: ['0.1.0', '0.1.1']
      - from: test/another-image
```



## Docker Configuration 

### docker.sock

- ***Using in a Docker-Container***

The container must have access to the docker.sock, so you have to add the docker-group ID to the container with <pre>docker run ... --group-add 250</pre> the ID 250 may be different on your system.

### Exposing TCP-Daemon port

- ***hostname*** hostname of docker (e.g. "localhost")
- ***port*** port of docker (e.g. "2375")

In order to expose the docker-engine TCP daemon, you have to do the following:

- ***Docker for Windows / Docker Desktop:*** 
<br>Under Settings / General check "Expose daemon on tcp://localhost:2375 without TLS"

![DockerWindowsSettings.png](https://github.com/naimo84/node-red-contrib-dockerode/raw/master/examples/DockerWindowsSettings.png)

- ***Docker-CE***

See https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd

or: 

```
# File: /etc/default/docker
# Use DOCKER_OPTS to modify the daemon startup options.
#DOCKER_OPTS=""
DOCKER_OPTS="-H tcp://127.0.0.1:2375 -H unix:///var/run/docker.sock"
```

or: 

```
# File: /lib/systemd/system/docker.service
ExecStart=/usr/bin/docker daemon -H fd:// -H tcp://0.0.0.0:2375
```

## Credits

- special thanks to https://github.com/xelalexv/dregsy for the whole idea :) But I prefer NodeJS over Go ;)

[badge_paypal]: https://img.shields.io/badge/Donate-PayPal-blue.svg
[paypal-donations]: https://paypal.me/NeumannBenjamin

