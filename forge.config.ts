import type { ForgeConfig } from "@electron-forge/shared-types";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';



const _config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        ignore: [
            /^\/src/,
            /^\/esbuid\.mts$/,
             /^\/forge\.config\.ts$/,
            /^\/tsconfig\.json$/,
        ],
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({}),
        new MakerZIP({}, ['darwin']),
        new MakerRpm({}),
        new MakerDeb({}),
    ],
    plugins: [
        {
            name: "@electron-forge/plugin-auto-unpack-natives",
            config: {},
        },
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
}

export default _config;