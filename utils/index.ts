import fs from 'fs-extra';
import path from 'path';

function getDirsPathInRoot(rootDirName: string) {
  return fs
    .readdirSync(rootDirName)
    .filter((filePath) => !filePath.endsWith('.md'))
    .map((dir) => {
      const filePath = path.resolve(rootDirName, dir);
      return {
        filePath,
        fileName: path.basename(dir),
      };
    });
}

function getItemsPath(rootDirPath: string, rootDirName: string) {
  const items = fs
    .readdirSync(rootDirPath)
    .filter((path) => path.endsWith('.md'))
    .map((dir) => {
      const dirPath = path.resolve(rootDirPath, dir);

      return {
        filePath: dirPath,
        fileName: path.basename(dirPath),
      };
    });

  return items.map((dirPath) => {
    const pathArray = dirPath.filePath.split('\\');

    const docParentDirNameIdx = pathArray.findIndex(
      (item) => item === rootDirName
    );
    const link = `/${pathArray
      .slice(docParentDirNameIdx)
      .join('/')
      .replace('.md', '')}`;

    return {
      text: dirPath.fileName.replace('.md', ''),
      link,
    };
  });
}

/** 获取 SideBar 配置，填写docs下的一个根目录名称 */
export function getSideBarConfig(rootDirName: string) {
  const dirs = getDirsPathInRoot(
    path.resolve(__dirname, '../docs/', rootDirName)
  );

  return dirs.map((dir) => {
    return {
      text: dir.fileName,
      collapsible: true,
      items: getItemsPath(dir.filePath, rootDirName),
    };
  });
}
