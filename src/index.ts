import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import { HttpClient } from '@actions/http-client';
import { Endpoints } from '@octokit/types';

// Used as fallback if getting latest version fails.
const latestKnownVersion = 'v2.0.1';

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
    core.info(`Did not find Risor@${version} in tool cache. Will try download it.`);
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

async function extract(file: string) {
  if (file.endsWith('.zip')) {
    return tc.extractZip(file);
  }
  return tc.extractTar(file);
}

async function findLatestVersion(): Promise<string> {
  try {
    const httpClient = new HttpClient();
    const response = await httpClient.getJson<
      Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data']
    >('https://github.com/deepnoodle-ai/risor/releases/latest');
    const version = response.result?.tag_name;
    if (!version) {
      core.warning(`No latest Risor release was found. Raw response: ${response.result}`);
      return latestKnownVersion;
    }
    core.info(`Found latest version of Risor: ${version}`);
    return version;
  } catch (err) {
    core.warning(`Error while fetching latest Risor release: ${err?.toString()}`);
    return latestKnownVersion;
  }
}

const LINUX: NodeJS.Platform = 'linux';
const MAC_OS: NodeJS.Platform = 'darwin';
const WINDOWS: NodeJS.Platform = 'win32';
const ARM64 = 'arm64';

export function getDownloadUrl(version: string): string {
  const arch = core.platform.arch;
  const operatingSystem = core.platform.platform;

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
