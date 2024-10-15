const fsp = require("fs").promises;

const createFile = async (fileID) => {
  await fsp.mkdir(fileID);
  await fsp.writeFile(fileID + "/index.html", "");
  await fsp.mkdir(fileID + "/images");
};