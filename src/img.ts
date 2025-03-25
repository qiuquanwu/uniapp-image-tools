// 声明uni-app扩展类型
declare const plus: {
  io: {
    convertAbsoluteFileSystem: (path: string) => string;
    resolveLocalFileSystemURL: (
      path: string,
      success: (entry: any) => void,
      fail?: (error: any) => void
    ) => void;
    FileReader: new () => {
      onload: (data: any) => void;
      onerror: (error: any) => void;
      readAsDataURL: (file: any) => void;
    };
  };
  os: {
    name: string;
  };
  runtime: {
    innerVersion: string;
  };
  nativeObj: {
    Bitmap: new (id: string) => {
      loadBase64Data: (
        data: string,
        success: () => void,
        fail: (error: any) => void
      ) => void;
      save: (
        path: string,
        options: any,
        success: () => void,
        fail: (error: any) => void
      ) => void;
      clear: () => void;
    };
  };
};

// 声明微信小程序类型
declare const wx: {
  env: {
    USER_DATA_PATH: string;
  };
  canIUse: (api: string) => boolean;
  getFileSystemManager: () => {
    readFile: (options: {
      filePath: string;
      encoding: "base64";
      success: (res: { data: string }) => void;
      fail: (error: any) => void;
    }) => void;
    writeFile: (options: {
      filePath: string;
      data: string;
      encoding: "base64";
      success: () => void;
      fail: (error: any) => void;
    }) => void;
  };
};

/**
 * 转换文件路径为本地文件系统路径
 * @param {string} path - 原始文件路径
 * @returns {string} 转换后的本地文件路径
 */
function getLocalFilePath(path: string): string {
  if (
    path.indexOf("_www") === 0 ||
    path.indexOf("_doc") === 0 ||
    path.indexOf("_documents") === 0 ||
    path.indexOf("_downloads") === 0
  ) {
    return path;
  }
  if (path.indexOf("file://") === 0) {
    return path;
  }
  if (path.indexOf("/storage/emulated/0/") === 0) {
    return path;
  }
  if (path.indexOf("/") === 0) {
    // 为了确保 'plus' 不会报错，我们可以在使用之前检查它是否存在
    if (
      typeof plus === "object" &&
      typeof plus.io === "object" &&
      typeof plus.io.convertAbsoluteFileSystem === "function"
    ) {
      var localFilePath = plus.io.convertAbsoluteFileSystem(path);
    } else {
      var localFilePath = path;
    }
    if (localFilePath !== path) {
      return localFilePath;
    } else {
      path = path.substr(1);
    }
  }
  return "_www/" + path;
}

/**
 * 从DataURL提取Base64数据
 * @param {string} str - DataURL字符串
 * @returns {string} 纯Base64数据
 */
function dataUrlToBase64(str: string): string {
  const array: string[] = str.split(",");
  return array[array.length - 1];
}

let index: number = 0;
/**
 * 生成唯一文件ID
 * @returns {string} 基于时间戳的唯一文件ID
 */
function getNewFileId(): string {
  return Date.now() + String(index++);
}

/**
 * 比较版本号大小
 * @param {string} v1 - 版本号1
 * @param {string} v2 - 版本号2
 * @returns {boolean} 是否v1 > v2
 */
function biggerThan(v1: string, v2: string): boolean {
  const v1Array: string[] = v1.split(".");
  const v2Array: string[] = v2.split(".");
  var update = false;
  for (var index = 0; index < v2Array.length; index++) {
    var diff = Number(v1Array[index]) - Number(v2Array[index]);
    if (diff !== 0) {
      update = diff > 0;
      break;
    }
  }
  return update;
}

/**
 * 将文件路径转换为Base64格式
 * @param {string} path - 文件路径
 * @returns {Promise<string>} 返回Base64数据的Promise
 */
