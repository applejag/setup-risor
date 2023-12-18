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
      array := ["gophers", "are", "burrowing", "rodents"]

      sentence := array | strings.join(" ") | strings.to_upper

      print(sentence)
```

## Caching

This action caches the Risor binary by default.
It uses [@actions/tool-cache](https://github.com/actions/toolkit/tree/main/packages/tool-cache),
which stores cache differently than the [actions/cache](https://github.com/actions/cache)
action.

## License

This repository is licensed under the MIT license.

It is heavily inspired by the [helmfile/helmfile-action](https://github.com/helmfile/helmfile-action)
and [azure/setup-helm](https://github.com/Azure/setup-helm) actions.
