const fs = require("fs");
const nodePath = require("path");
const babelTemplate = require("@babel/template").default;

const isOS = platform => platform === 'ios' || platform === 'android';
const otherOSPlatform = platform => platform === 'ios' ? 'android' : 'ios';

module.exports = function() {
  let isPlatformImportInserted = false;
  return {
    name: "react-native-platform-specific-extensions",
    visitor: {
      Program() {
        isPlatformImportInserted = false;
      },
      ImportDeclaration: function importResolver(path, state) {
        const extensions =
          state.opts &&
          Array.isArray(state.opts.extensions) &&
          state.opts.extensions;

        if (!extensions) {
          throw new Error(
            "You have not specified any extensions in the plugin options."
          );
        }

        const defaultPlatforms =
          state.opts &&
            Array.isArray(state.opts.platforms) && state.opts.platforms.length
            ? state.opts.platforms : ['os', 'native', 'rn'];

        if (defaultPlatforms.find(platform => (platform === 'ios' || platform === 'android'))) {
          console.warn('Please use `os` instead of `ios` or `android` platforms in the plugin options');
        }

        const node = path.node;
        const fileName = node.source.value;
        const ext = nodePath.extname(fileName);
        const matchedExtensions = extensions.filter(e => `.${e}` === ext);
        const shouldMakePlatformSpecific = matchedExtensions.length === 1;

        if (!shouldMakePlatformSpecific) {
          return;
        }

        var specifier = node.specifiers[0];
        const transformedFileName = state.file.opts.filename;
        const currentDir = nodePath.dirname(transformedFileName);

        const filesMap = new Map();
        const isExistsMap = new Map();
        const platforms = defaultPlatforms
          .filter(platform => !isOS(platform))
          .flatMap(platform => {
            if (platform === 'os') {
              return ['ios', 'android'];
            }
            return platform;
          });
        platforms.forEach(platform => {
          const platformFileName = fileName.replace(ext, `.${platform}${ext}`);
          filesMap.set(platform, platformFileName);
          const platformFileExist = fs.existsSync(
            nodePath.resolve(currentDir, platformFileName)
          );
          isExistsMap.set(platform, platformFileExist);
        });

        let ast = null;
        function astTernary(platform, valueTrue, valueFalse) {
          // Omit the var assignment when specifier is empty (global import case, executing for the side-effects only).
          const assignee = specifier ? `var ${specifier.local.name} = ` : "";
          const platformStr = `import { Platform } from "react-native";`;
          const platformImport = !isPlatformImportInserted ? platformStr : "";

          if (platformImport) {
            isPlatformImportInserted = true;
          }

          return babelTemplate.ast(
            platformImport +
              assignee +
              `Platform.OS === "${platform}" ? require("${valueTrue}") : require("${valueFalse}");`
          );
        }

        // ios, andriod use `os` platform,
        // ios andriod do not distinguish priority, so you need to use a configuration to bind together, according to Platform.OS dynamic require ios, andriod file
        for (const [platform, exist] of isExistsMap) {
          if (exist) {
            if (isOS(platform)) {
              ast = astTernary(platform, filesMap.get(platform), filesMap.get(otherOSPlatform(platform)));
              path.replaceWithMultiple(ast);
              break;
            } else {
              node.source.value = filesMap.get(platform);
              break;
            }
          }
        }
      }
    }
  };
};