export function pathToBase64(path: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    // 添加类型断言处理环境变量

    if (typeof window === "object" && "document" in window) {
      if (typeof FileReader === "function") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
          if (this.status === 200) {
            let fileReader = new FileReader();
            fileReader.onload = function (e: any) {
              resolve(e.target.result);
            };
            fileReader.onerror = reject;
            fileReader.readAsDataURL(this.response);
          }
        };
        xhr.onerror = reject;
        xhr.send();
        return;
      }
      var canvas = document.createElement("canvas");
      var c2x = canvas.getContext("2d");
      var img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        c2x?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
        canvas.height = canvas.width = 0;
      };
      img.onerror = reject;
      img.src = path;
      return;
    }

    if (typeof plus === "object") {
      plus.io.resolveLocalFileSystemURL(
        getLocalFilePath(path),
        function (entry) {
          entry.file(
            function (file: any) {
              var fileReader = new plus.io.FileReader();
              fileReader.onload = function (data) {
                resolve(data.target.result);
              };
              fileReader.onerror = function (error) {
                reject(error);
              };
              fileReader.readAsDataURL(file);
            },
            function (error: any) {
              reject(error);
            }
          );
        },
        function (error) {
          reject(error);
        }
      );
      return;
    }

    if (typeof wx === "object" && wx.canIUse("getFileSystemManager")) {
      wx.getFileSystemManager().readFile({
        filePath: path,
        encoding: "base64",
        success: function (res) {
          resolve("data:image/png;base64," + res.data);
        },
        fail: function (error) {
          reject(error);
        },
      });
      return;
    }
    reject(new Error("not support"));
  });
}

/**
 * 将Base64数据保存为文件路径
 * @param {string} base64 - Base64字符串
 * @returns {Promise<string>} 返回文件路径的Promise
 */
export function base64ToPath(base64: any): Promise<string> {
  return new Promise(function (resolve, reject) {
    // 添加类型断言处理环境变量

    if (typeof window === "object" && "document" in window) {
      base64 = base64.split(",");
      var type = base64[0].match(/:(.*?);/)?.[1];
      var str = atob(base64[1]);
      var n = str.length;
      var array = new Uint8Array(n);
      while (n--) {
        array[n] = str.charCodeAt(n);
      }
      return resolve(
        (window.URL || window.webkitURL).createObjectURL(
          new Blob([array], { type: type })
        )
      );
    }
    var extName = base64.split(",")[0].match(/data\:\S+\/(\S+);/);
    if (extName) {
      extName = extName[1];
    } else {
      reject(new Error("base64 error"));
    }
    var fileName = getNewFileId() + "." + extName;

    if (typeof plus === "object") {
      var basePath = "_doc";
      var dirPath = "uniapp_temp";
      var filePath = basePath + "/" + dirPath + "/" + fileName;
      if (
        !biggerThan(
          plus.os.name === "Android" ? "1.9.9.80627" : "1.9.9.80472",
          plus.runtime.innerVersion
        )
      ) {
        plus.io.resolveLocalFileSystemURL(
          basePath,
          function (entry) {
            entry.getDirectory(
              dirPath,
              {
                create: true,
                exclusive: false,
              },
              function (entry: any) {
                entry.getFile(
                  fileName,
                  {
                    create: true,
                    exclusive: false,
                  },
                  function (entry: any) {
                    entry.createWriter(function (writer: any) {
                      writer.onwrite = function () {
                        resolve(filePath);
                      };
                      writer.onerror = reject;
                      writer.seek(0);
                      writer.writeAsBinary(dataUrlToBase64(base64 as string));
                    }, reject);
                  },
                  reject
                );
              },
              reject
            );
          },
          reject
        );
        return;
      }
      var bitmap = new plus.nativeObj.Bitmap(fileName);
      bitmap.loadBase64Data(
        base64,
        function () {
          bitmap.save(
            filePath,
            {},
            function () {
              bitmap.clear();
              resolve(filePath);
            },
            function (error) {
              bitmap.clear();
              reject(error);
            }
          );
        },
        function (error) {
          bitmap.clear();
          reject(error);
        }
      );
      return;
    }

    if (typeof wx === "object" && wx.canIUse("getFileSystemManager")) {
      var filePath = wx.env.USER_DATA_PATH + "/" + fileName;
      wx.getFileSystemManager().writeFile({
        filePath: filePath,
        data: dataUrlToBase64(base64),
        encoding: "base64",
        success: function () {
          resolve(filePath);
        },
        fail: function (error) {
          reject(error);
        },
      });
      return;
    }
    reject(new Error("not support"));
  });
}
