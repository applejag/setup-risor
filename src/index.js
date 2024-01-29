const os = require('os');
const http = require('@actions/http-client');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');

// Used as fallback if getting latest version fails.
const latestKnownVersion = 'v1.3.2';

async function run() {
  const cache = core.getBooleanInput('cache');
  var version = core.getInput('version', { required: true });

  if (version === 'latest') {
    version = await findLatestVersion();
  }

  if (cache) {
    const risorDir = tc.find('risor', version);
    if (risorDir) {
      core.info(`Found Risor@${version} in tool cache: ${risorDir}`);
      core.addPath(risorDir);
      return;
    }
    core.info(
      `Did not find Risor@${version} in tool cache. Will try download it.`,
    );
  }

  const downloadUrl = getDownloadUrl(version);
  core.info(`Downloading Risor ${version} from ${downloadUrl}`);
  const downloadPath = await tc.downloadTool(downloadUrl);
  const extractedPath = await extract(downloadPath);

  if (cache) {
    const toolPath = await tc.cacheDir(extractedPath, 'risor', version);
    core.addPath(toolPath);
    core.info(`Cached Risor@${version} in tool cache`);
  } else {
    core.addPath(extractedPath);
  }
}

/**
 * @param {string} file
 */
async function extract(file) {
  if (file.endsWith('.zip')) {
    return tc.extractZip(file);
  }
  return tc.extractTar(file);
}

/**
 * @returns {Promise<string>}
 */
async function findLatestVersion() {
  try {
    const httpClient = new http.HttpClient();
    const response = await httpClient.getJson(
      `https://github.com/risor-io/risor/releases/latest`,
    );
    const version = response.result.tag_name;
    core.info(`Found latest version of Risor: ${version}`);
    return version;
  } catch (err) {
    core.warning(
      `Error while fetching latest Risor release: ${err.toString()}`,
    );
    return latestKnownVersion;
  }
}

const LINUX = 'Linux';
const MAC_OS = 'Darwin';
const WINDOWS = 'Windows_NT';
const ARM64 = 'arm64';

/**
 * @param {string} version
 * @returns {string}
 */
export function getDownloadUrl(version) {
  const arch = os.arch();
  const operatingSystem = os.type();

  switch (true) {
    case operatingSystem == LINUX && arch == ARM64:
      return `https://github.com/risor-io/risor/releases/download/${version}/risor_Linux_arm64.tar.gz`;
    case operatingSystem == LINUX:
      return `https://github.com/risor-io/risor/releases/download/${version}/risor_Linux_x86_64.tar.gz`;

    case operatingSystem == MAC_OS && arch == ARM64:
      return `https://github.com/risor-io/risor/releases/download/${version}/risor_Darwin_arm64.tar.gz`;
    case operatingSystem == MAC_OS:
      return `https://github.com/risor-io/risor/releases/download/${version}/risor_Darwin_x86_64.tar.gz`;

    case operatingSystem == WINDOWS:
    default:
      return `https://github.com/risor-io/risor/releases/download/${version}/risor_Windows_x86_64.zip`;
  }
}

run();
