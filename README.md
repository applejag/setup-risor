# setup-risor

This action installs [Risor](https://risor.io/) inside a GitHub Action workflow.

## Usage

See [action.yml](./action.yml)

### Basic

```yaml
steps:
  - uses: applejag/setup-risor@v0

  - shell: risor {0}
    run: |
      let orders = [
        {status: "pending", total: 10},
        {status: "pending", total: 30},
        {status: "completed", total: 550},
        {status: "cancelled", total: 90},
        {status: "pending", total: 5},
      ]

      orders.filter(o => o.status == "pending").map(o => o.total).reduce(0, (a, b) => a + b)
```

## Caching

This action caches the Risor binary by default.
It uses [@actions/tool-cache](https://github.com/actions/toolkit/tree/main/packages/tool-cache),
which stores cache differently than the [actions/cache](https://github.com/actions/cache)
action.

Tool-cache is stored on a per-host basis, instead of on a per-repo basis.
This means that you might get a lot of cache-misses, but that's because your
jobs are being run on different action runner hosts.
It also means that the cache won't be visible in the "Caches" view inside
your repository's "Actions" tab.

It also means that if you're using self-hosted runners, then you need to make
sure you [configure them to make use of hosted tool cache](https://docs.github.com/en/enterprise-server@3.11/admin/github-actions/managing-access-to-actions-from-githubcom/setting-up-the-tool-cache-on-self-hosted-runners-without-internet-access#about-the-included-setup-actions-and-the-runner-tool-cache)

## License

This repository is licensed under the MIT license.

It is heavily inspired by the [helmfile/helmfile-action](https://github.com/helmfile/helmfile-action)
and [azure/setup-helm](https://github.com/Azure/setup-helm) actions.
