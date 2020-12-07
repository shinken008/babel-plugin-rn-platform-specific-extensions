require('core-js/fn/array/flat-map')
const fs = require('fs')
const nodePath = require('path')
const babelTemplate = require('@babel/template').default

const DEFAULT_PLATFORMS = ['os', 'native', 'rn']
const DEFAULT_OMIT_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']
const DEFAULT_INCLUDE = []

const isOS = platform => platform === 'ios' || platform === 'android'

function Node (val) {
  this.val = val
  this.next = null
}

function getArrayOpt (state, name, defaultValue) {
  return state.opts &&
    Array.isArray(state.opts[name])
    ? state.opts[name] : defaultValue
}

function toType (value) {
  return Object.prototype.toString.call(value).slice(8, -1)
}

/**
 * Attempt to lookup `path` within `paths`.
 * @param {String} path
 * @param {Array} paths
 * @return {String|Null} findPath
 */
function includeLookup (path, paths) {
  let i = paths.length
  while (i--) {
    const lookup = paths[i]
    if (toType(lookup) === 'String') {
      if (path.includes(lookup)) {
        return path
      }
    }
    if (toType(lookup) === 'Object') {
      for (const key of Object.keys(lookup)) {
        if (path.includes(key)) {
          return lookup[key]
        }
      }
    }
  }
  return null
}

module.exports = function (babel) {
  let currentFilePath
  let currentFileDir
  let isNodeModulesFilePath = false
  let isPlatformImportInserted = false
  return {
    name: 'rn-platform-specific-extensions',
    visitor: {
      Program (path, state) {
        currentFilePath = state.file.opts.filename
        currentFileDir = nodePath.dirname(currentFilePath)
        isNodeModulesFilePath = /node_modules/.test(currentFilePath)
        isPlatformImportInserted = false
      },
      ImportDeclaration: function importResolver (path, state) {
        const node = path.node
        let fileName = node.source.value
        // distinguish './someModule', '../someModule' is relative and 'someModule' is absolute
        const isRelativeImport = /^\.+\//.test(fileName)
        const include = getArrayOpt(state, 'include', DEFAULT_INCLUDE)
        const includePath = includeLookup(currentFilePath, include)
        // modify file directory
        if (includePath) {
          currentFileDir = nodePath.dirname(includePath)
        }

        if (!includePath) {
          // default do not handle node_modules
          if (isNodeModulesFilePath || !isRelativeImport) {
            return
          }
        }

        const extensions = getArrayOpt(state, 'extensions')
        if (!extensions) {
          throw new Error(
            'You have not specified any extensions in the plugin options.'
          )
        }
        const omitExtensions = getArrayOpt(state, 'omitExtensions', DEFAULT_OMIT_EXTENSIONS)

        const defaultPlatforms = getArrayOpt(state, 'platforms', DEFAULT_PLATFORMS)
        if (defaultPlatforms.find(platform => (platform === 'ios' || platform === 'android'))) {
          console.warn('Please use `os` instead of `ios` or `android` platforms in the plugin options')
        }

        const platforms = defaultPlatforms
          .filter(platform => !isOS(platform))
          .flatMap(platform => {
            if (platform === 'os') {
              return ['ios', 'android']
            }
            return platform
          })

        let ext = nodePath.extname(fileName)
        let specifier = node.specifiers[0]

        const matchedExtensions = extensions.filter(e => `${e}` === ext)
        const matched = !!matchedExtensions.length

        let shouldMakePlatformSpecific = matched
        // handle some omit extensions like .js
        if (!matched) {
          // Strategies for omitted expansion
          // if ext exists extensions and omitExtensions then excute
          // omits [.tsx,.ts,.jsx,.js]. loop omits(exist `someModule.${platform}.${omit}`) then get the fileName and ext
          for (const extension of omitExtensions) {
            const omitPlatform = platforms.find(platform => {
              const filePath = nodePath.resolve(currentFileDir, `${fileName}.${platform}${extension}`)
              const result = fs.existsSync(filePath)
              return result
            })
            if (omitPlatform) {
              fileName = `${fileName}${extension}`
              ext = extension
              shouldMakePlatformSpecific = true
              break
            }
          }
        }

        if (!shouldMakePlatformSpecific) {
          return
        }

        const filesMap = new Map()
        const ifExistsMap = new Map()
        // use a list node store exist platform for easy get next exist platform
        // store list node head
        let existListNode = null
        let existListNodeCurrent = null
        let currentIndex = 0

        platforms.forEach(platform => {
          const platformFileName = fileName.replace(ext, `.${platform}${ext}`)
          const platformFileExist = fs.existsSync(nodePath.resolve(currentFileDir, platformFileName))

          filesMap.set(platform, platformFileName)
          ifExistsMap.set(platform, platformFileExist)
          if (platformFileExist) {
            if (currentIndex === 0) {
              // store list node head
              existListNode = new Node(platform)
              existListNodeCurrent = existListNode
            } else {
              existListNodeCurrent.next = new Node(platform)
              existListNodeCurrent = existListNodeCurrent.next
            }
            currentIndex = currentIndex + 1
          }
        })

        let ast = null
        function astTernary (platform, valueTrue, valueFalse) {
          // Omit the var assignment when specifier is empty (global import case, executing for the side-effects only).
          const assignee = specifier ? `var ${specifier.local.name} = ` : ''
          const platformStr = `import { Platform } from 'react-native';`
          const platformImport = !isPlatformImportInserted ? platformStr : ''

          if (platformImport) {
            isPlatformImportInserted = true
          }

          return babelTemplate.ast(
            platformImport +
            assignee +
            `Platform.OS === '${platform}' ? require('${valueTrue}').default : require('${valueFalse}').default;`
          )
        }

        // ios, andriod use `os` platform,
        // ios andriod do not distinguish priority, so you need to use a configuration to bind together, according to Platform.OS dynamic require ios, andriod file
        for (const [platform, exist] of ifExistsMap) {
          if (exist) {
            if (isOS(platform)) {
              // ['ios', 'android', 'native', 'rn']
              // use a list store exist relationship. For example: existListNode = Node { val, next: Node }
              // find current platform node
              // if it has next node then require next node value,
              // else require node source value
              // finally break the loop
              let current = null
              let next = null
              while (!current) {
                if (existListNode.val === platform) {
                  current = existListNode
                  next = existListNode.next
                  break
                }
                existListNode = existListNode.next
              };

              let anotherFile
              if (next) {
                anotherFile = filesMap.get(next.val)
              } else {
                anotherFile = fileName
              }
              ast = astTernary(platform, filesMap.get(platform), anotherFile)
              path.replaceWithMultiple(ast)
              break
            } else {
              node.source.value = filesMap.get(platform)
              break
            }
          }
        }
      }
    }
  }
}
