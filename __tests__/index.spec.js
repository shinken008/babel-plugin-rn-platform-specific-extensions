/* eslint-disable */

import pluginTester from "babel-plugin-tester";
import platformSpecific from "../index";
import fs from "fs";
import nodePath from "path";

let spy;
let dirnameSpy;

const styleFileName = nodePath.join(__dirname, "styles.scss");

pluginTester({
  plugin: platformSpecific,
  pluginName: "babel-plugin-rn-platform-specific-extensions",
  pluginOptions: {
    extensions: [".scss"]
  },
  babelOptions: {
    filename: styleFileName
  },
  snapshot: true,
  tests: [
    {
      title: "Should require ios and android files if they exits",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.ios\.scss/.test(path) || /styles\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require correct files if they exist (two imports)",
      code: `
      import styles from "./styles.scss";
      import other from "./other.scss"
      `,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /(styles|other)\.ios\.scss/.test(path) ||
            /styles\.android\.scss/.test(path) ||
            /other\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require correct files if they exist (multiple imports)",
      code: `
      import styles from "./styles.scss";
      import "./other.scss";
      import "./foo.scss";
      import something from "./somewhere.scss";
      `,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /(styles|other)\.ios\.scss/.test(path) ||
            /(styles|somewhere)\.android\.scss/.test(path) ||
            /other\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require ios and native files if they exits",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.ios\.scss/.test(path) || /styles\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require android and native files if they exits",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.android\.scss/.test(path) ||
            /styles\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require ios and non prefixed file",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return /styles\.ios\.scss/.test(path);
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require android and non prefixed file",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return /styles\.android\.scss/.test(path);
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require native file if it exists",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return /styles\.native\.scss/.test(path);
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should preserve import name and filename transforming names",
      code: `import myStyles from "./myStylesFile.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /myStylesFile\.ios\.scss/.test(path) ||
            /myStylesFile\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should not touch import if the files do not exist",
      code: `import styles from "./styles.scss"`
    },
    {
      title:
        "Should transform import if path.dirname returns the same folder than fs.existsSync",
      code: `import styles from "./styles.scss"`,
      setup() {
        dirnameSpy = jest
          .spyOn(nodePath, "dirname")
          .mockImplementation(path => {
            return path.replace(
              styleFileName,
              nodePath.join(__dirname, "src/foo")
            );
          });
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /src\/foo\/styles\.ios\.scss/.test(path) ||
            /src\/foo\/styles\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        dirnameSpy.mockRestore();
        spy.mockRestore();
      }
    },
    {
      title:
        "Should not touch import if path.dirname returns a different folder than fs.existsSync",
      code: `import styles from "./styles.scss"`,
      setup() {
        dirnameSpy = jest
          .spyOn(nodePath, "dirname")
          .mockImplementation(path => {
            return path.replace(
              styleFileName,
              nodePath.join(__dirname, "src/foo")
            );
          });
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /src\/bar\/styles\.ios\.scss/.test(path) ||
            /src\/bar\/styles\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        dirnameSpy.mockRestore();
        spy.mockRestore();
      }
    },
    {
      title:
        "Should require ios and android files if they exits (side-effects-only import case)",
      code: `import "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.ios\.scss/.test(path) || /styles\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should require ios and native files if they exits (side-effects-only import case)",
      code: `import "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.ios\.scss/.test(path) || /styles\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should require android and native files if they exits (side-effects-only import case)",
      code: `import "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.android\.scss/.test(path) ||
            /styles\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should require ios and non prefixed file (side-effects-only import case)",
      code: `import "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return /styles\.ios\.scss/.test(path);
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should require android and non prefixed file (side-effects-only import case)",
      code: `import "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return /styles\.android\.scss/.test(path);
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should require native file if it exists (side-effects-only import case)",
      code: `import "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return /styles\.native\.scss/.test(path);
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }
  ]
});

pluginTester({
  plugin: platformSpecific,
  pluginName: "babel-plugin-rn-platform-specific-extensions",
  pluginOptions: {
    extensions: [".txt", ".json"]
  },
  snapshot: true,
  tests: [
    {
      title: "Should work with other extension types (.txt)",
      code: `import txt from "./something.txt"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /something\.ios\.txt/.test(path) ||
            /something\.android\.txt/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should work with other extension types (.json)",
      code: `import json from "./something.json"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /something\.ios\.json/.test(path) ||
            /something\.android\.json/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should not react to file types that are not defined in plugin options (.scss)",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.ios\.scss/.test(path) || /styles\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should work with other extension types (.txt) (side-effects-only import case)",
      code: `import "./something.txt"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /something\.ios\.txt/.test(path) ||
            /something\.android\.txt/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title:
        "Should work with other extension types (.json) (side-effects-only import case)",
      code: `import "./something.json"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /something\.ios\.json/.test(path) ||
            /something\.android\.json/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }
  ]
});

pluginTester({
  plugin: platformSpecific,
  pluginName: "babel-plugin-rn-platform-specific-extensions",
  pluginOptions: {},
  snapshot: true,
  tests: [
    {
      title: "Should throw if no extensions defined in options",
      code: `import styles from "./styles.scss"`,
      error: "You have not specified any extensions in the plugin options.",
      setup() {},
      teardown() {}
    }
  ]
});

pluginTester({
  plugin: platformSpecific,
  pluginName: "babel-plugin-rn-platform-specific-extensions",
  pluginOptions: {
    platforms: ['native', 'os', 'rn'],
    extensions: [".scss"]
  },
  babelOptions: {
    filename: styleFileName
  },
  snapshot: true,
  tests: [
    {
      title: "Should require native files if they exits",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.native\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require ios or android files if they exits",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.ios\.scss/.test(path) ||
            /styles\.android\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    },
    {
      title: "Should require rn files if they exits",
      code: `import styles from "./styles.scss"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /styles\.rn\.scss/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }
  ]
});

pluginTester({
  plugin: platformSpecific,
  pluginName: "babel-plugin-rn-platform-specific-extensions",
  pluginOptions: {
    extensions: [".ts"],
    omitExtensions: [".tsx", ".jsx", ".ts", ".js"]
  },
  snapshot: true,
  tests: [
    {
      title: "Should require rn ts files if they exits",
      code: `import app from "./app"; import 'a'`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /app\.rn\.tsx$/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }, {
      title: "Should not modify if they require node_modules",
      code: `import app from "app"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /app\.rn\.tsx$/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }, {
      title: "Should require directory index file if the files do not exist ",
      code: `import app from "./app"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /app\/index\.rn\.tsx$/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }, {
      title: "Should require directory index file when source end with `/`",
      code: `import app from "./app/"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /app\/index\.rn\.tsx$/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }, {
      title: "Should require absolute file",
      code: `import app from "/app"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /app\.rn\.tsx$/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }, {
      title: "Should require absolute directory index file",
      code: `import app from "/app"`,
      setup() {
        spy = jest.spyOn(fs, "existsSync").mockImplementation(path => {
          return (
            /app\/index.native.ts$/.test(path)
          );
        });
      },
      teardown() {
        spy.mockRestore();
      }
    }
  ]
});
