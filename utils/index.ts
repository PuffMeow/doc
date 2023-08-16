import fs from 'fs-extra';
import path from 'path';

const fileWithNumSortReg = /[0-9]+.\w*/;

/** 获取根目录的 docs 文件夹下的所有路径 */
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
    .sort((a, b) => {
      // 根据文件名前缀的数据来排序
      let aNum = 0;
      let bNum = 0;
      if (fileWithNumSortReg.test(a) && fileWithNumSortReg.test(b)) {
        aNum = Number(a.split('.')[0]);
        bNum = Number(b.split('.')[0]);
      }
      return aNum - bNum;
    })
    .map((dir) => {
      const dirPath = path.resolve(rootDirPath, dir);

      return {
        filePath: dirPath,
        fileName: path.basename(dirPath),
      };
    });

  return items.map((dirPath) => {
    const pathArray = dirPath.filePath.split(path.sep);

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
    path.resolve(__dirname, '../docs', rootDirName)
  );

  return dirs.map((dir) => {
    return {
      text: dir.fileName,
      collapsible: true,
      items: getItemsPath(dir.filePath, rootDirName),
    };
  });
}
